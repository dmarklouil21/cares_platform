from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import PermissionDenied

from rest_framework import generics, status
from rest_framework import filters
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ValidationError

from apps.patient.models import Patient, CancerDiagnosis
from apps.cancer_screening.models import ScreeningAttachment, MassScreeningAttachment, MassScreeningRequest, MassScreeningAttendanceEntry
from apps.cancer_screening.serializers import (
  MassScreeningRequestSerializer, 
  MassScreeningAttendanceEntrySerializer, 
  MassScreeningAttendanceBulkSerializer, 
  MassScreeningAttachmentSerializer
)

from apps.precancerous.models import PreCancerousMedsRequest
from apps.precancerous.serializers import (
  PreCancerousMedsRequestSerializer,
)

from apps.rhu.models import Representative

from backend.utils.email import send_precancerous_meds_status_email

from .models import CancerAwarenessActivity, Private, PrivateRepresentative
from .serializers import (
  CancerAwarenessActivitySerializer, 
  PrivateSerializer, 
  PrivateRepresentativeSerializer, 
  AttendanceSerializer,
  AttendanceCreateSerializer
)

import logging

logger = logging.getLogger(__name__)

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
  
def get_private_for_user_or_error(user):
  try:
    representative = get_object_or_404(PrivateRepresentative, user=user)
    private = representative.private
    return Private.objects.get(institution_name=private.institution_name)
  except PrivateRepresentative.DoesNotExist:
    # Return a clearer 403 instead of generic 404
    raise PermissionDenied("Your account has no Private profile, please contact admin")
  
# Create your views here.
class CancerAwarenessActivityCreateView(generics.CreateAPIView):
  queryset = CancerAwarenessActivity.objects.all()
  serializer_class = CancerAwarenessActivitySerializer
  parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated]

  def perform_create(self, serializer):
    user = self.request.user
    uploader = ''
    if user.is_private:
      private_representative = get_private_for_user_or_error(user)
      uploader = private_representative.institution_name
    elif user.is_rhu:
      rhu_representative = get_object_or_404(Representative, user=user)
      uploader = rhu_representative.rhu

    try:
      serializer.save(uploader=uploader)
    except Exception:
      logger.exception("Error creating cancer awareness activity")
      raise
    # serializer.save(uploader=self.request.user)
    # try:
    #   with transaction.atomic():
    #     uploader = self.request.user

    #     cancer_awareness = serializer.save(uploader=uploader)

    # except Exception as e:
    #   logger.error(f"Error creating screening procedure: {str(e)}")
    #   raise e

