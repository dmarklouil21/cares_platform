from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction

from rest_framework import generics, status, filters
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ValidationError

from backend.utils.email import (
  send_post_treatment_status_email,
  send_return_remarks_email, send_loa_email,
)

from apps.patient.models import Patient, HistoricalUpdate, ServiceReceived
from apps.notifications.utils import create_notification

from . models import PostTreatment, FollowupCheckups, RequiredAttachment
from . serializers import PostTreatmentSerializer, PostTreatmentAdminCreateSerializer, RequiredAttachmentSerializer

import logging
import threading
logger = logging.getLogger(__name__)

# Create your views here.
class PostTreatmentCreateView(generics.CreateAPIView):
  queryset = PostTreatment.objects.all()
  serializer_class = PostTreatmentAdminCreateSerializer
  parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated]

  def perform_create(self, serializer):
    try:
      with transaction.atomic():
        patient = get_object_or_404(Patient, patient_id=self.request.data.get('patient_id'))
        existing_record = PostTreatment.objects.filter(
          patient=patient,
          status__in=['Pending', 'Approved']
        ).first()

        if existing_record:
          raise ValidationError({
            'non_field_errors': [
              'There\'s an ongoing post treatment application for this patient.'
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
          RequiredAttachment.objects.create(
            post_treatment=instance,
            file=file,
            doc_type=key 
          )
    except ValidationError:
      raise

    except Exception as e:
      logger.error(f"Error creating post treatment request: {str(e)}")
      raise e

class PostTreatmentListView(generics.ListAPIView):
  serializer_class = PostTreatmentSerializer
  permission_classes = [IsAuthenticated]
  filter_backends = [filters.SearchFilter]
  search_fields = ['patient__patient_id']

  def get_queryset(self):
    qs = PostTreatment.objects.all()

    status_filter = self.request.query_params.get('status')
    if status_filter:
      qs = qs.filter(status=status_filter)

    patient_id = self.request.query_params.get('patient_id')
    if patient_id:
      qs = qs.filter(patient__patient_id=patient_id)

    return qs
  
class PostTreatmentDetailedView(generics.RetrieveAPIView):
  queryset = PostTreatment.objects.all()
  serializer_class = PostTreatmentSerializer
  permission_classes = [IsAuthenticated]
  lookup_field = 'id'

  def get_queryset(self):
    qs = PostTreatment.objects.all()

    status_filter = self.request.query_params.get('status')
    if status_filter:
      qs = qs.filter(status=status_filter)

    patient_id = self.request.query_params.get('patient_id')
    if patient_id:
      qs = qs.filter(patient__patient_id=patient_id)

    return qs 

class PostTreatmentDeleteView(generics.DestroyAPIView):
  queryset = PostTreatment.objects.all()
  lookup_field = 'id'

  permission_classes = [IsAuthenticated, IsAdminUser]

class PostTreatmentApproveView(APIView):
  permission_classes = [IsAuthenticated, IsAdminUser]
  
  def patch(self, request, id):
    post_treatment = get_object_or_404(PostTreatment, id=id)

    post_treatment.status = request.data.get('status')
    post_treatment.save()

    return Response({"success": f"Approved successfully."}, status=200)

class PostTreatmentUpdateView(APIView):
  # parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated, IsAdminUser]

  def patch(self, request, id):
    post_treatment = get_object_or_404(PostTreatment, id=id)
    serializer = PostTreatmentSerializer(post_treatment, data=request.data, partial=True)
    patient = post_treatment.patient
    if serializer.is_valid():
      previous_status = post_treatment.status
      serializer.save(
        has_patient_response = False,
        response_description = ""
      )

      # If status changed to 'Approve', set date_approved to today
      if previous_status != 'Approved' and serializer.validated_data.get('status') == 'Approved':
        post_treatment.date_approved = timezone.now().date()
        post_treatment.save()
        patient.status = 'active'
        patient.save()
        # send_loa_email(post_treatment)

      # If status changed to 'Complete', set date_completed to today
      if previous_status != 'Completed' and serializer.validated_data.get('status') == 'Completed':
        post_treatment.date_completed = timezone.now().date()
        post_treatment.save()
        patient.status = 'validated'
        patient.save()

        ServiceReceived.objects.create(
          patient=patient,
          service_type = 'Post Treatment',
          date_completed = timezone.now().date()
        )
        # send_precancerous_meds_status_email(post_treatment)

      followup_data = request.data.get('followup_checkups')
      if followup_data:
        for item in followup_data:
          if 'id' in item:
            # Update existing FollowupCheckup
            followup = post_treatment.followup_checkups.filter(id=item['id']).first()
            if followup:
              for attr, value in item.items():
                setattr(followup, attr, value)
              followup.save()
          else:
            # Create new FollowupCheckup
            post_treatment.followup_checkups.create(**item)
      
      remarks = request.data.get('remarks')
     
      user = patient.user
      if user:
        create_notification(user, f'Post Treatment {post_treatment.status.title()}', f'Your post treatment request has been {post_treatment.status}.')

      # Define a small helper function to run in the background
      def send_email_in_background(patient, status, lab_test_date, remarks):
        try:
          send_post_treatment_status_email(patient=patient, status=status, lab_test_date=lab_test_date, remarks=remarks)
        except Exception as e:
          logger.error(f"CRITICAL EMAIL ERROR: {str(e)}")
          print(f"Background email failed: {e}")
      
      # Start the thread. The request proceeds immediately without waiting.
      email_thread = threading.Thread(target=send_email_in_background, args=(post_treatment.patient, post_treatment.status, post_treatment.laboratory_test_date, remarks))
      email_thread.start()

      # email_status = send_post_treatment_status_email(
      #   patient=post_treatment.patient, 
      #   status=post_treatment.status, 
      #   lab_test_date=post_treatment.laboratory_test_date, 
      #   remarks=remarks
      # )

      # if email_status is not True:
      #   logger.error(f"Email failed to send: {email_status}")

      return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RequiredAttachmentUpdateView(APIView):
  parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated, IsAdminUser]

  def patch(self, request, id):
    post_treatment = get_object_or_404(PostTreatment, id=id)
    
    files_dict = {}
    for key, value in self.request.FILES.items():
      if key.startswith("files."):
        field_name = key.split("files.")[1] 
        files_dict[field_name] = value

    for key, file in files_dict.items():
      RequiredAttachment.objects.create(
        post_treatment=post_treatment,
        file=file,
        doc_type=key 
      )

    return Response({"message": "Attachments updated successfully."})
  
class AttachmentDeleteView(generics.DestroyAPIView):
  queryset = RequiredAttachment.objects.all()
  serializer_class = RequiredAttachmentSerializer
  lookup_field = 'id'
  permission_classes = [IsAuthenticated, IsAdminUser]

class PostTreatmentCheckupUpdateView(APIView):
  # parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated, IsAdminUser]

  def patch(self, request, id):
    followup_checkup = get_object_or_404(FollowupCheckups, id=id)

    followup_checkup.status = 'Completed'
    followup_checkup.save()

    patient = followup_checkup.post_treatment.patient
    HistoricalUpdate.objects.create(patient=patient, date=timezone.now(), note=followup_checkup.note)
    
    return Response({"success": f"Successfully marked as done."}, status=200)

class PostTreatmentRescheduleCheckupUpdateView(APIView):
  # parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated, IsAdminUser]

  def patch(self, request, id):
    followup_checkup = get_object_or_404(FollowupCheckups, id=id)

    new_date = request.data.get('date')
    if not new_date:
      raise ValidationError({"date": "This field is required."})
    followup_checkup.date = new_date
    followup_checkup.save()
    
    return Response({"success": f"Successfully marked as done."}, status=200)

class PostTreatmentScheduleCancelView(APIView):
  # parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated, IsAdminUser]

  def delete(self, request, id):
    followup_checkup = get_object_or_404(FollowupCheckups, id=id)

    followup_checkup.delete()
    
    return Response({"success": f"Successfully deleted."}, status=204)

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
    
    # Define a small helper function to run in the background
    def send_email_in_background(email, file_obj, patient_name):
      try:
        send_loa_email(email, file_obj, patient_name)
      except Exception as e:
        logger.error(f"CRITICAL EMAIL ERROR: {str(e)}")
        print(f"Background email failed: {e}")
    
    # Start the thread. The request proceeds immediately without waiting.
    email_thread = threading.Thread(target=send_email_in_background, args=(email, file_obj, patient_name))
    email_thread.start()

    # result = send_loa_email(email, file_obj, patient_name)

    # if result is True:
    return Response({"message": "LOA sent successfully."}, status=200)
    # return Response({"error": f"Failed to send LOA: {result}"}, status=500)