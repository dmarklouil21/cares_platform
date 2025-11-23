from rest_framework import serializers
from rest_framework.exceptions import NotFound, ValidationError
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import (
  IndividualScreening, ScreeningAttachment,
  MassScreeningRequest, MassScreeningAttachment, MassScreeningAttendanceEntry,
)

from apps.patient.models import Patient, CancerDiagnosis
from apps.patient.serializers import PatientSerializer
from apps.rhu.models import RHU

class ScreeningAttachmentSerializer(serializers.ModelSerializer):
  file_url = serializers.SerializerMethodField()
  class Meta:
    model = ScreeningAttachment
    fields = ['id', 'file', 'uploaded_at', 'doc_type', 'file_url']
  
  def get_file_url(self, obj):
    """Return the Cloudinary URL for the file"""
    if obj.file:
        return obj.file.url  # This returns the full Cloudinary URL
    return None

class IndividualScreeningSerializer(serializers.ModelSerializer):
  patient = PatientSerializer(read_only=True)
  screening_attachments = ScreeningAttachmentSerializer(many=True, read_only=True)

  class Meta:
    model = IndividualScreening
    fields = [
      'id', 'patient', 'procedure_name', 'procedure_details', 'cancer_site',
      'status', 'created_at', 'has_patient_response', 'screening_attachments', 'service_provider',
      'response_description', 'date_approved', 'screening_date', 'uploaded_result',
    ]
  

class IndividualScreeningAdminCreateSerializer(serializers.ModelSerializer):
  class Meta:
    model = IndividualScreening
    fields = [
      'procedure_name', 'procedure_details', 'cancer_site',
      'status', 'screening_date', 'uploaded_result', 'service_provider',
    ]

class MassScreeningAttachmentSerializer(serializers.ModelSerializer):
  class Meta:
    model = MassScreeningAttachment
    fields = ['id', 'file', 'uploaded_at']

class MassScreeningRequestSerializer(serializers.ModelSerializer):
  attachments = MassScreeningAttachmentSerializer(many=True, read_only=True)
  rhu_lgu = serializers.CharField(source='rhu.lgu', read_only=True)
  institution_name = serializers.CharField(source='private.institution_name', read_only=True)

  class Meta:
    model = MassScreeningRequest
    fields = [
      'id', 'rhu_lgu', 'institution_name', 'title', 'venue', 'date', 'beneficiaries', 'description', 'support_need',
      'status', 'created_at', 'attachments'
    ]
    read_only_fields = ['status', 'created_at', 'attachments', 'rhu_lgu']

  def create(self, validated_data):
    # rhu is supplied by the view via serializer.save(rhu=...)
    return MassScreeningRequest.objects.create(**validated_data)

  def validate_date(self, value):
    # Ensure date is not later than today
    if value and value < timezone.localdate():
      raise serializers.ValidationError('Date cannot be earlier than today.')
    return value

class MassScreeningAttendanceEntrySerializer(serializers.ModelSerializer):
  class Meta:
    model = MassScreeningAttendanceEntry
    fields = ['id', 'name', 'result', 'created_at']
    read_only_fields = ['id', 'created_at']

class MassScreeningAttendanceBulkSerializer(serializers.Serializer):
  entries = MassScreeningAttendanceEntrySerializer(many=True)
