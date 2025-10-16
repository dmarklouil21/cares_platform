from rest_framework import serializers
from .models import RHU


class RHUProfileSerializer(serializers.ModelSerializer):
  class Meta:
    model = RHU
    fields = [
      'lgu', 'address', 'phone_number', 'email',
      'representative_first_name', 'representative_last_name',
      'official_representative_name', 'avatar',
    ]
    read_only_fields = ['email']

  def update(self, instance, validated_data):
    for attr, value in validated_data.items():
      setattr(instance, attr, value)
    instance.save()
    return instance

class RHUListSerializer(serializers.ModelSerializer):
  class Meta:
    model = RHU
    fields = ['id', 'lgu', 'official_representative_name']
