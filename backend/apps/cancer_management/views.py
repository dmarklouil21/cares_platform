from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, status, filters
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ValidationError

from .models import WellBeingQuestion, CancerTreatment
from .serializers import WellBeingQuestionSerializer, CancerTreatmentSubmissionSerializer, CancerTreatmentSerializer

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