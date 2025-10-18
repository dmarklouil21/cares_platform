from django.db import models
from apps.user.models import User


class RHU(models.Model):
  user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='rhu')
  # Duplicate registration details (excluding password) for reporting/auditing
  lgu = models.CharField(max_length=100)
  address = models.CharField(max_length=255)
  phone_number = models.CharField(max_length=15)
  email = models.EmailField()
  representative_first_name = models.CharField(max_length=150)
  representative_last_name = models.CharField(max_length=150)
  official_representative_name = models.CharField(max_length=255)
  avatar = models.ImageField(upload_to='rhu/avatar/', null=True, blank=True)

  created_at = models.DateTimeField(auto_now_add=True)

  class Meta:
    verbose_name = 'RHU Profile'
    verbose_name_plural = 'RHU Profiles'
    ordering = ['lgu', 'official_representative_name']

  def __str__(self):
    return f"{self.lgu} - {self.official_representative_name}".strip()

class Rhuv2 (models.Model):
  lgu = models.CharField(max_length=100, unique=True)
  address = models.CharField(max_length=255)
  created_at = models.DateField(auto_now_add=True)

  def __str__(self):
    return self.lgu

class Representative (models.Model):
  rhu = models.ForeignKey(Rhuv2, on_delete=models.CASCADE, related_name='representatives')
  user = models.OneToOneField(User, on_delete=models.CASCADE)
  first_name = models.CharField(max_length=255)
  last_name = models.CharField(max_length=255)
  email = models.EmailField()
  phone_number = models.CharField(max_length=15)
  official_representative_name = models.CharField(max_length=255)
  avatar = models.ImageField(upload_to='rhu/avatar/', null=True, blank=True)

  created_at = models.DateField(auto_now_add=True)

  def __str__(self):
    return f'{self.first_name} {self.last_name}'