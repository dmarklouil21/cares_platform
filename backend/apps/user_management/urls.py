from django.urls import path
from .views import UserListView, UserDetailView, EmailCheckAPIView

urlpatterns = [
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('email-check/', EmailCheckAPIView.as_view(), name='user-email-check'),
]