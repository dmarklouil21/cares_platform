from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from .models import Beneficiary
from .serializers import BeneficiarySerializer
from .pagination import BeneficiaryPagination

# Create your views here.

# Beneficiary

class BeneficiaryCreateView(generics.CreateAPIView):
    queryset = Beneficiary.objects.all()
    serializer_class = BeneficiarySerializer

    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        user = request.user

        # Check if the user is already a beneficiary
        if Beneficiary.objects.filter(user=user).exists():
            return Response(
                {"exists": True},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().create(request, *args, **kwargs)

class BeneficiaryDetailView(generics.RetrieveAPIView):
    serializer_class = BeneficiarySerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return Beneficiary.objects.get(user=self.request.user)

# EJACC

class BeneficiaryListView(generics.ListAPIView):
    queryset = Beneficiary.objects.all()
    serializer_class = BeneficiarySerializer
    lookup_field = 'beneficiary_id'

    permission_classes = [IsAuthenticated, IsAdminUser]
    pagination_class = BeneficiaryPagination

class BeneficiaryPreEnrollmentDetailView(generics.RetrieveAPIView):
    queryset = Beneficiary.objects.all()
    serializer_class = BeneficiarySerializer
    lookup_field = 'beneficiary_id'

    permission_classes = [IsAuthenticated, IsAdminUser]

class BeneficiaryPreEnrollmentStatusUpdateView(generics.UpdateAPIView):
    queryset = Beneficiary.objects.all()
    serializer_class = BeneficiarySerializer
    lookup_field = 'beneficiary_id'

    permission_classes = [IsAuthenticated, IsAdminUser]

class BeneficiaryPreEnrollmentDeleteView(generics.DestroyAPIView):
    queryset = Beneficiary.objects.all()
    lookup_field = 'beneficiary_id'

    permission_classes = [IsAuthenticated, IsAdminUser]
