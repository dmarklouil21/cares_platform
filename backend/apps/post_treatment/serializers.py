from rest_framework import serializers
from rest_framework.exceptions import NotFound, ValidationError
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import (
  PostTreatment, RequiredAttachment, FollowupCheckups
)
from apps.patient.serializers import PatientSerializer
from apps.rhu.models import RHU

class FollowupCheckupsSerializer(serializers.ModelSerializer):
  class Meta:
    model = FollowupCheckups
    fields = [
      'id',
      'date',
      'note',
      'status',
      'created_at',
      'date_completed',
    ]

class RequiredAttachmentSerializer(serializers.ModelSerializer):
  class Meta:
    model = RequiredAttachment
    fields = ['id', 'file', 'uploaded_at', 'doc_type']

class PostTreatmentSerializer(serializers.ModelSerializer):
  patient = PatientSerializer(read_only=True)
  required_attachments = RequiredAttachmentSerializer(many=True, read_only=True)
  followup_checkups = FollowupCheckupsSerializer(many=True, read_only=True)

  class Meta:
    model = PostTreatment
    fields = [
      'id', 'patient', 'procedure_name', 'status', 'created_at', 'has_patient_response', 
      'required_attachments', 'response_description', 'date_approved', 'laboratory_test_date', 
      'uploaded_result', 'followup_checkups'
    ]
