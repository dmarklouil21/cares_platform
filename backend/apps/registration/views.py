from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from .serializers import RegistrationSerializer, RHURegistrationSerializer
import random
import string
from rest_framework.permissions import AllowAny
from django.db import IntegrityError

# from twilio.base.exceptions import TwilioRestException
from rest_framework_simplejwt.tokens import RefreshToken

from backend.utils.email import send_registration_email
from apps.user.models import User
from apps.rhu.models import RHU

class RegistrationAPIView(APIView):
  permission_classes = [AllowAny]

  def post(self, request):
    serializer = RegistrationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    password = ''.join(random.choices(string.ascii_letters + string.digits, k=8))

    try:
      user = serializer.save()
      user.set_password(password)
      user.save()
    except IntegrityError:
      return Response(
        {"message": "A user with this email or phone number already exists."},
        status=status.HTTP_400_BAD_REQUEST
      )
    
    email_status = send_registration_email(user, password)
    if email_status is not True:
      return Response(
        {"message": f"Failed to send email: {email_status}"},
        status=status.HTTP_400_BAD_REQUEST
      )
    
    return Response(
      {"message": "User registered successfully. Please check your email."},
      status=status.HTTP_201_CREATED
    )

class RegistrationLoginAPIView(APIView):
  permission_classes = [AllowAny]

  def post(self, request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
      return Response({'message': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = authenticate(request, username=email, password=password)
    if not user:
      return Response({'message': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)
    
    refresh = RefreshToken.for_user(user)
      
    patient_id = getattr(
      getattr(getattr(user, 'beneficiary', None), 'patient', None),
      'patient_id',
      None
    )

    response_data = {
      'refresh': str(refresh),
      'access': str(refresh.access_token),
      'user': {
        'user_id': user.user_id,
        'patient_id': patient_id,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_first_login': user.is_first_login,
        'is_rhu': getattr(user, 'is_rhu', False),
        'is_private': getattr(user, 'is_private', False),
        'is_superuser': user.is_superuser,
        'is_active': user.is_active,
      },
      'message': 'Login successful.' if user.is_active else 'Account is not yet active. Please wait for admin approval.'
    }

    return Response(response_data, status=status.HTTP_200_OK)

# class RHURegistrationAPIView(APIView):
#   permission_classes = [AllowAny]

#   def post(self, request):
#     serializer = RHURegistrationSerializer(data=request.data)
#     if serializer.is_valid():
#       password = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
#       try:
#         # Create inactive RHU user
#         user = serializer.save()
#         user.username = user.email
#         user.set_password(password)
#         user.save()

#         # Create RHU profile with aligned fields
#         RHU.objects.create(
#           user=user,
#           lgu=serializer.validated_data['lgu'],
#           address=serializer.validated_data['address'],
#           phone_number=serializer.validated_data['phone_number'],
#           email=serializer.validated_data['email'],
#           representative_first_name=serializer.validated_data['representative_first_name'],
#           representative_last_name=serializer.validated_data['representative_last_name'],
#           official_representative_name=serializer.validated_data['official_representative_name'],
#         )
#       except IntegrityError:
#         return Response(
#           {"message": "A user with this email or phone number already exists."},
#           status=status.HTTP_400_BAD_REQUEST
#         )

#       email_status = send_registration_email(user, password)
#       if email_status is not True:
#         return Response(
#           {"message": f"Failed to send email: {email_status}"},
#           status=status.HTTP_400_BAD_REQUEST
#         )

#       return Response(
#         {"message": "RHU registered successfully. Please check your email."},
#         status=status.HTTP_201_CREATED
#       )

#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
