from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import generics, status, filters
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ValidationError, PermissionDenied
import json

from backend.utils.email import (
  send_individual_screening_status_email,
  send_return_remarks_email, send_loa_email,
  send_precancerous_meds_status_email,
  send_mass_screening_status_email, 
  send_service_registration_email
)

from apps.patient.models import Patient, CancerDiagnosis, HistoricalUpdate, PreScreeningForm, ServiceReceived
from apps.patient.serializers import PreScreeningFormSerializer
from apps.cancer_screening.models import ScreeningAttachment
from apps.precancerous.models import PreCancerousMedsRequest
from apps.precancerous.serializers import PreCancerousMedsRequestSerializer
from apps.rhu.models import RHU, Representative, Rhuv2

from .models import IndividualScreening, MassScreeningRequest, MassScreeningAttachment, MassScreeningAttendanceEntry

from .serializers import (
  IndividualScreeningSerializer,
  IndividualScreeningAdminCreateSerializer,
  ScreeningAttachmentSerializer,
  MassScreeningRequestSerializer,
  MassScreeningAttachmentSerializer,
  MassScreeningAttendanceEntrySerializer,
  MassScreeningAttendanceBulkSerializer,
)

import os
import logging
logger = logging.getLogger(__name__)

# ---------------------------
# Helper: File validation
# ---------------------------
def validate_attachment(file):
  max_size_mb = 10
  allowed_types = {
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  }
  if file.size > max_size_mb * 1024 * 1024:
    raise ValidationError(f"File {file.name} exceeds {max_size_mb}MB limit.")
  if file.content_type not in allowed_types:
    raise ValidationError(f"Unsupported file type: {file.content_type} for file {file.name}.")

# ---------------------------
# Helper: RHU fetch with clearer error
# ---------------------------
def get_rhu_for_user_or_error(user):
  try:
    representative = get_object_or_404(Representative, user=user)
    rhu = representative.rhu
    return Rhuv2.objects.get(lgu=rhu.lgu)
  except Representative.DoesNotExist:
    # Return a clearer 403 instead of generic 404
    raise PermissionDenied("Your account has no RHU profile, please contact admin")

# ---------------------------
# Views
# ---------------------------
class IndividualScreeningCreateView(generics.CreateAPIView):
  queryset = IndividualScreening.objects.all()
  serializer_class = IndividualScreeningAdminCreateSerializer
  parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated]

  def perform_create(self, serializer):
    try:
      with transaction.atomic():
        patient = get_object_or_404(Patient, patient_id=self.request.data.get('patient_id'))
        existing_record = IndividualScreening.objects.filter(
          patient=patient,
          status__in=['Pending', 'Approve']
        ).first()

        if existing_record:
          raise ValidationError({
            'non_field_errors': [
              'There\'s an ongoing screening application for this patient.'
            ]
          })
        
        patient.status = 'active'
        patient.save()
        instance = serializer.save(
          patient=patient,
          date_approved=timezone.now().date(),
        )

        files_dict = {}
        for key, value in self.request.FILES.items():
          if key.startswith("files."):
            field_name = key.split("files.")[1] 
            files_dict[field_name] = value

        for key, file in files_dict.items():
          ScreeningAttachment.objects.create(
            individual_screening=instance,
            file=file,
            doc_type=key 
          )
        
        email_status = send_service_registration_email(
          patient=patient, 
          service_name='Cancer Screening'
        )
        
        if email_status is not True:
          logger.error(f"Email failed to send: {email_status}")
          
    except ValidationError:
      raise
    
    except Exception as e:
      logger.error(f"Error creating screening procedure: {str(e)}")
      raise e
    
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

class IndividualScreeningDetailedView(generics.RetrieveAPIView):
  queryset = IndividualScreening.objects.all()
  serializer_class = IndividualScreeningSerializer
  permission_classes = [IsAuthenticated]
  lookup_field = 'id'

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

  def perform_destroy(self, instance):
    remarks = self.request.data.get('remarks')
    status_value = self.request.data.get('status')

    patient = instance.patient
    patient.status = 'validated'
    patient.save()

    if remarks:
      send_individual_screening_status_email(patient=patient, status=status_value, remarks=remarks)
    return super().perform_destroy(instance)

