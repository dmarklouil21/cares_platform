from django.db import models
from apps.user.models import User

class Notification(models.Model):
  user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
  title = models.CharField(max_length=255)
  message = models.TextField(blank=True)
  is_read = models.BooleanField(default=False)
  created_at = models.DateTimeField(auto_now_add=True)

  class Meta:
    ordering = ['-created_at']

  def __str__(self):
    return f"{self.title} ({'read' if self.is_read else 'unread'})"

