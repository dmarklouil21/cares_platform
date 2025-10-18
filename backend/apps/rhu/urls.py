from django.urls import path
from . import views 

urlpatterns = [
  path('profile/', views.RHUProfileAPIView.as_view(), name='rhu-profile'),
  path('admin/list/', views.AdminRHUListAPIView.as_view(), name='rhu-admin-list'),
  
  path('list/', views.RhuListView.as_view(), name='rhu_list'),
  path('rhus/create/', views.RhuCreateView.as_view(), name='rhu_create'),
  path('rhus/<int:pk>/', views.RhuDetailView.as_view(), name='rhu_detail'),

  path('representatives/', views.RepresentativeListView.as_view(), name='representative_list'),
  path('representatives/create/', views.RepresentativeCreateView.as_view(), name='representative_create'),
  path('representatives/<int:pk>/', views.RepresentativeDetailView.as_view(), name='representative_detail'),

  # Pre cancerous views
  path('pre-cancerous/list/', views.PreCancerousMedsListView.as_view(), name='pre_cancerous_list'),
  path('pre-cancerous/view/<int:id>/', views.PreCancerousMedsDetailView.as_view(), name='pre_cancerous_details'),
  path('pre-cancerous/update/<int:id>/', views.PreCancerousMedsUpdateView.as_view(), name='pre_cancerous_update'),
]
