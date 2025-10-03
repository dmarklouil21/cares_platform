from django.urls import path
from . import views

urlpatterns = [
  path('home-visit/list/', views.PatientHomeVisitListView.as_view(), name='home_visit_list'),
  path("home-visit/create/", views.PatientHomeVisitCreateView.as_view(), name="home_visit-create"),
  path('home-visit/view/<int:id>/', views.PatientHomeVisitDetailView.as_view(), name='home_visit_view'),
  path('home-visit/update/<int:id>/', views.PatientHomeVisitUpdateView.as_view(), name='home_visit_update'),
]