# from django.urls import path
# from . import views

# urlpatterns = [
#   path('list/', views.NotificationView.as_view(), name='list_notificaionts'),
# ]
# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('list/', views.notification_list, name='notification-list'),
    path('<int:notification_id>/mark-read/', views.mark_notification_read, name='mark-notification-read'),
    path('mark-all-read/', views.mark_all_notifications_read, name='mark-all-notifications-read'),
    path('mark-multiple-read/', views.mark_multiple_notifications_read, name='mark-multiple-notifications-read'),
    path('<int:notification_id>/', views.delete_notification, name='delete-notification'),
]