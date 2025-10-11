from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.core.exceptions import PermissionDenied
from rest_framework.parsers import MultiPartParser, FormParser

from .models import RHU
from .serializers import RHUProfileSerializer


class RHUProfileAPIView(APIView):
  permission_classes = [IsAuthenticated]
  parser_classes = [MultiPartParser, FormParser]

  def _get_rhu(self, user):
    try:
      return RHU.objects.get(user=user)
    except RHU.DoesNotExist:
      raise PermissionDenied("Your account has no RHU profile, please contact admin")

  def get(self, request):
    rhu = self._get_rhu(request.user)
    serializer = RHUProfileSerializer(rhu)
    return Response(serializer.data, status=status.HTTP_200_OK)

  def put(self, request):
    rhu = self._get_rhu(request.user)
    serializer = RHUProfileSerializer(rhu, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    # Sync RHU avatar to User avatar so it's available globally
    try:
      if rhu.avatar and getattr(request.user, 'avatar', None) != rhu.avatar:
        request.user.avatar = rhu.avatar
        request.user.save(update_fields=['avatar'])
    except Exception:
      # Non-fatal: proceed even if sync fails
      pass
    return Response(serializer.data, status=status.HTTP_200_OK)

  def patch(self, request):
    return self.put(request)
