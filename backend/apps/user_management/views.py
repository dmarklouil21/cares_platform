from django.shortcuts import render
from rest_framework import generics, permissions
from apps.user.models import User
from .serializers import UserManagementSerializer

class UserListView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserManagementSerializer
    permission_classes = [permissions.IsAdminUser]

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserManagementSerializer
    permission_classes = [permissions.IsAdminUser]

    
    