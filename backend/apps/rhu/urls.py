from django.urls import path
from .views import RHUProfileAPIView, AdminRHUListAPIView

urlpatterns = [
  path('profile/', RHUProfileAPIView.as_view(), name='rhu-profile'),
  path('admin/list/', AdminRHUListAPIView.as_view(), name='rhu-admin-list'),
]
