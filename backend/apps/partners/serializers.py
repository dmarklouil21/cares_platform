from rest_framework import serializers

from apps.user.models import User
from apps.partners.models import CancerAwarenessActivity  # adjust path if needed

from .models import Private, PrivateRepresentative

class CancerAwarenessActivitySerializer(serializers.ModelSerializer):
  uploader_name = serializers.CharField(source="uploader.fullname", read_only=True)

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
      "attachment",
      "created_at",
      # "updated_at",
    ]
    read_only_fields = ["id", "created_at", "uploader_name"]
  
  # def create(self, validated_data):
  #   uploader = self.request.user

  #   cancer_awareness_activity = CancerAwarenessActivity.objects.create(uploader=uploader, **validated_data)
        
  #   return cancer_awareness_activity

# New models for the rhu 
class PrivateRepresentativeSerializer(serializers.ModelSerializer):
  institution_name = serializers.ReadOnlyField(source='private.institution_name')
  # lgu = serializers.CharField(write_only=True, required=True)
  address = serializers.CharField(write_only=True, required=True)

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
      'address',
      'created_at'
    ]

  def validate(self, attrs):
    """
    Ensure the requesting user doesn't already have a representative profile.
    """
    request = self.context.get("request")
    user = request.user

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
