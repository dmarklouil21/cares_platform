from rest_framework import serializers

from apps.user.models import User

from apps.patient.models import Patient
from apps.patient.serializers import PatientSerializer
# from apps.partners.models import CancerAwarenessActivity 

from .models import Private, PrivateRepresentative, CancerAwarenessAttendance, CancerAwarenessActivity

class CancerAwarenessActivitySerializer(serializers.ModelSerializer):
  uploader_name = serializers.CharField(source="uploader.fullname", read_only=True)

  attachment_url = serializers.SerializerMethodField()
  photo_url = serializers.SerializerMethodField()

  class Meta:
    model = CancerAwarenessActivity
    fields = [
      "id",
      # "uploader",
      "uploader_name",
      "title",
      "description",
      "date",
      "photo",
      "photo_url",
      "attachment",
      "attachment_url",
      "created_at",
      # "updated_at",
    ]
    read_only_fields = ["id", "created_at", "uploader_name"]
  
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
        model = CancerAwarenessAttendance
        fields = ['id', 'patient', 'attended_at']

class AttendanceCreateSerializer(serializers.ModelSerializer):
    patient_ids = serializers.ListField(
        child=serializers.CharField(),
        write_only=True
    )

    class Meta:
        model = CancerAwarenessAttendance
        fields = ['patient_ids']
    
    def create(self, validated_data):
        print("Context: ", self.context)
        print("Validated Data: ", validated_data)
        
        # Get the activity object directly from context
        activity = self.context.get('activity')
        
        if not activity:
            raise serializers.ValidationError("Activity not found in context")
        
        patient_ids = validated_data['patient_ids']
        
        # Clear existing attendances and create new ones
        CancerAwarenessAttendance.objects.filter(activity=activity).delete()
        
        attendances = []
        for patient_id in patient_ids:
            try:
                patient = Patient.objects.get(patient_id=patient_id)
                attendance = CancerAwarenessAttendance(
                    activity=activity,
                    patient=patient
                )
                attendances.append(attendance)
            except Patient.DoesNotExist:
                print(f"Patient with patient_id {patient_id} not found")
                continue
        
        return CancerAwarenessAttendance.objects.bulk_create(attendances)
  
# New models for the rhu 
class PrivateRepresentativeSerializer(serializers.ModelSerializer):
  institution_name = serializers.ReadOnlyField(source='private.institution_name')
  # lgu = serializers.CharField(write_only=True, required=True)
  address = serializers.CharField(write_only=True, required=True)
  avatar_url = serializers.SerializerMethodField()

  class Meta:
    model = PrivateRepresentative
    fields = [
      'id',
      'private',
      'institution_name',
      'user',
      'first_name',
      'last_name',
      'email',
      'phone_number',
      'avatar',
      'avatar_url',
      'address',
      'created_at'
    ]
  
  def get_avatar_url(self, obj):
    """Return the Cloudinary URL for the avatar"""
    if obj.avatar:
        return obj.avatar.url  # This returns the full Cloudinary URL
    return None

  def validate(self, attrs):
    """
    Ensure the requesting user doesn't already have a representative profile.
    """
    request = self.context.get("request")
    user = request.user

    # If updating an existing instance, allow the same user
    instance = getattr(self, 'instance', None)
    if instance is not None:
      # If the instance already belongs to this user, it's fine
      if instance.user_id == getattr(user, 'id', None):
        return attrs
      # Otherwise, ensure the target user doesn't already have a profile
      if PrivateRepresentative.objects.filter(user=user).exclude(pk=instance.pk).exists():
        raise serializers.ValidationError({
          "user": "This user already has a representative profile."
        })
      return attrs

    # Creation path: block if the user already has a representative
    if PrivateRepresentative.objects.filter(user=user).exists():
      raise serializers.ValidationError({
        "user": "This user already has a representative profile."
      })

    return attrs
  
  def create(self, validated_data):
    request = self.context.get("request")  

    institution_name = validated_data.pop('institution_name')
    # address = validated_data.pop('address')

    private, created = Private.objects.get_or_create(institution_name=institution_name, defaults={'address': validated_data['address']})

    representative = PrivateRepresentative.objects.create(private=private, user=request.user, **validated_data)
    
    return representative

class PrivateSerializer(serializers.ModelSerializer):
  representatives = PrivateRepresentativeSerializer(many=True, read_only=True)
  class Meta:
    model = Private
    fields = ['id', 'institution_name', 'address', 'representatives', 'created_at']
