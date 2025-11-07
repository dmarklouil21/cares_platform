# utils.py
from .models import Notification
from django.contrib.auth import get_user_model

User = get_user_model()

def create_notification(users, title, message=""):
    """
    Utility function to create notifications
    """
    if isinstance(users, User):
      users = [users]

    notifications = [
      Notification(user=user, title=title, message=message)
      for user in users
    ]

    Notification.objects.bulk_create(notifications)

    # notification = Notification.objects.create(
    #   user=user,
    #   title=title,
    #   message=message
    # )
    # return notification

# Usage example:
# create_notification(request.user, "New Order", "You have received a new order #12345")