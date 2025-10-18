from rest_framework import serializers
from apps.user.models import User

class RegistrationSerializer(serializers.ModelSerializer):
  class Meta:
    model = User
    fields = [
      'email', 'first_name', 'last_name', 'date_of_birth', 'age',
      'phone_number', 'is_resident_of_cebu', 'lgu', 'address',
    ]
    extra_kwargs = {
      'email': {'required': True},
      'phone_number': {'required': True},
    }

  def create(self, validated_data):
    # Password will be set in the view
    email = validated_data.pop("email")
    return User.objects.create_user(username=email, email=email, **validated_data) 

class RHURegistrationSerializer(serializers.Serializer):
  lgu = serializers.CharField(max_length=100)
  address = serializers.CharField(max_length=255)
  phone_number = serializers.CharField(max_length=15)
  email = serializers.CharField(max_length=255)
  first_name = serializers.CharField(max_length=150)
  last_name = serializers.CharField(max_length=150)
  official_representative_name = serializers.CharField(max_length=255)

  def create(self, validated_data):
    return User.objects.create_user(
      username=validated_data['email'],
      email=validated_data['email'],
      first_name=validated_data['first_name'],
      last_name=validated_data['last_name'],
      phone_number=validated_data['phone_number'],
      lgu=validated_data['lgu'],
      address=validated_data['address'],
      is_rhu=True,
      # is_active=False,
    )
    # return user

class PrivateRegistrationSerializer(serializers.Serializer):
  institution_name = serializers.CharField(max_length=100)
  email = serializers.CharField(max_length=255)
  phone_number = serializers.CharField(max_length=15)
  address = serializers.CharField(max_length=255)
  first_name = serializers.CharField(max_length=150)
  last_name = serializers.CharField(max_length=150)

  def create(self, validated_data):
    return User.objects.create_user(
      username=validated_data['email'],
      email=validated_data['email'],
      first_name=validated_data['first_name'],
      last_name=validated_data['last_name'],
      phone_number=validated_data['phone_number'],
      institution_name=validated_data['institution_name'],
      address=validated_data['address'],
      is_private=True,
      # is_active=False,
    )
    # return user