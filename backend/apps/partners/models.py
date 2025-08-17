from django.db import models
from apps.user.models import User

# Create your models here.
class CancerAwarenessActivity(models.Model):
  uploader = models.ForeignKey(User, on_delete=models.CASCADE)
  title = models.CharField(max_length=255)
  description = models.CharField(max_length=255)
  date = models.DateTimeField()
  photo = models.ImageField()
  attachment = models.FileField(upload_to='attachments/cancer_awareness_activity')