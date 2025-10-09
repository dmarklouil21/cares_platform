from rest_framework import generics, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Activity
from .serializers import ActivityCreateSerializer, ActivitySerializer


class AdminActivityListCreateView(generics.ListCreateAPIView):
    queryset = Activity.objects.all().order_by('-date', '-id')
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ActivityCreateSerializer
        return ActivitySerializer


class AdminActivityDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Activity.objects.all()
    lookup_field = 'id'
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        # Use create serializer for updates (handles coercion), read serializer for get
        if self.request.method in ['PUT', 'PATCH']:
            return ActivityCreateSerializer
        return ActivitySerializer


class AdminPatientSuggestions(APIView):
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get(self, request):
        q = (request.query_params.get('q') or '').strip().lower()
        # Look at the most recent activities for names
        recent = Activity.objects.order_by('-created_at')[:50]
        seen = set()
        names = []
        for act in recent:
            if not act.patients:
                continue
            # patients stored as comma-separated string
            for name in [n.strip() for n in act.patients.split(',') if n.strip()]:
                key = name.lower()
                if key in seen:
                    continue
                seen.add(key)
                names.append(name)

        if q:
            names = [n for n in names if q in n.lower()]

        return Response(names[:10])


class PublicActivityListView(generics.ListAPIView):
    queryset = Activity.objects.all().order_by('-date', '-id')
    serializer_class = ActivitySerializer
    # Allow authenticated users (RHU/beneficiary); switch to AllowAny if desired
    permission_classes = [permissions.IsAuthenticated]
