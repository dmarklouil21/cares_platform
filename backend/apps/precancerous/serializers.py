from rest_framework import serializers
from rest_framework.exceptions import NotFound, ValidationError
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import (
  PreCancerousMedsRequest
)
from apps.patient.serializers import PatientSerializer
from apps.rhu.models import RHU

class PreCancerousMedsRequestSerializer(serializers.ModelSerializer):
  patient = PatientSerializer(read_only=True)

  class Meta:
    model = PreCancerousMedsRequest
    fields = [
      'id', 'patient', 'interpretation_of_result', 'status', 'created_at', 'prepared_by', 
      'approved_by', 'date_approved', 'release_date_of_meds', 
    ]
