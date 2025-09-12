from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, status, filters
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ValidationError

from backend.utils.email import (
  send_individual_screening_status_email,
  send_return_remarks_email, send_loa_email,
  send_precancerous_meds_status_email,
)

from apps.patient.models import Patient, CancerDiagnosis, HistoricalUpdate
from apps.cancer_screening.models import ScreeningAttachment
from apps.precancerous.models import PreCancerousMedsRequest

from .models import IndividualScreening, PreScreeningForm

from .serializers import (
  PreScreeningFormSerializer,
  IndividualScreeningSerializer,
  ScreeningAttachmentSerializer,
  PreCancerousMedsRequestSerializer,
  PreCancerousMedsReleaseDateSerializer,
  PreCancerousMedsAdminStatusSerializer,
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

# To be updated
# class ScreeningProcedureUpdateView(generics.UpdateAPIView):
#   queryset = ScreeningProcedure.objects.all()
#   serializer_class = ScreeningProcedureSerializer
#   lookup_field = 'id'
#   permission_classes = [IsAuthenticated, IsAdminUser]

class ScreeningAttachmentUpdateView(APIView):
  parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated, IsAdminUser]

  def patch(self, request, procedure_id):
    individual_screening = get_object_or_404(IndividualScreening, id=procedure_id)
    attachments = request.FILES.getlist('screening_attachments')

    for file in attachments:
      validate_attachment(file)
      ScreeningAttachment.objects.create(
        individual_screening=individual_screening,
        file=file
      )

    return Response({"message": "Attachments updated successfully."})

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

    screening_status = instance.status

    if screening_status == 'Approve':
      instance.date_approved = timezone.now().date()
      CancerDiagnosis.objects.create(
        patient=instance.patient,
        diagnosis=instance.patient.pre_screening_form.final_diagnosis,
        date_diagnosed=instance.patient.pre_screening_form.date_of_diagnosis,
        cancer_site=instance.cancer_site,
        cancer_stage=instance.patient.pre_screening_form.staging,
      )
    elif screening_status == 'Complete':
      HistoricalUpdate.objects.create(
        patient=instance.patient,
        note='Completed Individual Screening',
        date=timezone.now().date(),
      )
    
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

class SendLOAView(APIView):
  permission_classes = [IsAuthenticated, IsAdminUser]

  def post(self, request):
    file_obj = request.FILES.get("file")
    email = request.data.get("email")
    patient_name = request.data.get("patient_name")  # optional, from frontend

    if not file_obj:
      return Response({"error": "No LOA file uploaded."}, status=400)

    if not email:
      return Response({"error": "No recipient email provided."}, status=400)
    
    result = send_loa_email(email, file_obj, patient_name)

    if result is True:
      return Response({"message": "LOA sent successfully."}, status=200)
    return Response({"error": f"Failed to send LOA: {result}"}, status=500)

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

# ---------------------------------------------
# Admin: Pre-Cancerous Meds Requests Management
# ---------------------------------------------
class AdminPreCancerousMedsListView(generics.ListAPIView):
  serializer_class = PreCancerousMedsRequestSerializer
  permission_classes = [IsAuthenticated, IsAdminUser]

  def get_queryset(self):
    qs = PreCancerousMedsRequest.objects.all().order_by('-created_at')
    status_filter = self.request.query_params.get('status')
    if status_filter:
      qs = qs.filter(status=status_filter)
    patient_id = self.request.query_params.get('patient_id')
    if patient_id:
      qs = qs.filter(patient__patient_id=patient_id)
    return qs

class AdminPreCancerousMedsDetailView(generics.RetrieveAPIView):
  queryset = PreCancerousMedsRequest.objects.all()
  serializer_class = PreCancerousMedsRequestSerializer
  permission_classes = [IsAuthenticated, IsAdminUser]
  lookup_field = 'id'

class AdminPreCancerousMedsSetReleaseDateView(generics.UpdateAPIView):
  queryset = PreCancerousMedsRequest.objects.all()
  serializer_class = PreCancerousMedsReleaseDateSerializer
  permission_classes = [IsAuthenticated, IsAdminUser]
  lookup_field = 'id'

  def perform_update(self, serializer):
    instance = self.get_object()
    if instance.status not in ['Pending', 'Verified']:
      raise ValidationError({'non_field_errors': ['Release date can only be set while Pending or Verified.']})
    serializer.save()

class AdminPreCancerousMedsVerifyView(APIView):
  permission_classes = [IsAuthenticated, IsAdminUser]

  def patch(self, request, id):
    obj = get_object_or_404(PreCancerousMedsRequest, id=id)

    # Allow passing release_date_of_meds here or require pre-set
    release_date = request.data.get('release_date_of_meds')
    if release_date:
      # Reuse serializer validation for date format
      date_serializer = PreCancerousMedsReleaseDateSerializer(instance=obj, data={'release_date_of_meds': release_date}, partial=True)
      date_serializer.is_valid(raise_exception=True)
      date_serializer.save()

    if not obj.release_date_of_meds:
      return Response({'detail': 'release_date_of_meds is required to verify.'}, status=status.HTTP_400_BAD_REQUEST)

    obj.status = 'Verified'
    obj.save(update_fields=['status'])

    email_status = send_precancerous_meds_status_email(
      patient=obj.patient,
      status='Verified',
      release_date=obj.release_date_of_meds,
      med_request=obj,
    )
    if email_status is not True:
      logger.error(f"Email failed to send: {email_status}")

    return Response(PreCancerousMedsRequestSerializer(obj).data, status=status.HTTP_200_OK)

class AdminPreCancerousMedsRejectView(APIView):
  permission_classes = [IsAuthenticated, IsAdminUser]

  def patch(self, request, id):
    obj = get_object_or_404(PreCancerousMedsRequest, id=id)
    serializer = PreCancerousMedsAdminStatusSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    status_value = serializer.validated_data['status']
    remarks = serializer.validated_data.get('remarks', '')

    if status_value != 'Rejected':
      return Response({'detail': 'Invalid status for this action.'}, status=status.HTTP_400_BAD_REQUEST)

    obj.status = 'Rejected'
    obj.save(update_fields=['status'])

    email_status = send_precancerous_meds_status_email(
      patient=obj.patient,
      status='Rejected',
      remarks=remarks,
      med_request=obj,
    )
    if email_status is not True:
      logger.error(f"Email failed to send: {email_status}")

    return Response(PreCancerousMedsRequestSerializer(obj).data, status=status.HTTP_200_OK)