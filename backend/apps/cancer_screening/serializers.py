from rest_framework import serializers
from rest_framework.exceptions import NotFound, ValidationError
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import (
  IndividualScreening, ScreeningAttachment,
  MassScreeningRequest, MassScreeningAttachment, MassScreeningAttendanceEntry,
)
# from apps.precancerous.models import PreCancerousMedsRequest
from apps.patient.models import Patient, CancerDiagnosis
from apps.patient.serializers import PatientSerializer
from apps.rhu.models import RHU

class ScreeningAttachmentSerializer(serializers.ModelSerializer):
  class Meta:
    model = ScreeningAttachment
    fields = ['id', 'file', 'uploaded_at', 'doc_type']

# class PreCancerousMedsRequestSerializer(serializers.ModelSerializer):
#   patient_id = serializers.CharField(source='patient.patient_id', read_only=True)
#   class Meta:
#     model = PreCancerousMedsRequest
#     fields = [
#       'id', 'patient_id', 'lgu_name', 'date', 'contact_number', 'prepared_by', 'approved_by',
#       'last_name', 'first_name', 'middle_initial', 'date_of_birth',
#       'interpretation_of_result', 'status', 'release_date_of_meds', 'created_at'
#     ]
#     read_only_fields = ['patient_id', 'status', 'release_date_of_meds', 'created_at']

#   def create(self, validated_data):
#     request = self.context.get('request')
#     patient = get_object_or_404(Patient, user=request.user)
#     return PreCancerousMedsRequest.objects.create(patient=patient, **validated_data)

# class PreCancerousMedsReleaseDateSerializer(serializers.ModelSerializer):
#   class Meta:
#     model = PreCancerousMedsRequest
#     fields = ['release_date_of_meds']

# class PreCancerousMedsAdminStatusSerializer(serializers.Serializer):
#   status = serializers.ChoiceField(choices=['Verified', 'Rejected'])
#   remarks = serializers.CharField(allow_blank=True, allow_null=True, required=False)

class IndividualScreeningSerializer(serializers.ModelSerializer):
  patient = PatientSerializer(read_only=True)
  screening_attachments = ScreeningAttachmentSerializer(many=True, read_only=True)

  class Meta:
    model = IndividualScreening
    fields = [
      'id', 'patient', 'procedure_name', 'procedure_details', 'cancer_site',
      'status', 'created_at', 'has_patient_response', 'screening_attachments',
      'response_description', 'date_approved', 'screening_date', 'uploaded_result',
    ]

class IndividualScreeningAdminCreateSerializer(serializers.ModelSerializer):
  class Meta:
    model = IndividualScreening
    fields = [
      'procedure_name', 'procedure_details', 'cancer_site',
      'status', 'screening_date', 'uploaded_result',
    ]

class MassScreeningAttachmentSerializer(serializers.ModelSerializer):
  class Meta:
    model = MassScreeningAttachment
    fields = ['id', 'file', 'uploaded_at']

class MassScreeningRequestSerializer(serializers.ModelSerializer):
  attachments = MassScreeningAttachmentSerializer(many=True, read_only=True)
  rhu_lgu = serializers.CharField(source='rhu.lgu', read_only=True)

  class Meta:
    model = MassScreeningRequest
    fields = [
      'id', 'rhu_lgu', 'title', 'venue', 'date', 'beneficiaries', 'description', 'support_need',
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
