from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView

from apps.user.serializers import LoginSerializer

# Create your views here.

class LoginApiView(TokenObtainPairView):
	permission_classes = [AllowAny]
	serializer_class = LoginSerializer
