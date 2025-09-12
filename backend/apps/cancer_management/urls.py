from django.urls import path
from . import views

urlpatterns = [
  # path('individual-screening-request/', views.PreScreeningCreateView.as_view(), name='individual_screening_create'),
  path('well-being-questions/', views.WellBeingQuestionListView.as_view(), name='well_being_questions'),
  path('list/', views.CancerManagementListView.as_view(), name='cancer_management_list'),
]