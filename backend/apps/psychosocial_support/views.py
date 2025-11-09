from rest_framework import generics, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser

from .models import Activity
from .serializers import ActivityCreateSerializer, ActivitySerializer, AttendanceSerializer, AttendanceCreateSerializer

import logging

logger = logging.getLogger(__name__)

# New views for the new ui
class PyschosocialActivityCreateView(generics.CreateAPIView):
  queryset = Activity.objects.all()
  serializer_class = ActivitySerializer
  parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated]

  def perform_create(self, serializer):
    try:
      serializer.save()
    except Exception:
      logger.exception("Error creating cancer awareness activity")
      raise

class ActivityAttendeesView(APIView):
    def get(self, request, id):
        try:
            activity = Activity.objects.get(id=id)
            attendances = activity.attendances.all()
            serializer = AttendanceSerializer(attendances, many=True)
            return Response(serializer.data)
        except Activity.DoesNotExist:
            return Response(
                {"error": "Activity not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    def post(self, request, id):
        try:
            print(f"Received request for activity {id}")
            print(f"Request data: {request.data}")
            activity = Activity.objects.get(id=id)
            
            # Pass the activity object directly instead of just the ID
            serializer = AttendanceCreateSerializer(
                data=request.data, 
                context={'activity': activity}  # Pass the object, not just ID
            )
            
            print('Serializer: ', serializer)
            
            if serializer.is_valid():
                serializer.save()
                attendances = activity.attendances.all()
                response_serializer = AttendanceSerializer(attendances, many=True)
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Activity.DoesNotExist:
            return Response(
                {"error": "Activity not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
  
class PyschosocialActivityDetailView(generics.RetrieveAPIView):
  queryset = Activity.objects.all()
  serializer_class = ActivitySerializer
  permission_classes = [IsAuthenticated]
  lookup_field = 'id'

class PyschosocialActivityListView(generics.ListAPIView):
  queryset = Activity.objects.all()
  serializer_class = ActivitySerializer
  permission_classes = [IsAuthenticated]

class PyschosocialActivityUpdateView(generics.UpdateAPIView):
  queryset = Activity.objects.all()
  serializer_class = ActivitySerializer
  lookup_field = 'id'
  parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated]
  
# Old views from the previous ui
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
