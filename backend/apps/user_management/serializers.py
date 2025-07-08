from rest_framework import serializers
from apps.user.models import User

class UserManagementSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    role = serializers.SerializerMethodField(read_only=True)
    input_role = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'is_active', 'is_superuser',
            'date_of_birth', 'age', 'phone_number', 'is_resident_of_cebu', 'lgu', 'address',
            'password', 'role', 'input_role'
        ]

    def get_role(self, obj):
        if obj.is_superuser:
            return 'admin'
        if getattr(obj, 'is_rhu', False):
            return 'rhu'
        if getattr(obj, 'is_private', False):
            return 'private'
        return 'beneficiary'

    def create(self, validated_data):
        password = validated_data.pop('password')
        role = validated_data.pop('input_role', None)
        email = validated_data.get('email')
        user = User(**validated_data)
        user.username = email  # Set username as email
        user.set_password(password)
        user.plain_password = password  
        # Set role fields
        user.is_superuser = (role == 'admin')
        user.is_rhu = (role == 'rhu')
        user.is_private = (role == 'private')
        user.save()
        return user

    def update(self, instance, validated_data):
        # Update email and username
        email = validated_data.get('email', instance.email)
        instance.email = email
        instance.username = email 

        password = validated_data.get('password', None)
        if password:
            instance.set_password(password)
            instance.plain_password = password

        # Update other fields
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.date_of_birth = validated_data.get('date_of_birth', instance.date_of_birth)
        instance.age = validated_data.get('age', instance.age)
        instance.phone_number = validated_data.get('phone_number', instance.phone_number)
        instance.is_resident_of_cebu = validated_data.get('is_resident_of_cebu', instance.is_resident_of_cebu)
        instance.lgu = validated_data.get('lgu', instance.lgu)
        instance.address = validated_data.get('address', instance.address)

        # Handle role updates
        role = validated_data.get('input_role', None)
        if role:
            instance.is_superuser = (role == 'admin')
            instance.is_rhu = (role == 'rhu')
            instance.is_private = (role == 'private')
        instance.save()
        return instance