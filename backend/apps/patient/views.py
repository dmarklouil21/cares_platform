from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models.functions import TruncMonth
from django.db.models import Count

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.views import APIView

from apps.notifications.utils import create_notification

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
    # --- Step 1: Extract and validate incoming data ---
    try:
      cancer_data_raw = request.data.get("cancer_data")
      general_data_raw = request.data.get("general_data")

      if not cancer_data_raw or not general_data_raw:
        raise ValidationError({"detail": "Both 'Pre Screening Form' and 'Patient Profile' are required."})

      cancer_data = json.loads(cancer_data_raw)
      general_data = json.loads(general_data_raw)

    except json.JSONDecodeError:
      raise ValidationError({"detail": "Invalid JSON format in 'Pre Screening Form' or 'Patient Profile'."})

    # --- Step 2: Check if patient already exists (PreEnrollment duplicate prevention) ---
    # Adjust these fields depending on your Patient model
    first_name = general_data.get("first_name")
    last_name = general_data.get("last_name")
    birth_date = general_data.get("date_of_birth")

    if not all([first_name, last_name, birth_date]):
      raise ValidationError({"detail": "Missing patient identifiers (first_name, last_name, or date_of_birth)."})

    existing_patient = Patient.objects.filter(
      first_name__iexact=first_name.strip(),
      last_name__iexact=last_name.strip(),
      date_of_birth=birth_date
    ).first()

    if existing_patient:
      raise ValidationError(
        {"non_field_errors": ["A pre-enrollment record for this patient already exists."]},
      )

    # --- Step 3: Validate and save via serializer ---
    serializer = self.get_serializer(
      data={"general_data": general_data, "cancer_data": cancer_data},
      context={"request": request}
    )
    serializer.is_valid(raise_exception=True)

    # --- Step 4: Save everything atomically ---
    with transaction.atomic():
      result = serializer.save()

      patient = result["general_data"]
      cancer_info = result["cancer_data"]

      # Create cancer diagnosis
      CancerDiagnosis.objects.create(
        patient=patient,
        diagnosis=cancer_info.final_diagnosis,
        date_diagnosed=cancer_info.date_of_diagnosis,
        cancer_site=", ".join(cancer_info.primary_sites.values_list("name", flat=True)),
        cancer_stage=cancer_info.staging,
      )

      # Optional photo upload
      photo_file = request.FILES.get("photoUrl")
      if photo_file:
        patient.photo_url = photo_file
        patient.save(update_fields=["photo_url"])

    # --- Step 5: Return structured response ---
    return Response(
      self.get_serializer(result).data,
      status=status.HTTP_201_CREATED
    )
# class PreEnrollmentView(generics.CreateAPIView):
#   queryset = Patient.objects.all() 
#   serializer_class = AdminPreEnrollmentSerializer

#   def create(self, request, *args, **kwargs):
#     cancer_data = json.loads(request.data.get("cancer_data", "{}"))
#     general_data = json.loads(request.data.get("general_data", "{}"))

#     serializer = self.get_serializer(
#       data={"general_data": general_data, "cancer_data": cancer_data},
#       context={"request": request}
#     )

#     serializer.is_valid(raise_exception=True)
#     result = serializer.save()

#     patient = result["general_data"] 
#     cancer_data = result["cancer_data"]

#     CancerDiagnosis.objects.create(
#       patient=patient,
#       diagnosis=cancer_data.final_diagnosis,
#       date_diagnosed=cancer_data.date_of_diagnosis,
#       cancer_site=", ".join(cancer_data.primary_sites.values_list("name", flat=True)),
#       cancer_stage=cancer_data.staging,
#     )

#     photo_url = self.request.FILES.get('photoUrl')
#     if photo_url:
#       patient.photo_url = photo_url
#       patient.save()
    
#     return Response(
#       self.get_serializer(result).data,
#       status=status.HTTP_201_CREATED
#     )

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
    user = self.request.user
    request = self.request.query_params

    queryset = Patient.objects.none()  # prevents "unbound" errors

    if user.is_superuser:
      queryset = Patient.objects.all()
    else:
      queryset = Patient.objects.filter(registered_by='Self')

    registered_by_param = request.get('registered_by', None)
    if registered_by_param:
      queryset = Patient.objects.filter(registered_by=registered_by_param)

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

    user = patient.user
    if user and new_status == 'validated':
      create_notification(user, 'Pre Enrollment Approved', f'Your pre enrollement request has been approved.')

    return Response({"message": "Status updated successfully."}, status=status.HTTP_200_OK)

class PatientDeleteView(generics.DestroyAPIView):
  queryset = Patient.objects.all()
  lookup_field = 'patient_id'

  permission_classes = [IsAuthenticated]

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