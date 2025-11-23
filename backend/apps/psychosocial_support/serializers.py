from rest_framework import serializers
from .models import Activity, PsychosocialAttendance
import json
from django.utils import timezone

from apps.patient.models import Patient
from apps.patient.serializers import PatientSerializer

class ActivitySerializer(serializers.ModelSerializer):
  attachment_url = serializers.SerializerMethodField()
  photo_url = serializers.SerializerMethodField()

  class Meta:
    model = Activity
    fields = [
      "id",
      "title",
      "description",
      "date",
      "photo",
      "photo_url",
      "attachment",
      "attachment_url",
      "created_at",
    ]
    read_only_fields = ["id", "created_at"]
  
  def get_attachment_url(self, obj):
    """Return the Cloudinary URL for the file"""
    if obj.attachment:
        return obj.attachment.url  # This returns the full Cloudinary URL
    return None
  def get_photo_url(self, obj):
    """Return the Cloudinary URL for the photo"""
    if obj.photo:
        return obj.photo.url  # This returns the full Cloudinary URL
    return None

class AttendanceSerializer(serializers.ModelSerializer):
    patient = PatientSerializer(read_only=True)
    
    class Meta:
        model = PsychosocialAttendance
        fields = ['id', 'patient', 'attended_at']

class AttendanceCreateSerializer(serializers.ModelSerializer):
    patient_ids = serializers.ListField(
        child=serializers.CharField(),
        write_only=True
    )

    class Meta:
        model = PsychosocialAttendance
        fields = ['patient_ids']
    
    def create(self, validated_data):
        # Get the activity object directly from context
        activity = self.context.get('activity')
        
        if not activity:
            raise serializers.ValidationError("Activity not found in context")
        
        patient_ids = validated_data['patient_ids']
        
        # Clear existing attendances and create new ones
        PsychosocialAttendance.objects.filter(activity=activity).delete()
        
        attendances = []
        for patient_id in patient_ids:
            try:
                patient = Patient.objects.get(patient_id=patient_id)
                attendance = PsychosocialAttendance(
                    activity=activity,
                    patient=patient
                )
                attendances.append(attendance)
            except Patient.DoesNotExist:
                print(f"Patient with patient_id {patient_id} not found")
                continue
        
        return PsychosocialAttendance.objects.bulk_create(attendances)
    
class ActivityCreateSerializer(serializers.ModelSerializer):
    # Store as plain text; we'll coerce various inputs into a comma-separated string
    patients = serializers.CharField(allow_blank=True, required=False)
    # Make date parsing explicit
    date = serializers.DateField(input_formats=['%Y-%m-%d'])

    class Meta:
        model = Activity
        fields = ['id', 'title', 'description', 'date', 'photo', 'attachment', 'patients']

    def to_internal_value(self, data):
        # Make a shallow copy we can mutate safely
        try:
            mutable = data.copy()
        except Exception:
            mutable = dict(data)

        raw = mutable.get('patients')
        if raw is not None:
            names_list = []
            # If provided as JSON string (common in multipart)
            if isinstance(raw, str):
                try:
                    loaded = json.loads(raw)
                except Exception:
                    # Fallback: comma-separated string
                    loaded = [s.strip() for s in raw.split(',') if s.strip()]
                if isinstance(loaded, (list, tuple)):
                    names_list = [str(x) for x in loaded if str(x).strip()]
                elif isinstance(loaded, dict):
                    try:
                        items = [loaded[k] for k in sorted(loaded.keys(), key=lambda k: int(k) if str(k).isdigit() else k)]
                    except Exception:
                        items = list(loaded.values())
                    names_list = [str(x) for x in items if str(x).strip()]
                else:
                    names_list = [str(loaded)] if str(loaded).strip() else []
            elif isinstance(raw, (list, tuple)):
                names_list = [str(x) for x in raw if str(x).strip()]
            elif isinstance(raw, dict):
                try:
                    items = [raw[k] for k in sorted(raw.keys(), key=lambda k: int(k) if str(k).isdigit() else k)]
                except Exception:
                    items = list(raw.values())
                names_list = [str(x) for x in items if str(x).strip()]

            # Join into comma-separated string for storage
            mutable['patients'] = ', '.join(names_list)

        return super().to_internal_value(mutable)

    def validate_date(self, value):
        # Ensure date is today or in the future
        today = timezone.localdate()
        if value < today:
            raise serializers.ValidationError("Date cannot be in the past.")
        return value

    def validate_patients(self, value):
        # Ensure it's a simple string (already joined in to_internal_value). Handle direct strings too.
        if value is None:
            return ""
        if isinstance(value, (list, tuple, dict)):
            # Safety net: convert to string
            try:
                if isinstance(value, dict):
                    items = [value[k] for k in sorted(value.keys(), key=lambda k: int(k) if str(k).isdigit() else k)]
                else:
                    items = list(value)
            except Exception:
                items = list(value) if not isinstance(value, dict) else list(value.values())
            return ', '.join([str(x).strip() for x in items if str(x).strip()])
        return str(value)
