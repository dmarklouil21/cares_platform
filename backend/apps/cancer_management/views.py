from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, status, filters
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ValidationError

from apps.patient.models import ServiceReceived

from .models import WellBeingQuestion, CancerTreatment
from .serializers import WellBeingQuestionSerializer, CancerTreatmentSubmissionSerializer, CancerTreatmentSerializer

from backend.utils.email import (
  send_individual_screening_status_email,
  send_cancer_treatment_status_email,
  send_return_remarks_email, send_loa_email,
  send_case_summary_email,
  send_precancerous_meds_status_email,
)

import logging
logger = logging.getLogger(__name__)

# Create your views here.

class WellBeingQuestionListView(generics.ListAPIView):
  queryset = WellBeingQuestion.objects.all()
  serializer_class = WellBeingQuestionSerializer

class CancerManagementListView(generics.ListAPIView):
  serializer_class = CancerTreatmentSerializer
  permission_classes = [IsAuthenticated]
  filter_backends = [filters.SearchFilter]
  search_fields = ['patient__patient_id']

  def get_queryset(self):
    qs = CancerTreatment.objects.all()

    status_filter = self.request.query_params.get('status')
    if status_filter:
      qs = qs.filter(status=status_filter)

    patient_id = self.request.query_params.get('patient_id')
    if patient_id:
      qs = qs.filter(patient__patient_id=patient_id)

    return qs

class CancerManagementDetailedView(generics.RetrieveAPIView):
  queryset = CancerTreatment.objects.all()
  serializer_class = CancerTreatmentSerializer
  permission_classes = [IsAuthenticated]
  lookup_field = 'id'

  def get_queryset(self):
    qs = CancerTreatment.objects.all()

    status_filter = self.request.query_params.get('status')
    if status_filter:
      qs = qs.filter(status=status_filter)

    patient_id = self.request.query_params.get('patient_id')
    if patient_id:
      qs = qs.filter(patient__patient_id=patient_id)

    return qs 
  
class CancerTreatmentRequestStatusUpdateView(generics.UpdateAPIView):
  queryset = CancerTreatment.objects.all()
  serializer_class = CancerTreatmentSerializer
  lookup_field = 'id'
  permission_classes = [IsAuthenticated, IsAdminUser]

  def perform_update(self, serializer):
    instance = serializer.save()

    patient = instance.patient
    request_status = instance.status

    if request_status != 'Pending' and request_status != 'Completed':
      patient.status = 'active'
    if request_status == 'Approved':
      instance.date_approved = timezone.now().date()
    elif request_status == 'Completed':
      patient.status = 'validated'
      
      ServiceReceived.objects.create(
        patient=patient,
        service_type = instance.service_type,
        date_completed = timezone.now().date()
      )
    
    instance.save()
    patient.save()

    email_status = send_cancer_treatment_status_email(
      patient=instance.patient, 
      status=instance.status, 
      treatment_date=instance.treatment_date, 
      interview_date=instance.interview_date,
    )
    if email_status is not True:
      logger.error(f"Email failed to send: {email_status}")

class CancerTreatmentDeleteView(generics.DestroyAPIView):
  queryset = CancerTreatment.objects.all()
  serializer_class = CancerTreatmentSerializer
  lookup_field = 'id'
  permission_classes = [IsAuthenticated, IsAdminUser]

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

class SendCaseSummaryiew(APIView):
  permission_classes = [IsAuthenticated, IsAdminUser]

  def post(self, request):
    file_obj = request.FILES.get("file")
    email = request.data.get("email")
    patient_name = request.data.get("patient_name") 

    if not file_obj:
      return Response({"error": "No Case Summary file uploaded."}, status=400)

    if not email:
      return Response({"error": "No recipient email provided."}, status=400)
    
    result = send_case_summary_email(email, file_obj, patient_name)

    if result is True:
      return Response({"message": "Case Summary sent successfully."}, status=200)
    return Response({"error": f"Failed to send Case Summary: {result}"}, status=500)