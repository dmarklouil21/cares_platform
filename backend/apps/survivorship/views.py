from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction

from rest_framework import generics, status, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.parsers import MultiPartParser, FormParser

from apps.patient.models import Patient
from apps.cancer_management.models import CancerTreatment

from .models import PatientHomeVisit, HormonalReplacement, HormonalReplacementRequiredAttachment
from .serializers import HomevisitSerializer, HormonalReplacementSerializer

from backend.utils.email import (
  send_report_email
)

import logging

logger = logging.getLogger(__name__)

# List all home visits or create a new one
class PatientHomeVisitListView(generics.ListAPIView):
  serializer_class = HomevisitSerializer
  permission_classes = [IsAuthenticated]
  filter_backends = [filters.SearchFilter]
  search_fields = ['patient__patient_id']

  def get_queryset(self):
    qs = PatientHomeVisit.objects.all()

    status_filter = self.request.query_params.get('status')
    if status_filter:
      qs = qs.filter(status=status_filter)

    patient_id = self.request.query_params.get('patient_id')
    if patient_id:
      qs = qs.filter(patient__patient_id=patient_id)

    return qs

class PatientHomeVisitCreateView(generics.CreateAPIView):
    queryset = PatientHomeVisit.objects.all()
    serializer_class = HomevisitSerializer
    permission_classes = [IsAuthenticated]

class PatientHomeVisitDetailView(generics.RetrieveAPIView):
  queryset = PatientHomeVisit.objects.all()
  serializer_class = HomevisitSerializer
  permission_classes = [IsAuthenticated]
  lookup_field = 'id'

  def get_queryset(self):
    qs = PatientHomeVisit.objects.all()

    status_filter = self.request.query_params.get('status')
    if status_filter:
      qs = qs.filter(status=status_filter)

    patient_id = self.request.query_params.get('patient_id')
    if patient_id:
      qs = qs.filter(patient__patient_id=patient_id)

    return qs 

class PatientHomeVisitUpdateView(generics.UpdateAPIView):
  queryset = PatientHomeVisit.objects.all()
  serializer_class = HomevisitSerializer
  permission_classes = [IsAuthenticated]
  lookup_field = "id"   # so you can update by /<id> in the URL

class SendReportView(APIView):
  permission_classes = [IsAuthenticated, IsAdminUser]

  def post(self, request):
    file_obj = request.FILES.get("file")
    email = request.data.get("email")
    patient_name = request.data.get("patient_name") 

    if not file_obj:
      return Response({"error": "No Report file uploaded."}, status=400)

    if not email:
      return Response({"error": "No recipient email provided."}, status=400)
    
    result = send_report_email(email, file_obj, patient_name)

    if result is True:
      return Response({"message": "Report Document sent successfully."}, status=200)
    return Response({"error": f"Failed to send the report file: {result}"}, status=500)

# Retrieve, update, delete a specific home visit
# class PatientHomeVisitDetailView(generics.RetrieveUpdateDestroyAPIView):
#     queryset = PatientHomeVisit.objects.all().select_related("patient", "wellbeing_assessment")
#     serializer_class = HomevisitSerializer
#     permission_classes = [IsAuthenticated]

class HormonalReplacementCreateView(generics.CreateAPIView):
  queryset = HormonalReplacement.objects.all()
  serializer_class = HormonalReplacementSerializer
  parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated]

  def perform_create(self, serializer):
    try:
      with transaction.atomic():
        patient = get_object_or_404(Patient, patient_id=self.request.data.get('patient_id'))
        cancer_treatment = get_object_or_404(CancerTreatment, patient=patient)
        service_completed = cancer_treatment.service_type
        existing_record = HormonalReplacement.objects.filter(
          patient=patient,
          status__in=['Pending', 'Approved']
        ).first()

        if existing_record:
          raise ValidationError({
            'non_field_errors': [
              "You already have an ongoing request. Please wait for its feedback before submitting another."
            ]
          })
    
        instance = serializer.save(
          patient=patient,  # ensure patient is set
          service_completed=service_completed
        )

        files_dict = {}
        for key, value in self.request.FILES.items():
          if key.startswith("files."):
            field_name = key.split("files.")[1] 
            files_dict[field_name] = value

        for key, file in files_dict.items():
          HormonalReplacementRequiredAttachment.objects.create(
            hormonal_replacement=instance,
            file=file,
            doc_type=key 
          )

    except Exception as e:
      logger.error(f"Error creating hormonal replacement request: {str(e)}")
      raise e

class HormonalReplacementListView(generics.ListAPIView):
  serializer_class = HormonalReplacementSerializer
  permission_classes = [IsAuthenticated]
  filter_backends = [filters.SearchFilter]
  search_fields = ['patient__patient_id']

  def get_queryset(self):
    qs = HormonalReplacement.objects.all()

    status_filter = self.request.query_params.get('status')
    if status_filter:
      qs = qs.filter(status=status_filter)

    patient_id = self.request.query_params.get('patient_id')
    if patient_id:
      qs = qs.filter(patient__patient_id=patient_id)

    return qs

class HormonalReplacementDetailView(generics.RetrieveAPIView):
  queryset = HormonalReplacement.objects.all()
  serializer_class = HormonalReplacementSerializer
  permission_classes = [IsAuthenticated]
  lookup_field = 'id'

  def get_queryset(self):
    qs = HormonalReplacement.objects.all()

    status_filter = self.request.query_params.get('status')
    if status_filter:
      qs = qs.filter(status=status_filter)

    patient_id = self.request.query_params.get('patient_id')
    if patient_id:
      qs = qs.filter(patient__patient_id=patient_id)

    return qs 

class HormonalReplacementUpdateView(generics.UpdateAPIView):
  queryset = HormonalReplacement.objects.all()
  serializer_class = HormonalReplacementSerializer
  permission_classes = [IsAuthenticated]
  lookup_field = "id"   # so you can update by /<id> in the URL

  def perform_update(self, serializer):
    instance = serializer.save()

    if instance.status == 'Approved':
      instance.date_approved = timezone.now().date()
      instance.save(update_fields=['date_approved'])
    # return super().perform_update(serializer)