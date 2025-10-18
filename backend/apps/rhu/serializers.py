from rest_framework import serializers

from apps.user.models import User

from .models import RHU, Rhuv2, Representative


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

# New models for the rhu 
class RepresentativeSerializer(serializers.ModelSerializer):
  rhu_name = serializers.ReadOnlyField(source='rhu.lgu')
  lgu = serializers.CharField(write_only=True, required=True)
  address = serializers.CharField(write_only=True, required=True)

  class Meta:
    model = Representative
    fields = [
      'id',
      'rhu',
      'rhu_name',
      'user',
      'first_name',
      'last_name',
      'email',
      'phone_number',
      'official_representative_name',
      'avatar',
      'lgu',
      'address',
      'created_at'
    ]

  def validate(self, attrs):
    """
    Ensure the requesting user doesn't already have a representative profile.
    """
    request = self.context.get("request")
    user = request.user

    if Representative.objects.filter(user=user).exists():
      raise serializers.ValidationError({
        "user": "This user already has a representative profile."
      })

    return attrs
  
  def create(self, validated_data):
    request = self.context.get("request")  

    lgu = validated_data.pop('lgu')
    address = validated_data.pop('address')

    rhu, created = Rhuv2.objects.get_or_create(lgu=lgu, defaults={'address': address})

    representative = Representative.objects.create(rhu=rhu, user=request.user, **validated_data)
    
    return representative

class RhuSerializer(serializers.ModelSerializer):
  representatives = RepresentativeSerializer(many=True, read_only=True)
  class Meta:
    model = Rhuv2
    fields = ['id', 'lgu', 'address', 'representatives', 'created_at']
