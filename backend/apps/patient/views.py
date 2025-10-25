from django.shortcuts import get_object_or_404
from django.db.models.functions import TruncMonth
from django.db.models import Count

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.views import APIView

from apps.survivorship.models import PatientHomeVisit

from .models import Patient, CancerDiagnosis
from .serializers import PatientSerializer, AdminPreEnrollmentSerializer

from . models import PATIENT_STATUS_CHOICES

import json
# from .pagination import BeneficiaryPagination

# Create your views here.

class PreEnrollmentView(generics.CreateAPIView):
  queryset = Patient.objects.all() 
  serializer_class = AdminPreEnrollmentSerializer

  def create(self, request, *args, **kwargs):
    cancer_data = json.loads(request.data.get("cancer_data", "{}"))
    general_data = json.loads(request.data.get("general_data", "{}"))

    serializer = self.get_serializer(
      data={"general_data": general_data, "cancer_data": cancer_data},
      context={"request": request}
    )

    serializer.is_valid(raise_exception=True)
    result = serializer.save()

    patient = result["general_data"] 
    cancer_data = result["cancer_data"]

    CancerDiagnosis.objects.create(
      patient=patient,
      diagnosis=cancer_data.final_diagnosis,
      date_diagnosed=cancer_data.date_of_diagnosis,
      cancer_site=", ".join(cancer_data.primary_sites.values_list("name", flat=True)),
      cancer_stage=cancer_data.staging,
    )

    photo_url = self.request.FILES.get('photoUrl')
    if photo_url:
      patient.photo_url = photo_url
      patient.save()
    
    return Response(
      self.get_serializer(result).data,
      status=status.HTTP_201_CREATED
    )

class PatientUpdateView(generics.UpdateAPIView):
  queryset = Patient.objects.all()
  serializer_class = AdminPreEnrollmentSerializer
  lookup_field = "patient_id"  # or "id" depending on your URLconf

  def update(self, request, *args, **kwargs):
    general_data = json.loads(request.data.get("general_data", "{}"))
    cancer_data = json.loads(request.data.get("cancer_data", "{}"))
    
    instance  = self.get_object()  # fetch existing Patient
    serializer = self.get_serializer(
      instance,
      data={"general_data": general_data, "cancer_data": cancer_data},
      partial=True,  # allow PATCH
      context={"request": request},
    )
    serializer.is_valid(raise_exception=True)
    patient = serializer.save()

    print("Request Data: ", request.data)

    cancer_data = patient.pre_screening_form

    CancerDiagnosis.objects.update(
      patient=patient,
      diagnosis=cancer_data.final_diagnosis,
      date_diagnosed=cancer_data.date_of_diagnosis,
      cancer_site=", ".join(cancer_data.primary_sites.values_list("name", flat=True)),
      cancer_stage=cancer_data.staging,
      )

    photo_url = self.request.FILES.get("photo_url")
    if photo_url:
      patient.photo_url = photo_url
      patient.save()

    return Response(
      PatientSerializer(patient, context={"request": request}).data,
      status=status.HTTP_200_OK,
    )

class PatientDetailView(generics.RetrieveAPIView):
  queryset = Patient.objects.all()
  serializer_class = PatientSerializer
  permission_classes = [IsAuthenticated]
  lookup_field = 'patient_id'

class PatientListView(generics.ListAPIView):
  serializer_class = PatientSerializer
  permission_classes = [IsAuthenticated]

  def get_queryset(self):
    queryset = Patient.objects.all()
    request = self.request.query_params

    status_param = request.get('status', None) # self.request.query_params.get('status', None)
    registered_by_param = request.get('registered_by', None)
    city_param = request.get('city', None)

    if status_param:
      queryset = queryset.filter(status=status_param)

    if registered_by_param:
      queryset = queryset.filter(registered_by=registered_by_param)

    if city_param:
      queryset = queryset.filter(city=city_param)

    return queryset

class PatientStatusUpdateView(APIView):
  permission_classes = [IsAuthenticated, IsAdminUser]

  def patch(self, request, patient_id):
    patient = get_object_or_404(Patient, patient_id=patient_id)

    new_status = request.data.get('status')
    if new_status not in dict(PATIENT_STATUS_CHOICES).keys():
      raise ValidationError("Invalid status value.")
    patient.status = new_status
    patient.save()

    return Response({"message": "Status updated successfully."}, status=status.HTTP_200_OK)
  
class PatientDeleteView(generics.DestroyAPIView):
  queryset = Patient.objects.all()
  lookup_field = 'patient_id'

  permission_classes = [IsAuthenticated, IsAdminUser]

class PatientStatsView(APIView):
  permission_classes = [IsAuthenticated]

  def get(self, request, *args, **kwargs):
    # You can customize these filters based on your model fields
    total_patients = Patient.objects.count()
    due_for_home_visit = PatientHomeVisit.objects.filter(status="Processing").count()
    active_patients = Patient.objects.filter(status="active").count()
    pending_pre_enrollment = Patient.objects.filter(status="pending").count()

    # === Monthly Data ===
    monthly_counts = (
      Patient.objects
      .annotate(month=TruncMonth("created_at")) 
      .values("month")
      .annotate(count=Count("id"))
      .order_by("month")
    )

    # Convert to chart-friendly format
    monthly_data = []
    month_labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    for entry in monthly_counts:
      month_index = entry["month"].month - 1  # 0-based index
      monthly_data.append({
          "label": month_labels[month_index],
          "value": entry["count"]
      })

    return Response({
      "total_patients": total_patients,
      "due_for_home_visit": due_for_home_visit,
      "active_patients": active_patients,
      "pending_pre_enrollment": pending_pre_enrollment,
      "monthly_data": monthly_data
    })