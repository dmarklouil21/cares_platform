from django.db import models
from apps.user.models import User

# Create your models here.
class CancerAwarenessActivity(models.Model):
  uploader = models.ForeignKey(User, on_delete=models.CASCADE, related_name="cancer_awareness_activities")
  title = models.CharField(max_length=255)
  description = models.TextField()
  date = models.DateTimeField()
  photo = models.ImageField(upload_to='cancer_awareness_activity/photos/', blank=True, null=True)
  attachment = models.FileField(upload_to='attachments/cancer_awareness_activity/', blank=True, null=True)
  created_at = models.DateTimeField(auto_now_add=True)

  class Meta:
    verbose_name = 'CancerAwarenessActivity'
    verbose_name_plural = 'CancerAwarenessActivities'

  def __str__(self):
    return f"{self.title} ({self.date.date()})"

