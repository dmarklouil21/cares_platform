from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from .serializers import RegistrationSerializer, RHURegistrationSerializer, PrivateRegistrationSerializer
import random
import string
from rest_framework.permissions import AllowAny
from django.db import IntegrityError

import threading

# from twilio.base.exceptions import TwilioRestException
from rest_framework_simplejwt.tokens import RefreshToken

from backend.utils.email import send_registration_email

from apps.rhu.models import RHU, Rhuv2, Representative
from apps.partners.models import Private, PrivateRepresentative

import logging

logger = logging.getLogger(__name__) # <--- Setup logger

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
    
    # Define a small helper function to run in the background
    def send_email_in_background(user_obj, pwd):
        try:
            send_registration_email(user_obj, pwd)
        except Exception as e:
            logger.error(f"CRITICAL EMAIL ERROR: {str(e)}")
            print(f"Background email failed: {e}")
    
    # Start the thread. The request proceeds immediately without waiting.
    email_thread = threading.Thread(target=send_email_in_background, args=(user, password))
    email_thread.start()

    # email_status = send_registration_email(user, password)
    # if email_status is not True:
    #   return Response(
    #     {"message": f"Failed to send email: {email_status}"},
    #     status=status.HTTP_400_BAD_REQUEST
    #   )
    
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
      getattr(user, 'patient', None),
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
        'date_of_birth': user.date_of_birth,
        'address': user.address,
        'phone_number': user.phone_number,
        'is_first_login': user.is_first_login,
        'is_rhu': getattr(user, 'is_rhu', False),
        'is_private': getattr(user, 'is_private', False),
        'is_superuser': user.is_superuser,
        'is_active': user.is_active,
        'created_at': user.created_at,
      },
      'message': 'Login successful.' if user.is_active else 'Account is not yet active. Please wait for admin approval.'
    }

    return Response(response_data, status=status.HTTP_200_OK)

class RHURegistrationAPIView(APIView):
  permission_classes = [AllowAny]

  def post(self, request):
    serializer = RHURegistrationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    password = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
    
    try:
      user = serializer.save()
      # user.username = user.email
      user.set_password(password)
      user.save()

      # Create RHU profile with aligned fields
      rhu, created = Rhuv2.objects.get_or_create(
        lgu=serializer.validated_data['lgu'], 
        defaults={'address': serializer.validated_data['address'],}
      )
      representative = Representative.objects.create(
        rhu=rhu, 
        user=user, 
        first_name=serializer.validated_data['first_name'],
        last_name=serializer.validated_data['last_name'],
        email=serializer.validated_data['email'],
        phone_number=serializer.validated_data['phone_number'],
        official_representative_name=serializer.validated_data['official_representative_name'],
      )
      # RHU.objects.create(
      #   user=user,
      #   lgu=serializer.validated_data['lgu'],
      #   address=serializer.validated_data['address'],
      #   phone_number=serializer.validated_data['phone_number'],
      #   email=serializer.validated_data['email'],
      #   representative_first_name=serializer.validated_data['representative_first_name'],
      #   representative_last_name=serializer.validated_data['representative_last_name'],
      #   official_representative_name=serializer.validated_data['official_representative_name'],
      # )
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
      {"message": "RHU registered successfully. Please check your email."},
      status=status.HTTP_201_CREATED
    )

class PrivateRegistrationAPIView(APIView):
  permission_classes = [AllowAny]

  def post(self, request):
    serializer = PrivateRegistrationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    password = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
    
    try:
      user = serializer.save()
      # user.username = user.email
      user.set_password(password)
      user.save()

      # Create RHU profile with aligned fields
      private, created = Private.objects.get_or_create(
        institution_name=serializer.validated_data['institution_name'], 
        defaults={'address': serializer.validated_data['address'],}
      )
      private_representative = PrivateRepresentative.objects.create(
        private=private, 
        user=user, 
        first_name=serializer.validated_data['first_name'],
        last_name=serializer.validated_data['last_name'],
        email=serializer.validated_data['email'],
        phone_number=serializer.validated_data['phone_number'],
        address=serializer.validated_data['address']
      )

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
      {"message": "RHU registered successfully. Please check your email."},
      status=status.HTTP_201_CREATED
    )

# Test 
from django.core.mail import send_mail
from django.conf import settings
import os

class TestEmailAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # 1. Debug Environment Variables (Don't show full password, just check if it exists)
        user_set = "SET" if os.environ.get('EMAIL_HOST_USER') else "MISSING"
        pass_set = "SET" if os.environ.get('EMAIL_HOST_PASSWORD') else "MISSING"
        
        debug_info = {
            "EMAIL_HOST_USER_STATUS": user_set,
            "EMAIL_HOST_PASSWORD_STATUS": pass_set,
            "EMAIL_PORT": settings.EMAIL_PORT,
            "EMAIL_USE_TLS": settings.EMAIL_USE_TLS,
        }

        # 2. Try to send a raw email
        try:
            send_mail(
                subject='Render Diagnostic Test',
                message='If you see this, the email system is working.',
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=['caresplatform@gmail.com'], # Sending to yourself to test
                fail_silently=False,
            )
            return Response({
                "status": "SUCCESS", 
                "message": "Email sent!", 
                "debug_info": debug_info
            }, status=200)
            
        except Exception as e:
            # Return the EXACT error to the browser
            return Response({
                "status": "FAILED", 
                "error": str(e),
                "error_type": type(e).__name__,
                "debug_info": debug_info
            }, status=500)