class ScreeningAttachmentUpdateView(APIView):
  parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated, IsAdminUser]

  def patch(self, request, procedure_id):
    individual_screening = get_object_or_404(IndividualScreening, id=procedure_id)
    
    files_dict = {}
    for key, value in self.request.FILES.items():
      if key.startswith("files."):
        field_name = key.split("files.")[1] 
        files_dict[field_name] = value

    for key, file in files_dict.items():
      ScreeningAttachment.objects.create(
        individual_screening=individual_screening,
        file=file,
        doc_type=key 
      )

    return Response({"message": "Attachments updated successfully."})

class AttachmentDeleteView(generics.DestroyAPIView):
  queryset = ScreeningAttachment.objects.all()
  serializer_class = ScreeningAttachmentSerializer
  lookup_field = 'id'
  permission_classes = [IsAuthenticated, IsAdminUser]

class IndividualScreeningStatusUpdateView(generics.UpdateAPIView):
  queryset = IndividualScreening.objects.all()
  serializer_class = IndividualScreeningSerializer
  lookup_field = 'id'
  permission_classes = [IsAuthenticated, IsAdminUser]

  def perform_update(self, serializer):
    instance = serializer.save(has_patient_response=False, response_description='')
    request = self.request

    patient = instance.patient
    screening_status = instance.status

    if screening_status == 'Approved':
      instance.date_approved = timezone.now().date()
      patient.status = 'active'
    elif screening_status == 'Completed':
      patient.status = 'validated'
      
      ServiceReceived.objects.create(
        patient=patient,
        service_type = 'Cancer Screening',
        date_completed = timezone.now().date()
      )
    
    instance.save()
    patient.save()
    remarks = request.data.get('remarks')
    email_status = send_individual_screening_status_email(
      instance.patient, instance.status, instance.screening_date, remarks
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
    patient.status = 'validated'
    patient.save()
    individual_screening.save()

    send_individual_screening_status_email(patient=patient, status=status_value, remarks=remarks)
    return Response({"message": "Rejected successfully."})

class ResultAttachmentUploadView(APIView):
  parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated]

  def patch(self, request, screening_id):
    individual_screening = get_object_or_404(IndividualScreening, id=screening_id)
    attachments = request.FILES.getlist('attachments')

    if not attachments:
      return Response(
        {"message": "No file attached."},
        status=status.HTTP_400_BAD_REQUEST
      )
    
    file = attachments[0]
    validate_attachment(file)

    if individual_screening.uploaded_result:
      old_path = individual_screening.uploaded_result.path
      if os.path.exists(old_path):
        os.remove(old_path)

    individual_screening.uploaded_result = file
    individual_screening.save()

    return Response(
      {
        "message": "Attachment uploaded successfully.",
        "file_url": individual_screening.uploaded_result.url,
        "file_name": os.path.basename(individual_screening.uploaded_result.name),
      },
      status=status.HTTP_200_OK,
    )

