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
from .models import Registration
from rest_framework_simplejwt.tokens import RefreshToken
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
            try:
                send_mail(
                    subject="Your Registration Password",
                    message=f"Account Registration is Successful. \nYour Password is: {password}\n\nYour Account will be Activated after Admin Approval.",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=False,
                )
            except Exception as e:
                return Response(
                    {"message": f"Failed to send email: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response({'message': 'Registration successful. Please check your email for your password. Your account will be activated after admin approval.'}, status=status.HTTP_201_CREATED)
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
            if user.is_active:
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'is_superuser': user.is_superuser,
                    'first_name': user.first_name,
                    'is_active': user.is_active,
                    'message': 'Login successful.'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'is_superuser': user.is_superuser,
                    'first_name': user.first_name,
                    'is_active': user.is_active,
                    'message': 'Account is not yet active. Please wait for admin approval.'
                }, status=status.HTTP_200_OK)
        return Response({'message': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)
