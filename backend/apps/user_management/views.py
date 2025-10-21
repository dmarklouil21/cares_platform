from django.shortcuts import render
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
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

class EmailCheckAPIView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        email = (request.query_params.get('email') or '').strip()
        exclude_id = request.query_params.get('exclude_id')
        qs = User.objects.all()
        if email:
            qs = qs.filter(email__iexact=email)
        if exclude_id:
            qs = qs.exclude(pk=exclude_id)
        return Response({
            'exists': qs.exists()
        })