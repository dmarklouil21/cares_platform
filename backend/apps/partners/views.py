from django.shortcuts import get_object_or_404
from django.db import transaction

from rest_framework import generics, status
from rest_framework import filters
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ValidationError

from apps.pre_enrollment.models import Beneficiary
from apps.patient.models import Patient, CancerDiagnosis
from apps.cancer_screening.models import ScreeningProcedure, ScreeningAttachment

from .models import CancerAwarenessActivity
from .serializers import CancerAwarenessActivitySerializer

import logging

logger = logging.getLogger(__name__)

# Create your views here.
class CancerAwarenessActivityCreateView(generics.CreateAPIView):
  queryset = CancerAwarenessActivity.objects.all()
  serializer_class = CancerAwarenessActivitySerializer
  parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated]

  def perform_create(self, serializer):
    try:
      serializer.save(uploader=self.request.user)
    except Exception:
      logger.exception("Error creating cancer awareness activity")
      raise
    # serializer.save(uploader=self.request.user)
    # try:
    #   with transaction.atomic():
    #     uploader = self.request.user

    #     cancer_awareness = serializer.save(uploader=uploader)

    # except Exception as e:
    #   logger.error(f"Error creating screening procedure: {str(e)}")
    #   raise e

class CancerAwarenessActivityUpdateView(generics.UpdateAPIView):
  queryset = CancerAwarenessActivity.objects.all()
  serializer_class = CancerAwarenessActivitySerializer
  lookup_field = 'id'
  parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated]

class CancerAwarenessActivityListView(generics.ListAPIView):
  queryset = CancerAwarenessActivity.objects.all()
  serializer_class = CancerAwarenessActivitySerializer
  permission_classes = [IsAuthenticated]

class CancerAwarenessActivityDeleteView(generics.DestroyAPIView):
  queryset = CancerAwarenessActivity.objects.all()
  serializer_class = CancerAwarenessActivitySerializer
  lookup_field = 'id'
  permission_classes = [IsAuthenticated]