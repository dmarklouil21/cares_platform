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
  file_url = serializers.SerializerMethodField()
  class Meta:
    model = RequiredAttachment
    fields = ['id', 'file', 'uploaded_at', 'doc_type', 'file_url']
  
  def get_file_url(self, obj):
    """Return the Cloudinary URL for the file"""
    if obj.file:
        return obj.file.url  # This returns the full Cloudinary URL
    return None

class PostTreatmentSerializer(serializers.ModelSerializer):
  patient = PatientSerializer(read_only=True)
  required_attachments = RequiredAttachmentSerializer(many=True, read_only=True)
  followup_checkups = FollowupCheckupsSerializer(many=True, read_only=True)

  uploaded_result_url = serializers.SerializerMethodField()
  class Meta:
    model = PostTreatment
    fields = [
      'id', 'patient', 'procedure_name', 'status', 'created_at', 'has_patient_response', 
      'required_attachments', 'response_description', 'date_approved', 'laboratory_test_date', 
      'uploaded_result', 'followup_checkups', 'service_provider', 'uploaded_result_url',
    ]
  
  def get_uploaded_result_url(self, obj):
    """Return the Cloudinary URL for uploaded_result"""
    if obj.uploaded_result:
        return obj.uploaded_result.url
    return None

class PostTreatmentAdminCreateSerializer(serializers.ModelSerializer):
  class Meta:
    model = PostTreatment
    fields = [
      'procedure_name', 'service_provider',
      'status', 'laboratory_test_date'
    ]