class ResultDeleteView(APIView):
  permission_classes = [IsAuthenticated, IsAdminUser]

  def delete(self, request, screening_id):
    individual_screening = get_object_or_404(IndividualScreening, id=screening_id)

    if not individual_screening.uploaded_result:
      return Response(
        {"message": "No attachment found for this screening."},
        status=status.HTTP_404_NOT_FOUND,
      )
    
    try:
      # Get file path before deleting from model
      file_path = individual_screening.uploaded_result.path

      # Delete file reference from model
      individual_screening.uploaded_result.delete(save=False)

      # Clear model field
      individual_screening.uploaded_result = None
      individual_screening.save(update_fields=["uploaded_result"])

      # If the file still exists in storage, remove it manually (edge case)
      if os.path.exists(file_path):
        os.remove(file_path)

      return Response(
        {"message": "Attachment deleted successfully."},
        status=status.HTTP_200_OK,
      )

    except Exception as e:
      return Response(
        {"message": f"An error occurred while deleting the attachment: {str(e)}"},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
      )
    
    # individual_screening.uploaded_result.delete()
    # return Response({"message": "Attachment deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

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
# RHU: Mass Screening Requests
# ---------------------------------------------
class MassScreeningRequestCreateView(APIView):
  parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated]

  def post(self, request):
    user = request.user
    if not getattr(user, 'is_rhu', False):
      return Response({"detail": "Only RHU users can create mass screening requests."}, status=status.HTTP_403_FORBIDDEN)

    rhu = get_rhu_for_user_or_error(user)

    serializer = MassScreeningRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    obj = serializer.save(rhu=rhu)

    # Handle attachments 
    files = request.FILES.getlist('attachments')
    for f in files:
      validate_attachment(f)
      MassScreeningAttachment.objects.create(request=obj, file=f)

    return Response(MassScreeningRequestSerializer(obj, context={'request': request}).data, status=status.HTTP_201_CREATED)

class MyMassScreeningRequestListView(generics.ListAPIView):
  serializer_class = MassScreeningRequestSerializer
  permission_classes = [IsAuthenticated]

  def get_queryset(self):
    rhu = get_rhu_for_user_or_error(self.request.user)
    qs = MassScreeningRequest.objects.filter(rhu=rhu).order_by('-created_at')
    status_filter = self.request.query_params.get('status')
    if status_filter:
      qs = qs.filter(status=status_filter)
    return qs

class MyMassScreeningRequestDetailView(generics.RetrieveAPIView):
  serializer_class = MassScreeningRequestSerializer
  permission_classes = [IsAuthenticated]
  lookup_field = 'id'

  def get_queryset(self):
    rhu = get_rhu_for_user_or_error(self.request.user)
    return MassScreeningRequest.objects.filter(rhu=rhu)

class MyMassScreeningRequestUpdateView(generics.UpdateAPIView):
  serializer_class = MassScreeningRequestSerializer
  permission_classes = [IsAuthenticated]
  lookup_field = 'id'

  def get_queryset(self):
    rhu = get_rhu_for_user_or_error(self.request.user)
    return MassScreeningRequest.objects.filter(rhu=rhu)

class MyMassScreeningRequestDeleteView(generics.DestroyAPIView):
  serializer_class = MassScreeningRequestSerializer
  permission_classes = [IsAuthenticated]
  lookup_field = 'id'

  def get_queryset(self):
    rhu = get_rhu_for_user_or_error(self.request.user)
    return MassScreeningRequest.objects.filter(rhu=rhu)

class MassScreeningAttendanceView(APIView):
  permission_classes = [IsAuthenticated]
  def get(self, request, request_id):
    rhu = get_rhu_for_user_or_error(request.user)
    ms = get_object_or_404(MassScreeningRequest, id=request_id, rhu=rhu)
    entries = ms.attendance_entries.all().order_by('id')
    data = MassScreeningAttendanceEntrySerializer(entries, many=True).data
    return Response(data, status=status.HTTP_200_OK)

  def put(self, request, request_id):
    rhu = get_rhu_for_user_or_error(request.user)
    ms = get_object_or_404(MassScreeningRequest, id=request_id, rhu=rhu)

    bulk_serializer = MassScreeningAttendanceBulkSerializer(data=request.data)
    bulk_serializer.is_valid(raise_exception=True)
    entries_data = bulk_serializer.validated_data.get('entries', [])

    # Replace strategy: clear then insert
    ms.attendance_entries.all().delete()
    objs = [
      MassScreeningAttendanceEntry(request=ms, name=e.get('name', ''), result=e.get('result', ''))
      for e in entries_data
      if e.get('name')
    ]
    if objs:
      MassScreeningAttendanceEntry.objects.bulk_create(objs)

    saved = ms.attendance_entries.all().order_by('id')
    return Response(MassScreeningAttendanceEntrySerializer(saved, many=True).data, status=status.HTTP_200_OK)

