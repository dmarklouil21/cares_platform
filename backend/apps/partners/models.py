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

class Private (models.Model):
  institution_name = models.CharField(max_length=100, unique=True)
  address = models.CharField(max_length=255)
  created_at = models.DateField(auto_now_add=True)

  def __str__(self):
    return self.institution_name

class PrivateRepresentative (models.Model):
  private = models.ForeignKey(Private, on_delete=models.CASCADE, related_name='private_representatives')
  user = models.OneToOneField(User, on_delete=models.CASCADE)
  first_name = models.CharField(max_length=255)
  last_name = models.CharField(max_length=255)
  email = models.EmailField()
  address = models.CharField(max_length=255)
  phone_number = models.CharField(max_length=15)
  avatar = models.ImageField(upload_to='rhu/avatar/', null=True, blank=True)

  created_at = models.DateField(auto_now_add=True)

  def __str__(self):
    return f'{self.first_name} {self.last_name}'