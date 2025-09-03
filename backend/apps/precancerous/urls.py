from django.urls import path
from . import views

urlpatterns = [
  path('precancerous/admin/list/', views.AdminPreCancerousMedsListView.as_view(), name='admin_precancerous_meds_list'),
  path('precancerous/admin/detail/<int:id>/', views.AdminPreCancerousMedsDetailView.as_view(), name='admin_precancerous_meds_detail'),
  path('precancerous/admin/set-release-date/<int:id>/', views.AdminPreCancerousMedsSetReleaseDateView.as_view(), name='admin_precancerous_meds_set_release_date'),
  path('precancerous/admin/verify/<int:id>/', views.AdminPreCancerousMedsVerifyView.as_view(), name='admin_precancerous_meds_verify'),
  path('precancerous/admin/reject/<int:id>/', views.AdminPreCancerousMedsRejectView.as_view(), name='admin_precancerous_meds_reject'),
  path('precancerous/admin/done/<int:id>/', views.AdminPreCancerousMedsDoneView.as_view(), name='admin_precancerous_meds_done'),
]
