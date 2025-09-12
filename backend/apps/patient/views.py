from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.exceptions import NotFound

from .models import Patient, CancerDiagnosis
from .serializers import PatientSerializer, AdminPreEnrollmentSerializer

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

  
# To be deleted
# class PatientCreateView(generics.CreateAPIView):
#   queryset = Patient.objects.all()
#   serializer_class = PatientSerializer

#   permission_classes = [IsAuthenticated]

class PatientDetailView(generics.RetrieveAPIView):
  queryset = Patient.objects.all()
  serializer_class = PatientSerializer
  permission_classes = [IsAuthenticated]
  lookup_field = 'patient_id'

# To be deleted
# class PatientUpdateView(generics.UpdateAPIView):
#   queryset = Patient.objects.all()
#   serializer_class = PatientSerializer
#   lookup_field = 'patient_id'

#   permission_classes = [IsAuthenticated, IsAdminUser]

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

class PatientStatusUpdateView(generics.UpdateAPIView):
  queryset = Patient.objects.all()
  serializer_class = PatientSerializer
  lookup_field = 'patient_id'

  permission_classes = [IsAuthenticated, IsAdminUser]

class PatientDeleteView(generics.DestroyAPIView):
  queryset = Patient.objects.all()
  lookup_field = 'patient_id'

  permission_classes = [IsAuthenticated, IsAdminUser]
