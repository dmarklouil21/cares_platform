from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model, authenticate
from .serializers import RegistrationSerializer
import random
import string
from django.conf import settings
from rest_framework.permissions import AllowAny
from django.db import IntegrityError
from django.core.mail import send_mail

# from twilio.base.exceptions import TwilioRestException
from rest_framework_simplejwt.tokens import RefreshToken

from backend.utils.email import send_registration_email
from apps.user.models import User

User = get_user_model()

class RegistrationAPIView(APIView):
  permission_classes = [AllowAny]
  def post(self, request):
    serializer = RegistrationSerializer(data=request.data)
    if serializer.is_valid():
      password = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
      try:
        user = serializer.save(is_active=False)  # User inactive by default
        user.username = user.email  
        user.set_password(password)  #  Django auth
        user.plain_password = password 
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
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RegistrationLoginAPIView(APIView):
  permission_classes = [AllowAny]

  def post(self, request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
      return Response({'message': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = authenticate(request, email=email, password=password)

    if user:
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
      
    return Response({'message': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

