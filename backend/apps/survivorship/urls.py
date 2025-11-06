from django.urls import path
from . import views

urlpatterns = [
  path('home-visit/list/', views.PatientHomeVisitListView.as_view(), name='home_visit_list'),
  path("home-visit/create/", views.PatientHomeVisitCreateView.as_view(), name="home_visit-create"),
  path('home-visit/view/<int:id>/', views.PatientHomeVisitDetailView.as_view(), name='home_visit_view'),
  path('home-visit/update/<int:id>/', views.PatientHomeVisitUpdateView.as_view(), name='home_visit_update'),
  path('home-visit/delete/<int:id>/', views.PatientHomeVisitDeleteView.as_view(), name='home_visit_delete'),
  path('home-visit/send-report/', views.SendReportView.as_view(), name='home_visit_send_report'),

  # Hormonal Replacement
  path('hormonal-replacement/create/', views.HormonalReplacementCreateView.as_view(), name='hormonal_replacement_create'),
  path('hormonal-replacement/list/', views.HormonalReplacementListView.as_view(), name='hormonal_replacement_list'),
  path('hormonal-replacement/view/<int:id>/', views.HormonalReplacementDetailView.as_view(), name='hormonal_replacement_view'),
  path('hormonal-replacement/update/<int:id>/', views.HormonalReplacementUpdateView.as_view(), name='hormonal_replacement_update'),
  path('hormonal-replacement/delete/<int:id>/', views.HormonalReplacementDeleteView.as_view(), name='hormonal_replacement_delete'),
  path('hormonal-replacement/attachments-delete/<int:id>/', views.AttachmentDeleteView.as_view(), name='hormonal_replacement_attachment_delete'),
  path('hormonal-replacement/attachments-update/<int:id>/', views.RequiredAttachmentUpdateView.as_view(), name='hormonal_replacement_attachment_delete'),
]