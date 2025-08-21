from django.urls import path
from . import views

urlpatterns = [
    path('pre-enrollment/', views.PatientCreateView.as_view(), name='patient_create'),
    path('details/', views.PatientDetailView.as_view(), name='patient_detail'),
    path('list/', views.PatientListView.as_view(), name='patient_list'),
]