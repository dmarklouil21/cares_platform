from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from backend.utils.email import send_precancerous_meds_status_email

from apps.patient.models import Patient, ServiceReceived
from apps.precancerous.models import PreCancerousMedsRequest
# Use local re-export to avoid cross-app dependency/cycles
from apps.precancerous.serializers import (
  PreCancerousMedsRequestSerializer,
  # PreCancerousMedsReleaseDateSerializer,
  # PreCancerousMedsAdminStatusSerializer,
)

import logging
logger = logging.getLogger(__name__)

class PreCancerousMedsCreateView(generics.CreateAPIView):
  queryset = PreCancerousMedsRequest.objects.all()
  serializer_class = PreCancerousMedsRequestSerializer
  permission_classes = [IsAuthenticated]

  def perform_create(self, serializer):
    try:
      with transaction.atomic():
        patient = get_object_or_404(Patient, patient_id=self.request.data.get('patient_id'))
        existing_record = PreCancerousMedsRequest.objects.filter(
          patient=patient,
          status__in=['Pending', 'Approved']
        ).first()

        if existing_record:
          raise ValidationError({
            'non_field_errors': [
              "An ongoing application for this patient currently exits."
            ]
          })

        patient.status = 'active'
        patient.save()
        instance = serializer.save(
          patient=patient
        )

    except Exception as e:
      logger.error(f"Error creating pre-cancerous meds request: {str(e)}")
      raise e
    
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

class AdminPreCancerousMedsUpdateView(generics.UpdateAPIView):
  queryset = PreCancerousMedsRequest.objects.all()
  serializer_class = PreCancerousMedsRequestSerializer
  permission_classes = [IsAuthenticated]
  lookup_field = "id"   # so you can update by /<id> in the URL

  def perform_update(self, serializer):
    instance = serializer.save()

    patient = instance.patient
    if instance.status == 'Approved':
      patient.status = 'active'
      instance.date_approved = timezone.now().date()
      instance.save(update_fields=['date_approved'])
    elif instance.status == 'Completed':
      patient.status = 'validated'
      
      ServiceReceived.objects.create(
        patient=patient,
        service_type = 'Pre Cancerous Medication',
        date_completed = timezone.now().date()
      )
      
    patient.save()
    # return super().perform_update(serializer)

class PreCancerousMedsDeleteView(generics.DestroyAPIView):
  queryset = PreCancerousMedsRequest.objects.all()
  lookup_field = 'id'

  permission_classes = [IsAuthenticated]

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
