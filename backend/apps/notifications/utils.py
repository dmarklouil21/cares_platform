# utils.py
from .models import Notification

def create_notification(user, title, message=""):
    """
    Utility function to create notifications
    """
    notification = Notification.objects.create(
        user=user,
        title=title,
        message=message
    )
    return notification

# Usage example:
# create_notification(request.user, "New Order", "You have received a new order #12345")