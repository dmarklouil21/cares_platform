from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, status, filters
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ValidationError

from backend.utils.email import send_individual_screening_status_email, send_return_remarks_email
from apps.pre_enrollment.models import Beneficiary
from apps.patient.models import Patient
from apps.cancer_screening.models import ScreeningProcedure, ScreeningAttachment
from .models import IndividualScreening, PreScreeningForm
from .serializers import (
  PreScreeningFormSerializer,
  IndividualScreeningSerializer,
  ScreeningProcedureSerializer,
  ScreeningAttachmentSerializer
)

import logging
logger = logging.getLogger(__name__)

# ---------------------------
# Helper: File validation
# ---------------------------
def validate_attachment(file):
  max_size_mb = 5
  allowed_types = {
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  }
  if file.size > max_size_mb * 1024 * 1024:
    raise ValidationError(f"File {file.name} exceeds {max_size_mb}MB limit.")
  if file.content_type not in allowed_types:
    raise ValidationError(f"Unsupported file type: {file.content_type} for file {file.name}.")

# ---------------------------
# Views
# ---------------------------
class IndividualScreeningListView(generics.ListAPIView):
  serializer_class = IndividualScreeningSerializer
  permission_classes = [IsAuthenticated]
  filter_backends = [filters.SearchFilter]
  search_fields = ['patient__patient_id']

  def get_queryset(self):
    qs = IndividualScreening.objects.all()

    status_filter = self.request.query_params.get('status')
    if status_filter:
      qs = qs.filter(status=status_filter)

    patient_id = self.request.query_params.get('patient_id')
    if patient_id:
      qs = qs.filter(patient__patient_id=patient_id)

    return qs

class IndividualScreeningDeleteView(generics.DestroyAPIView):
  queryset = IndividualScreening.objects.all()
  serializer_class = IndividualScreeningSerializer
  lookup_field = 'id'
  permission_classes = [IsAuthenticated, IsAdminUser]

class PreScreeningFormUpdateView(generics.UpdateAPIView):
  queryset = PreScreeningForm.objects.all()
  serializer_class = PreScreeningFormSerializer
  lookup_field = 'id'
  permission_classes = [IsAuthenticated, IsAdminUser]

class ScreeningProcedureUpdateView(generics.UpdateAPIView):
  queryset = ScreeningProcedure.objects.all()
  serializer_class = ScreeningProcedureSerializer
  lookup_field = 'id'
  permission_classes = [IsAuthenticated, IsAdminUser]

class ScreeningAttachmentUpdateView(APIView):
  parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated, IsAdminUser]

  def patch(self, request, procedure_id):
    screening_procedure = get_object_or_404(ScreeningProcedure, id=procedure_id)
    attachments = request.FILES.getlist('attachments')

    for file in attachments:
      validate_attachment(file)
      ScreeningAttachment.objects.create(
        screening_procedure=screening_procedure,
        file=file
      )

    return Response({"message": "Attachments updated successfully."})

class ScreeningProcedureDeleteView(generics.DestroyAPIView):
  queryset = ScreeningProcedure.objects.all()
  serializer_class = ScreeningProcedureSerializer
  lookup_field = 'id'
  permission_classes = [IsAuthenticated, IsAdminUser]

class AttachmentDeleteView(generics.DestroyAPIView):
  queryset = ScreeningAttachment.objects.all()
  serializer_class = ScreeningAttachmentSerializer
  lookup_field = 'id'
  permission_classes = [IsAuthenticated, IsAdminUser]

  # def perform_destroy(self, instance):
  #   instance.file.delete(save=False)
  #   super().perform_destroy(instance)

class IndividualScreeningStatusUpdateView(generics.UpdateAPIView):
  queryset = IndividualScreening.objects.all()
  serializer_class = IndividualScreeningSerializer
  lookup_field = 'id'
  permission_classes = [IsAuthenticated, IsAdminUser]

  def perform_update(self, serializer):
    instance = serializer.save(has_patient_response=False, response_description='')

    if instance.status == 'Approve':
      instance.date_approved = timezone.now().date()
    
    instance.save()

    email_status = send_individual_screening_status_email(
      instance.patient, instance.status, instance.screening_date
    )
    if email_status is not True:
      logger.error(f"Email failed to send: {email_status}")

class IndividualScreeningStatusRejectView(APIView):
  permission_classes = [IsAuthenticated, IsAdminUser]

  def patch(self, request, id):
    status_value = request.data.get('status')
    remarks = request.data.get('remarks')

    individual_screening = get_object_or_404(IndividualScreening, id=id)
    patient = individual_screening.patient

    individual_screening.status = status_value
    individual_screening.has_patient_response = False
    individual_screening.response_description = ''
    individual_screening.save()

    send_individual_screening_status_email(patient=patient, status=status_value, remarks=remarks)
    return Response({"message": "Rejected successfully."})

class ResultAttachmentUploadView(APIView):
  parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated]

  def patch(self, request, screening_id):
    individual_screening = get_object_or_404(IndividualScreening, id=screening_id)
    # individual_screening = get_object_or_404(IndividualScreening, screening_procedure=screening_procedure)
    
    attachments = request.FILES.getlist('attachments')

    validate_attachment(attachments[0])

    individual_screening.uploaded_result = attachments[0]
    individual_screening.save()

    return Response({"message": "Attachments updated successfully."}, status=status.HTTP_200_OK)

class ResultDeleteView(APIView):
  permission_classes = [IsAuthenticated, IsAdminUser]

  def delete(self, request, screening_id):
    individual_screening = get_object_or_404(IndividualScreening, id=screening_id)
    individual_screening.uploaded_result.delete()
    return Response({"message": "Attachment deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_return_remarks(request, id):
  remarks = request.data.get('remarks')
  if not remarks:
    return Response({"error": "Remarks are required."}, status=400)

  individual_screening = get_object_or_404(IndividualScreening, id=id)
  patient = individual_screening.patient

  individual_screening.has_patient_response = False
  individual_screening.response_description = ''
  individual_screening.save()

  email_status = send_return_remarks_email(patient, remarks)
  if email_status is not True:
    logger.error(f"Email failed to send: {email_status}")

  return Response({"message": "Return remarks sent and saved successfully.", "remarks": remarks})


""" if status == 'LOA Generation':
      pdf_bytes, file_name = generate_loa_pdf(instance)
      send_loa_email(patient.beneficiary.user.email, pdf_bytes, file_name) """

""" class UploadLOAGenerated(generics.UpdateAPIView):
  queryset = IndividualScreening.objects.all()
  parser_classes = [MultiPartParser, FormParser]
  serializer_class = IndividualScreeningSerializer

  permission_classes = [IsAuthenticated]

  def get_object(self):
    user = self.request.user
    patient = get_object_or_404(Patient, beneficiary__user=user)
    return get_object_or_404(IndividualScreening, patient=patient)
  
  def update(self, request, *args, **kwargs):
    instance = self.get_object()
    instance.status = "LOA Uploaded" 
    instance.save() 

    return super().update(request, *args, **kwargs) """