class MyMassScreeningAttachmentAddView(APIView):
  permission_classes = [IsAuthenticated]

  def post(self, request, id):
    rhu = get_rhu_for_user_or_error(request.user)
    ms = get_object_or_404(MassScreeningRequest, id=id, rhu=rhu)
    files = request.FILES.getlist('attachments')
    created = []
    for f in files:
      validate_attachment(f)
      att = MassScreeningAttachment.objects.create(request=ms, file=f)
      created.append(att)
    data = MassScreeningAttachmentSerializer(created, many=True, context={'request': request}).data
    return Response({ 'attachments': data }, status=status.HTTP_201_CREATED)

class MyMassScreeningAttachmentDeleteView(generics.DestroyAPIView):
  serializer_class = MassScreeningAttachmentSerializer
  permission_classes = [IsAuthenticated]
  lookup_field = 'id'

  def get_queryset(self):
    rhu = get_rhu_for_user_or_error(self.request.user)
    # Only allow deleting attachments for requests owned by this RHU
    return MassScreeningAttachment.objects.filter(request__rhu=rhu)

# ---------------------------------------------
# Admin: Mass Screening Management
# ---------------------------------------------
class AdminMassScreeningCreateView(APIView):
  parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated, IsAdminUser]

  def post(self, request):
    """Create a MassScreeningRequest on behalf of a specific RHU.
    Expects multipart form-data with fields:
    - rhu_id (int)
    - title, venue, date (YYYY-MM-DD), beneficiaries, description, support_need
    - attachments (multiple files)
    - attendance (optional JSON array: [{"name": str, "result": str}] )
    """
    rhu_id = request.data.get('rhu_id')
    if not rhu_id:
      return Response({ 'detail': 'rhu_id is required.' }, status=status.HTTP_400_BAD_REQUEST)

    rhu = get_object_or_404(RHU, id=rhu_id)

    serializer = MassScreeningRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    obj = serializer.save(rhu=rhu)

    # Attachments
    files = request.FILES.getlist('attachments')
    for f in files:
      validate_attachment(f)
      MassScreeningAttachment.objects.create(request=obj, file=f)

    # Optional attendance provided at creation time
    attendance_raw = request.data.get('attendance')
    if attendance_raw:
      try:
        attendance = json.loads(attendance_raw) if isinstance(attendance_raw, str) else attendance_raw
        if isinstance(attendance, list):
          rows = [
            MassScreeningAttendanceEntry(request=obj, name=e.get('name', ''), result=e.get('result', ''))
            for e in attendance
            if isinstance(e, dict) and e.get('name')
          ]
          if rows:
            MassScreeningAttendanceEntry.objects.bulk_create(rows)
      except Exception:
        pass

    return Response(MassScreeningRequestSerializer(obj, context={'request': request}).data, status=status.HTTP_201_CREATED)

class AdminMassScreeningListView(generics.ListAPIView):
  serializer_class = MassScreeningRequestSerializer
  permission_classes = [IsAuthenticated, IsAdminUser]

  def get_queryset(self):
    qs = MassScreeningRequest.objects.select_related('rhu').all().order_by('-created_at')
    status_filter = self.request.query_params.get('status')
    date_filter = self.request.query_params.get('date')
    if status_filter:
      qs = qs.filter(status=status_filter)
    if date_filter:
      qs = qs.filter(date=date_filter)
    return qs

class AdminMassScreeningDetailView(generics.RetrieveAPIView):
  serializer_class = MassScreeningRequestSerializer
  permission_classes = [IsAuthenticated, IsAdminUser]
  lookup_field = 'id'
  queryset = MassScreeningRequest.objects.all()

