from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.exceptions import NotFound

from .models import Patient
from .serializers import PatientSerializer
# from .pagination import BeneficiaryPagination

# Create your views here.

class PatientCreateView(generics.CreateAPIView):
  queryset = Patient.objects.all()
  serializer_class = PatientSerializer

  permission_classes = [IsAuthenticated]

class PatientDetailView(generics.RetrieveAPIView):
  queryset = Patient.objects.all()
  serializer_class = PatientSerializer
  permission_classes = [IsAuthenticated, IsAdminUser]
  lookup_field = 'patient_id'

class PatientUpdateView(generics.UpdateAPIView):
  queryset = Patient.objects.all()
  serializer_class = PatientSerializer
  lookup_field = 'patient_id'

  permission_classes = [IsAuthenticated, IsAdminUser]

class PatientListView(generics.ListAPIView):
  serializer_class = PatientSerializer
  permission_classes = [IsAuthenticated]

  def get_queryset(self):
    queryset = Patient.objects.all()
    status_param = self.request.query_params.get('status', None)
    if status_param:
      queryset = queryset.filter(status=status_param)
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
