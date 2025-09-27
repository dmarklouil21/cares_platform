from django.urls import path
from . import views
from apps.precancerous import views as precancerous_views

urlpatterns = [
  path('list/', views.PostTreatmentListView.as_view(), name='post_treatment_list'),
  path('view/<int:id>/', views.PostTreatmentDetailedView.as_view(), name='post_treatment_view'),
]