class ActivityAttendeesView(APIView):
    def get(self, request, id):
        try:
            activity = CancerAwarenessActivity.objects.get(id=id)
            attendances = activity.attendances.all()
            serializer = AttendanceSerializer(attendances, many=True)
            return Response(serializer.data)
        except CancerAwarenessActivity.DoesNotExist:
            return Response(
                {"error": "Activity not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    def post(self, request, id):
        try:
            print(f"Received request for activity {id}")
            print(f"Request data: {request.data}")
            activity = CancerAwarenessActivity.objects.get(id=id)
            
            # Pass the activity object directly instead of just the ID
            serializer = AttendanceCreateSerializer(
                data=request.data, 
                context={'activity': activity}  # Pass the object, not just ID
            )
            
            print('Serializer: ', serializer)
            
            if serializer.is_valid():
                serializer.save()
                attendances = activity.attendances.all()
                response_serializer = AttendanceSerializer(attendances, many=True)
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except CancerAwarenessActivity.DoesNotExist:
            return Response(
                {"error": "Activity not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
  
class CancerAwarenessActivityDetailView(generics.RetrieveAPIView):
  queryset = CancerAwarenessActivity.objects.all()
  serializer_class = CancerAwarenessActivitySerializer
  permission_classes = [IsAuthenticated]
  lookup_field = 'id'

class CancerAwarenessActivityUpdateView(generics.UpdateAPIView):
  queryset = CancerAwarenessActivity.objects.all()
  serializer_class = CancerAwarenessActivitySerializer
  lookup_field = 'id'
  parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated]

class CancerAwarenessActivityListView(generics.ListAPIView):
  # queryset = CancerAwarenessActivity.objects.all()
  serializer_class = CancerAwarenessActivitySerializer
  permission_classes = [IsAuthenticated]

  def get_queryset(self):
    queryset = CancerAwarenessActivity.objects.all()
    request = self.request.query_params

    uploader_param = request.get('uploader', None)
    if uploader_param:
      queryset = queryset.filter(uploader=uploader_param)

    return queryset

class CancerAwarenessActivityDeleteView(generics.DestroyAPIView):
  queryset = CancerAwarenessActivity.objects.all()
  serializer_class = CancerAwarenessActivitySerializer
  lookup_field = 'id'
  permission_classes = [IsAuthenticated] 

class PrivatePrepresentativeProfileAPIView(APIView):
  permission_classes = [IsAuthenticated]
  parser_classes = [MultiPartParser, FormParser]

  def _get_profile(self, user):
    try:
      return PrivateRepresentative.objects.get(user=user)
    except PrivateRepresentative.DoesNotExist:
      raise PermissionDenied("Your account has no Representative profile, please contact admin")

  def get(self, request):
    representative = self._get_profile(request.user)
    serializer = PrivateRepresentativeSerializer(representative)
    return Response(serializer.data, status=status.HTTP_200_OK)

  def put(self, request):
    representative = self._get_profile(request.user)
    serializer = PrivateRepresentativeSerializer(representative, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    # Sync RHU avatar to User avatar so it's available globally
    try:
      if representative.avatar and getattr(request.user, 'avatar', None) != representative.avatar:
        request.user.avatar = representative.avatar
        request.user.save(update_fields=['avatar'])
    except Exception:
      # Non-fatal: proceed even if sync fails
      pass
    return Response(serializer.data, status=status.HTTP_200_OK)

  def patch(self, request):
    return self.put(request)

class AdminRHUListAPIView(generics.ListAPIView):
  permission_classes = [IsAuthenticated, IsAdminUser]
  serializer_class = PrivateSerializer

  def get_queryset(self):
    return Private.objects.all().order_by('institution_name')

# New Views
class PrivateListView(generics.ListAPIView):
  queryset = Private.objects.all().order_by('-created_at')
  serializer_class = PrivateSerializer
  permission_classes = [IsAuthenticated]

class PrivateCreateView(generics.CreateAPIView):
  queryset = Private.objects.all()
  serializer_class = PrivateSerializer
  permission_classes = [IsAuthenticated]

class PrivateDetailView(generics.RetrieveAPIView):
  queryset = Private.objects.all()
  serializer_class = PrivateSerializer
  permission_classes = [IsAuthenticated]

class RepresentativeListView(generics.ListAPIView):
  serializer_class = PrivateRepresentativeSerializer
  permission_classes = [IsAuthenticated]

  # def get_queryset(self):
  #   user = self.request.user
  #   if user.is_staff:
  #     return Representative.objects.select_related('rhu', 'user').order_by('-created_at')
  #   return Representative.objects.select_related('rhu', 'user').filter(user=user).order_by('-created_at')

class RepresentativeCreateView(generics.CreateAPIView):
  queryset = PrivateRepresentative.objects.select_related('private', 'user').all()
  serializer_class = PrivateRepresentativeSerializer
  permission_classes = [IsAuthenticated]

class RepresentativeDetailView(generics.RetrieveAPIView):
  queryset = PrivateRepresentative.objects.select_related('rhu', 'user').all()
  serializer_class = PrivateRepresentativeSerializer
  permission_classes = [IsAuthenticated]

# Mass Screening Views 
class MassScreeningRequestCreateView(APIView):
  parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated]

  def post(self, request):
    user = request.user
    if not getattr(user, 'is_private', False):
      return Response({"detail": "Only Private Personnel users can create mass screening requests."}, status=status.HTTP_403_FORBIDDEN)

    private = get_private_for_user_or_error(user)

    serializer = MassScreeningRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    obj = serializer.save(private=private)

    # Handle attachments 
    files = request.FILES.getlist('attachments')
    for f in files:
      validate_attachment(f)
      MassScreeningAttachment.objects.create(request=obj, file=f)

    return Response(MassScreeningRequestSerializer(obj, context={'request': request}).data, status=status.HTTP_201_CREATED)

class MyMassScreeningRequestDetailView(generics.RetrieveAPIView):
  serializer_class = MassScreeningRequestSerializer
  permission_classes = [IsAuthenticated]
  lookup_field = 'id'

  def get_queryset(self):
    private = get_private_for_user_or_error(self.request.user)
    return MassScreeningRequest.objects.filter(private=private)
  
class MyMassScreeningRequestListView(generics.ListAPIView):
  serializer_class = MassScreeningRequestSerializer
  permission_classes = [IsAuthenticated]

  def get_queryset(self):
    private = get_private_for_user_or_error(self.request.user)
    qs = MassScreeningRequest.objects.filter(private=private).order_by('-created_at')
    status_filter = self.request.query_params.get('status')
    if status_filter:
      qs = qs.filter(status=status_filter)
    return qs

class MyMassScreeningRequestUpdateView(generics.UpdateAPIView):
  serializer_class = MassScreeningRequestSerializer
  permission_classes = [IsAuthenticated]
  lookup_field = 'id'

  def get_queryset(self):
    private = get_private_for_user_or_error(self.request.user)
    return MassScreeningRequest.objects.filter(private=private)

class MassScreeningAttendanceView(APIView):
  permission_classes = [IsAuthenticated]
  def get(self, request, request_id):
    private = get_private_for_user_or_error(request.user)
    ms = get_object_or_404(MassScreeningRequest, id=request_id, private=private)
    entries = ms.attendance_entries.all().order_by('id')
    data = MassScreeningAttendanceEntrySerializer(entries, many=True).data
    return Response(data, status=status.HTTP_200_OK)

  def put(self, request, request_id):
    private = get_private_for_user_or_error(request.user)
    ms = get_object_or_404(MassScreeningRequest, id=request_id, private=private)

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

class MyMassScreeningRequestDeleteView(generics.DestroyAPIView):
  serializer_class = MassScreeningRequestSerializer
  permission_classes = [IsAuthenticated]
  lookup_field = 'id'

  def get_queryset(self):
    private = get_private_for_user_or_error(self.request.user)
    return MassScreeningRequest.objects.filter(private=private)

class MyMassScreeningAttachmentAddView(APIView):
  permission_classes = [IsAuthenticated]

  def post(self, request, id):
    private = get_private_for_user_or_error(request.user)
    ms = get_object_or_404(MassScreeningRequest, id=id, private=private)
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
    private = get_private_for_user_or_error(self.request.user)
    # Only allow deleting attachments for requests owned by this RHU
    return MassScreeningAttachment.objects.filter(request__private=private)

# Pre Cancerous Views 
class PreCancerousMedsListView(generics.ListAPIView):
  serializer_class = PreCancerousMedsRequestSerializer
  permission_classes = [IsAuthenticated]

  def get_queryset(self):
    representative = getattr(self.request.user, 'privaterepresentative', None)
    if not representative:
      return PreCancerousMedsRequest.objects.none()
    private = representative.private

    qs = PreCancerousMedsRequest.objects.filter(
      request_destination='Private Partners',
      destination_name=private.institution_name
    )
    status_filter = self.request.query_params.get('status')
    if status_filter:
      qs = qs.filter(status=status_filter)
    patient_id = self.request.query_params.get('patient_id')
    if patient_id:
      qs = qs.filter(patient__patient_id=patient_id)
    return qs

class PreCancerousMedsDetailView(generics.RetrieveAPIView):
  queryset = PreCancerousMedsRequest.objects.all()
  serializer_class = PreCancerousMedsRequestSerializer
  permission_classes = [IsAuthenticated]
  lookup_field = 'id'

class PreCancerousMedsUpdateView(generics.UpdateAPIView):
  queryset = PreCancerousMedsRequest.objects.all()
  serializer_class = PreCancerousMedsRequestSerializer
  permission_classes = [IsAuthenticated]
  lookup_field = "id"   # so you can update by /<id> in the URL

  def perform_update(self, serializer):
    instance = serializer.save()

    if instance.status == 'Approved':
      instance.date_approved = timezone.now().date()
      instance.save(update_fields=['date_approved'])
    # return super().perform_update(serializer)

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

#     release_date = request.data.get('release_date_of_meds')
#     if release_date:
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


# class AdminPreCancerousMedsDoneView(APIView):
#   permission_classes = [IsAuthenticated, IsAdminUser]

#   def patch(self, request, id):
#     obj = get_object_or_404(PreCancerousMedsRequest, id=id)

#     # Only allow marking as Done from Verified state
#     if obj.status != 'Verified':
#       return Response({'detail': 'Can only mark as Done from Verified status.'}, status=status.HTTP_400_BAD_REQUEST)

#     obj.status = 'Done'
#     obj.save(update_fields=['status'])

#     email_status = send_precancerous_meds_status_email(
#       patient=obj.patient,
#       status='Done',
#       med_request=obj,
#     )
#     if email_status is not True:
#       logger.error(f"Email failed to send: {email_status}")

#     return Response(PreCancerousMedsRequestSerializer(obj).data, status=status.HTTP_200_OK)
