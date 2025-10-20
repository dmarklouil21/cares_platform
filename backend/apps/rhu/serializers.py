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
  lgu = serializers.CharField(source='rhu.lgu', required=False)
  address = serializers.CharField(source='rhu.address', required=False)
  representative_first_name = serializers.CharField(source='first_name', required=False)
  representative_last_name = serializers.CharField(source='last_name', required=False)

  class Meta:
    model = Representative
    fields = [
      'id',
      'rhu',
      'rhu_name',
      'user',
      'first_name',
      'last_name',
      'representative_first_name',
      'representative_last_name',
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
    request = self.context.get("request", None)
    user = getattr(request, 'user', None)
    if getattr(self, 'instance', None) is None and user is not None:
      if Representative.objects.filter(user=user).exists():
        raise serializers.ValidationError({
          "user": "This user already has a representative profile."
        })

    return attrs
  
  def create(self, validated_data):
    request = self.context.get("request")
    rhu_data = validated_data.pop('rhu', {})
    lgu = rhu_data.get('lgu')
    address = rhu_data.get('address')

    rhu = None
    if lgu:
      rhu, _ = Rhuv2.objects.get_or_create(lgu=lgu, defaults={'address': address or ''})
      if address and rhu.address != address:
        rhu.address = address
        rhu.save(update_fields=['address'])

    if rhu is None:
      raise serializers.ValidationError({"lgu": "LGU is required."})

    validated_data.pop('user', None)
    representative = Representative.objects.create(rhu=rhu, user=request.user, **validated_data)
    return representative

  def update(self, instance, validated_data):
    rhu_data = validated_data.pop('rhu', {})
    new_lgu = rhu_data.get('lgu')
    new_address = rhu_data.get('address')

    if new_lgu:
      rhu, _ = Rhuv2.objects.get_or_create(lgu=new_lgu)
      if new_address:
        if rhu.address != new_address:
          rhu.address = new_address
          rhu.save(update_fields=['address'])
      instance.rhu = rhu
    else:
      if new_address and instance.rhu and instance.rhu.address != new_address:
        instance.rhu.address = new_address
        instance.rhu.save(update_fields=['address'])

    validated_data.pop('user', None)

    for attr, value in validated_data.items():
      setattr(instance, attr, value)
    instance.save()
    return instance

class RhuSerializer(serializers.ModelSerializer):
  representatives = RepresentativeSerializer(many=True, read_only=True)
  class Meta:
    model = Rhuv2
    fields = ['id', 'lgu', 'address', 'representatives', 'created_at']
