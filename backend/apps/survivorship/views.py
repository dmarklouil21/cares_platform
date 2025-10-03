from django.shortcuts import get_object_or_404

from rest_framework import generics, status, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView

from .models import PatientHomeVisit
from .serializers import HomevisitSerializer


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

# Retrieve, update, delete a specific home visit
# class PatientHomeVisitDetailView(generics.RetrieveUpdateDestroyAPIView):
#     queryset = PatientHomeVisit.objects.all().select_related("patient", "wellbeing_assessment")
#     serializer_class = HomevisitSerializer
#     permission_classes = [IsAuthenticated]
