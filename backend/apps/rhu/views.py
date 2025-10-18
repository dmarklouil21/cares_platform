from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.core.exceptions import PermissionDenied

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import MultiPartParser, FormParser

from .models import RHU, Rhuv2, Representative
from .serializers import RHUProfileSerializer, RHUListSerializer, RhuSerializer, RepresentativeSerializer

from backend.utils.email import send_precancerous_meds_status_email

from apps.precancerous.models import PreCancerousMedsRequest
# Use local re-export to avoid cross-app dependency/cycles
from apps.precancerous.serializers import (
  PreCancerousMedsRequestSerializer,
)

import logging
logger = logging.getLogger(__name__)

class RHUProfileAPIView(APIView):
  permission_classes = [IsAuthenticated]
  parser_classes = [MultiPartParser, FormParser]

  def _get_rhu(self, user):
    try:
      return RHU.objects.get(user=user)
    except RHU.DoesNotExist:
      raise PermissionDenied("Your account has no RHU profile, please contact admin")

  def get(self, request):
    rhu = self._get_rhu(request.user)
    serializer = RHUProfileSerializer(rhu)
    return Response(serializer.data, status=status.HTTP_200_OK)

  def put(self, request):
    rhu = self._get_rhu(request.user)
    serializer = RHUProfileSerializer(rhu, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    # Sync RHU avatar to User avatar so it's available globally
    try:
      if rhu.avatar and getattr(request.user, 'avatar', None) != rhu.avatar:
        request.user.avatar = rhu.avatar
        request.user.save(update_fields=['avatar'])
    except Exception:
      # Non-fatal: proceed even if sync fails
      pass
    return Response(serializer.data, status=status.HTTP_200_OK)

  def patch(self, request):
    return self.put(request)


class AdminRHUListAPIView(generics.ListAPIView):
  permission_classes = [IsAuthenticated, IsAdminUser]
  serializer_class = RHUListSerializer

  def get_queryset(self):
    return RHU.objects.all().order_by('lgu')

# New Views
class RhuListView(generics.ListAPIView):
  queryset = Rhuv2.objects.all().order_by('-created_at')
  serializer_class = RhuSerializer
  permission_classes = [IsAuthenticated]

class RhuCreateView(generics.CreateAPIView):
  queryset = Rhuv2.objects.all()
  serializer_class = RhuSerializer
  permission_classes = [IsAuthenticated]

class RhuDetailView(generics.RetrieveAPIView):
  queryset = Rhuv2.objects.all()
  serializer_class = RhuSerializer
  permission_classes = [IsAuthenticated]

class RepresentativeListView(generics.ListAPIView):
  serializer_class = RepresentativeSerializer
  permission_classes = [IsAuthenticated]

  # def get_queryset(self):
  #   user = self.request.user
  #   if user.is_staff:
  #     return Representative.objects.select_related('rhu', 'user').order_by('-created_at')
  #   return Representative.objects.select_related('rhu', 'user').filter(user=user).order_by('-created_at')

class RepresentativeCreateView(generics.CreateAPIView):
  queryset = Representative.objects.select_related('rhu', 'user').all()
  serializer_class = RepresentativeSerializer
  permission_classes = [IsAuthenticated]

class RepresentativeDetailView(generics.RetrieveAPIView):
  queryset = Representative.objects.select_related('rhu', 'user').all()
  serializer_class = RepresentativeSerializer
  permission_classes = [IsAuthenticated]

# Pre Cancerous Views 
class PreCancerousMedsListView(generics.ListAPIView):
  serializer_class = PreCancerousMedsRequestSerializer
  permission_classes = [IsAuthenticated]

  def get_queryset(self):
    representative = getattr(self.request.user, 'representative', None)
    if not representative:
      return PreCancerousMedsRequest.objects.none()
    rhu = representative.rhu

    qs = PreCancerousMedsRequest.objects.filter(
      request_destination='Rural Health Unit',
      destination_name=rhu.lgu
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
