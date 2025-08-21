from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.exceptions import NotFound

from apps.patient.models import Patient
from apps.patient.serializers import PatientSerializer

from .models import Beneficiary
from .serializers import BeneficiarySerializer
from .pagination import BeneficiaryPagination

# Create your views here.

# Beneficiary

class BeneficiaryCreateView(generics.CreateAPIView):
  queryset = Beneficiary.objects.all()
  serializer_class = BeneficiarySerializer

  permission_classes = [IsAuthenticated]

  def create(self, request, *args, **kwargs):
    user = request.user

    # Check if the user is already a beneficiary
    if Beneficiary.objects.filter(user=user).exists():
      return Response(
        {"exists": True},
        status=status.HTTP_400_BAD_REQUEST
      )
    
    return super().create(request, *args, **kwargs)

class BeneficiaryDetailView(generics.RetrieveAPIView):
  serializer_class = BeneficiarySerializer
  permission_classes = [IsAuthenticated]

  def get_object(self):
    try:
      return Beneficiary.objects.get(user=self.request.user)
    except Beneficiary.DoesNotExist:
      raise NotFound("No beneficiary record found for this user.")

# EJACC

class PatientListView(generics.ListAPIView):
  queryset = Patient.objects.all()
  serializer_class = PatientSerializer
  # lookup_field = 'patient_id'

  permission_classes = [IsAuthenticated, IsAdminUser]
  # pagination_class = BeneficiaryPagination

class PatientPreEnrollmentDetailView(generics.RetrieveAPIView):
  queryset = Patient.objects.all()
  serializer_class = PatientSerializer
  lookup_field = 'patient_id'

  permission_classes = [IsAuthenticated, IsAdminUser]

class PatientPreEnrollmentStatusUpdateView(generics.UpdateAPIView):
  queryset = Patient.objects.all()
  serializer_class = PatientSerializer
  lookup_field = 'patient_id'

  permission_classes = [IsAuthenticated, IsAdminUser]

class PatientPreEnrollmentDeleteView(generics.DestroyAPIView):
  queryset = Patient.objects.all()
  lookup_field = 'patient_id'

  permission_classes = [IsAuthenticated, IsAdminUser]
