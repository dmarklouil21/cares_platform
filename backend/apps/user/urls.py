from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from apps.user.views import LoginApiView

urlpatterns = [
    path('login/', LoginApiView.as_view(), name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
