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

  def create(self, request, *args, **kwargs):
    user = request.user
      
    # Check if the user is already a beneficiary
    if Patient.objects.filter(user=user).exists():
      return Response(
        {"exists": True},
        status=status.HTTP_400_BAD_REQUEST
      )
    
    return super().create(request, *args, **kwargs)

class PatientDetailView(generics.RetrieveAPIView):
  serializer_class = PatientSerializer
  permission_classes = [IsAuthenticated]

  def get_object(self):
    try:
      return Patient.objects.get(user=self.request.user)
    except Patient.DoesNotExist:
      raise NotFound("No patient record found for this user.")

class PatientListView(generics.ListAPIView):
  queryset = Patient.objects.all()
  serializer_class = PatientSerializer
  permission_classes = [IsAdminUser, IsAuthenticated]