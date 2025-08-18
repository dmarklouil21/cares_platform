from django.shortcuts import get_object_or_404
from django.db import transaction

from rest_framework import generics, status
from rest_framework import filters
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ValidationError

from apps.pre_enrollment.models import Beneficiary
from apps.patient.models import Patient, CancerDiagnosis
from apps.partners.models import CancerAwarenessActivity
from apps.cancer_screening.models import ScreeningProcedure, ScreeningAttachment, IndividualScreening, PreScreeningForm

# from apps.cancer_screening.models import IndividualScreening, PreScreeningForm
from apps.partners.serializers import CancerAwarenessActivitySerializer
from apps.cancer_screening.serializers import (
  PreScreeningFormSerializer, 
  IndividualScreeningSerializer, 
  ScreeningProcedureSerializer, 
  ScreeningAttachmentSerializer
)

import logging

logger = logging.getLogger(__name__)

class PreScreeningCreateView(generics.CreateAPIView):
  queryset = PreScreeningForm.objects.all()
  serializer_class = PreScreeningFormSerializer
  permission_classes = [IsAuthenticated]

  def perform_create(self, serializer):
    try:
      with transaction.atomic():
        pre_screening_form = serializer.save()
        beneficiary = pre_screening_form.beneficiary

        if not beneficiary:
          raise ValidationError('Beneficiary is required.')

        patient, _ = Patient.objects.get_or_create(beneficiary=beneficiary)
        
        existing_screening = IndividualScreening.objects.filter(patient=patient).exclude(status='Complete').order_by('-created_at').first()

        if existing_screening and existing_screening.status != 'Completed':
          raise ValidationError({'non_field_errors': ['You currently have an ongoing request. Please complete or cancel it before submitting a new one.']})
        
        IndividualScreening.objects.create(
          patient=patient,
          pre_screening_form=pre_screening_form
        )
    except Exception as e:
      logger.error(f"Failed to create PreScreeningForm and related records: {e}")
      raise e
    
class ScreeningProcedureCreateView(generics.CreateAPIView):
  queryset = ScreeningProcedure.objects.all()
  serializer_class = ScreeningProcedureSerializer
  parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated]

  def perform_create(self, serializer):
    try:
      with transaction.atomic():
        beneficiary = get_object_or_404(Beneficiary, user=self.request.user)

        individual_screening = get_object_or_404(
          IndividualScreening, patient__beneficiary=beneficiary
        )
        if individual_screening.screening_procedure:
          raise ValidationError({'non_field_errors': ['You already submitted your screening procedure. Please wait for it\'s feedback before submitting another.']})

        screening_procedure = serializer.save(beneficiary=beneficiary)

        individual_screening.screening_procedure = screening_procedure
        individual_screening.has_patient_response = True
        individual_screening.response_description = 'Submitted screening procedure'
        individual_screening.save()

        pre_screening_form = individual_screening.pre_screening_form

        CancerDiagnosis.objects.create(
          patient=individual_screening.patient,
          diagnosis=pre_screening_form.final_diagnosis,
          date_diagnosed=pre_screening_form.date_of_diagnosis,
          cancer_site=screening_procedure.cancer_site,
          cancer_stage=pre_screening_form.staging,
        )

        attachments = self.request.FILES.getlist('attachments')
        for file in attachments:
          validate_attachment(file)
          ScreeningAttachment.objects.create(
            screening_procedure=screening_procedure,
            file=file
          )

    except Exception as e:
      logger.error(f"Error creating screening procedure: {str(e)}")
      raise e

class CancerAwarenessActivityListView(generics.ListAPIView):
  queryset = CancerAwarenessActivity.objects.all()
  serializer_class = CancerAwarenessActivitySerializer
  permission_classes = [IsAuthenticated]
 
class IndividualScreeningListView(generics.ListAPIView):
  serializer_class = IndividualScreeningSerializer
  permission_classes = [IsAuthenticated]

  def get_queryset(self):
    user = self.request.user
    beneficiary = get_object_or_404(Beneficiary, user=user)
    # patient_id = self.kwargs.get("patient_id")
    return IndividualScreening.objects.filter(patient__beneficiary=beneficiary)

class IndividualScreeningDetailView(generics.RetrieveAPIView):
  queryset = IndividualScreening.objects.all()
  serializer_class = IndividualScreeningSerializer
  permission_classes = [IsAuthenticated]
  lookup_field = 'id'

class IndividualScreeningCancelRequestView(generics.DestroyAPIView):
  queryset = IndividualScreening.objects.all()
  serializer_class = IndividualScreeningSerializer
  lookup_field = 'id'

  permission_classes = [IsAuthenticated]

class LOAAttachmentUploadView(APIView):
  parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated]

  def patch(self, request, procedure_id):
    screening_procedure = get_object_or_404(ScreeningProcedure, id=procedure_id)
    individual_screening = get_object_or_404(IndividualScreening, screening_procedure=screening_procedure)

    if individual_screening.has_patient_response:
      raise ValidationError ({'non_field_errors': ['You can only submit once. Please wait for it\'s feedback before submitting again.']})
    
    attachments = request.FILES.getlist('attachments')

    individual_screening.has_patient_response = True
    individual_screening.response_description = 'Submitted (LOA) Letter of Authority'
    individual_screening.save()

    for file in attachments:
      validate_attachment(file)
      ScreeningAttachment.objects.create(
        screening_procedure=screening_procedure,
        file=file
      )

    return Response({"message": "Attachments updated successfully."}, status=status.HTTP_200_OK)

class ResultAttachmentUploadView(APIView):
  parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated]

  def patch(self, request, screening_id):
    individual_screening = get_object_or_404(IndividualScreening, id=screening_id)
    # individual_screening = get_object_or_404(IndividualScreening, screening_procedure=screening_procedure)

    if individual_screening.uploaded_result and not request.user.is_superuser:
      raise ValidationError ({'non_field_errors': ['You can only submit once. Please wait for it\'s feedback before submitting again.']})
    
    attachments = request.FILES.getlist('attachments')

    validate_attachment(attachments[0])

    individual_screening.uploaded_result = attachments[0]
    individual_screening.has_patient_response = True
    individual_screening.response_description = 'Uploaded screening results.'
    individual_screening.save()

    """ for file in attachments:
      validate_attachment(file)
      ScreeningAttachment.objects.create(
        screening_procedure=screening_procedure,
        file=file
      ) """

    return Response({"message": "Attachments updated successfully."}, status=status.HTTP_200_OK)

def validate_attachment(file):
  max_size_mb = 5
  allowed_types = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',  # .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',  # .docx
  ]

  if file.size > max_size_mb * 1024 * 1024:
    raise ValidationError({
      "non_field_errors": [
        f"File '{file.name}' exceeds {max_size_mb}MB limit."
      ]
    })

  if file.content_type not in allowed_types:
    raise ValidationError({
      "non_field_errors": [
        f"Unsupported file type: '{file.content_type}' for file '{file.name}'."
      ]
    })