class AdminMassScreeningStatusView(APIView):
  permission_classes = [IsAuthenticated, IsAdminUser]

  def post(self, request, id, action):
    ms = get_object_or_404(MassScreeningRequest, id=id)
    if action == 'verify':
      ms.status = 'Verified'
    elif action == 'reject':
      ms.status = 'Rejected'
    elif action == 'done':
      ms.status = 'Done'
    else:
      return Response({ 'detail': 'Invalid action' }, status=status.HTTP_400_BAD_REQUEST)
    ms.save(update_fields=['status'])
    # Notify RHU via email following individual screening style
    try:
      send_mass_screening_status_email(ms.rhu, ms.status, request_obj=ms)
    except Exception:
      pass
    return Response(MassScreeningRequestSerializer(ms).data, status=status.HTTP_200_OK)

class AdminMassScreeningAttendanceView(APIView):
  permission_classes = [IsAuthenticated, IsAdminUser]

  def get(self, request, request_id):
    ms = get_object_or_404(MassScreeningRequest, id=request_id)
    entries = ms.attendance_entries.all().order_by('id')
    data = MassScreeningAttendanceEntrySerializer(entries, many=True).data
    return Response(data, status=status.HTTP_200_OK)

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

# class AdminPreCancerousMedsSetReleaseDateView(generics.UpdateAPIView):
#   queryset = PreCancerousMedsRequest.objects.all()
#   serializer_class = PreCancerousMedsReleaseDateSerializer
#   permission_classes = [IsAuthenticated, IsAdminUser]
#   lookup_field = 'id'

#   def perform_update(self, serializer):
#     instance = self.get_object()
#     if instance.status not in ['Pending', 'Verified']:
#       raise ValidationError({'non_field_errors': ['Release date can only be set while Pending or Verified.']})
#     serializer.save()

# class AdminPreCancerousMedsVerifyView(APIView):
#   permission_classes = [IsAuthenticated, IsAdminUser]

#   def patch(self, request, id):
#     obj = get_object_or_404(PreCancerousMedsRequest, id=id)

#     # Allow passing release_date_of_meds here or require pre-set
#     release_date = request.data.get('release_date_of_meds')
#     if release_date:
#       # Reuse serializer validation for date format
#       date_serializer = PreCancerousMedsReleaseDateSerializer(instance=obj, data={'release_date_of_meds': release_date}, partial=True)
#       date_serializer.is_valid(raise_exception=True)
#       date_serializer.save()

#     if not obj.release_date_of_meds:
#       return Response({'detail': 'release_date_of_meds is required to verify.'}, status=status.HTTP_400_BAD_REQUEST)

#     obj.status = 'Verified'
#     obj.save(update_fields=['status'])

#     email_status = send_precancerous_meds_status_email(
#       patient=obj.patient,
#       status='Verified',
#       release_date=obj.release_date_of_meds,
#       med_request=obj,
#     )
#     if email_status is not True:
#       logger.error(f"Email failed to send: {email_status}")

#     return Response(PreCancerousMedsRequestSerializer(obj).data, status=status.HTTP_200_OK)

# class AdminPreCancerousMedsRejectView(APIView):
#   permission_classes = [IsAuthenticated, IsAdminUser]

#   def patch(self, request, id):
#     obj = get_object_or_404(PreCancerousMedsRequest, id=id)
#     serializer = PreCancerousMedsAdminStatusSerializer(data=request.data)
#     serializer.is_valid(raise_exception=True)
#     status_value = serializer.validated_data['status']
#     remarks = serializer.validated_data.get('remarks', '')

#     if status_value != 'Rejected':
#       return Response({'detail': 'Invalid status for this action.'}, status=status.HTTP_400_BAD_REQUEST)

#     obj.status = 'Rejected'
#     obj.save(update_fields=['status'])

#     email_status = send_precancerous_meds_status_email(
#       patient=obj.patient,
#       status='Rejected',
#       remarks=remarks,
#       med_request=obj,
#     )
#     if email_status is not True:
#       logger.error(f"Email failed to send: {email_status}")

#     return Response(PreCancerousMedsRequestSerializer(obj).data, status=status.HTTP_200_OK)