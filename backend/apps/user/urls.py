from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from apps.user.views import LoginApiView
from apps.user.views import ResetPasswordApiView
from apps.user.views import UserProfileAPIView

urlpatterns = [
    path('login/', LoginApiView.as_view(), name='login'),
    path('reset-password/', ResetPasswordApiView.as_view(), name='reset-password'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileAPIView.as_view(), name='user-profile'),
]
