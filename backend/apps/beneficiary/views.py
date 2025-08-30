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
from apps.cancer_screening.models import ScreeningAttachment, IndividualScreening # PreScreeningForm

from apps.cancer_screening.models import IndividualScreening, PreScreeningForm
from apps.patient.models import Patient, CancerDiagnosis
from apps.beneficiary.serializers import PatientSerializer
from apps.partners.serializers import CancerAwarenessActivitySerializer
from apps.cancer_screening.serializers import (
  PreScreeningFormSerializer, 
  IndividualScreeningSerializer, 
  # ScreeningProcedureSerializer, 
  ScreeningAttachmentSerializer
)

import logging

logger = logging.getLogger(__name__)

class PatientCreateView(generics.CreateAPIView):
  queryset = Patient.objects.all()
  serializer_class = PatientSerializer

class PatientDetailView(generics.RetrieveAPIView):
  serializer_class = PatientSerializer
  permission_classes = [IsAuthenticated]

  def get_object(self):
    try:
      return Patient.objects.get(user=self.request.user)
    except Patient.DoesNotExist:
      raise NotFound("No patient record found for this user.")

class PreScreeningCreateView(generics.CreateAPIView):
  queryset = PreScreeningForm.objects.all()
  serializer_class = PreScreeningFormSerializer
  permission_classes = [IsAuthenticated]

# To be updated
class IndividualScreeningUpdateView(generics.UpdateAPIView):
  queryset = IndividualScreening.objects.all()
  serializer_class = IndividualScreeningSerializer
  parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated]
  lookup_field = 'id'

  def perform_update(self, serializer):
    try:
      with transaction.atomic():
        instance = self.get_object()

        if instance.has_patient_response:
          raise ValidationError({'non_field_errors': ['You already have an ongoing request. Please wait for it\'s feedback before submitting another.']})

        instance = serializer.save(
          has_patient_response=True,
          response_description='Submitted screening procedure'
        )
        
        screening_attachments = self.request.FILES.getlist('screening_attachments')
        for file in screening_attachments:
          validate_attachment(file)
          ScreeningAttachment.objects.create(
            individual_screening=instance,
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
    patient = get_object_or_404(Patient, user=user)
    # patient_id = self.kwargs.get("patient_id")
    return IndividualScreening.objects.filter(patient=patient)

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
    individual_screening = get_object_or_404(IndividualScreening, id=procedure_id)

    if individual_screening.has_patient_response:
      raise ValidationError ({'non_field_errors': ['You can only submit once. Please wait for it\'s feedback before submitting again.']})
    
    attachments = request.FILES.getlist('attachments')

    individual_screening.has_patient_response = True
    individual_screening.response_description = 'Submitted (LOA) Letter of Authority'
    individual_screening.save()

    for file in attachments:
      validate_attachment(file)
      ScreeningAttachment.objects.create(
        individual_screening=individual_screening,
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

