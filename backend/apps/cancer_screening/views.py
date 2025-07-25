from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.exceptions import NotFound

from apps.pre_enrollment.models import Beneficiary
from apps.cancer_screening.models import ScreeningProcedure, ScreeningAttachment

from .models import IndividualScreening
from .serializers import IndividualScreeningSerializer

class IndividualScreeningCreateView(generics.CreateAPIView):
  queryset = IndividualScreening.objects.all()
  serializer_class = IndividualScreeningSerializer
  parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated]

  def create(self, request, *args, **kwargs):
    beneficiary_id = request.data.get('beneficiary_id')
    beneficiary = Beneficiary.objects.get(beneficiary_id=beneficiary_id)
    attachments = request.FILES.getlist('attachments')

    response = super().create(request, *args, **kwargs)

    screening_procedure = ScreeningProcedure.objects.get(beneficiary=beneficiary)

    for file in attachments:
      ScreeningAttachment.objects.create(screening_procedure=screening_procedure, file=file)

    return response
