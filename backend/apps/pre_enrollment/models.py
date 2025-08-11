from django.db import models
from apps.user.models import User

# Create your models here.

SEX_CHOICES = [
  ('male', 'Male'),
  ('female', 'Female')
]
CIVIL_STATUS_CHOICES = [
  ('single', 'Single'),
  ('co-habitation', 'Co-Habitation'),
  ('separated', 'Separated'),
  ('widower', 'Widower'),
  ('married', 'Married'),
  ('annulled', 'Annulled'),
]
BENEFICIARY_STATUS_CHOICES = [
  ('validated', 'Validated'),
  ('pending', 'Pending'),
  ('rejected', 'Rejected'),
  ('archived', 'Archived'),
]

class Beneficiary(models.Model):
  user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, related_name='beneficiary')
  beneficiary_id = models.CharField(max_length=20, unique=True)
  first_name = models.CharField(max_length=100)
  middle_name = models.CharField(max_length=100, blank=True, null=True)
  last_name = models.CharField(max_length=100)
  suffix = models.CharField(max_length=10, blank=True, null=True)
  date_of_birth = models.DateField()
  age = models.PositiveIntegerField()
  sex = models.CharField(max_length=10, choices=SEX_CHOICES)
  civil_status = models.CharField(max_length=20, choices=CIVIL_STATUS_CHOICES)
  number_of_children = models.PositiveIntegerField(default=0)
  date_created = models.DateField(auto_now_add=True)
  status = models.CharField(max_length=20, choices=BENEFICIARY_STATUS_CHOICES, default='pending')

  # Contact Information
  address = models.CharField(max_length=255)
  city = models.CharField(max_length=100)
  barangay = models.CharField(max_length=100)
  mobile_number = models.CharField(max_length=15)
  email = models.EmailField()

  # Additional Information
  source_of_information = models.TextField(blank=True, null=True)
  other_rafi_programs_availed = models.TextField(blank=True, null=True)

  # Social Economic Information
  highest_educational_attainment = models.CharField(max_length=100, blank=True, null=True)
  occupation = models.CharField(max_length=100, blank=True, null=True)
  source_of_income = models.CharField(max_length=100, blank=True, null=True)
  monthly_income = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

  class Meta:
    verbose_name = 'Beneficiary'
    verbose_name_plural = 'Beneficiaries'
    ordering = ['last_name', 'first_name']
    
  @property
  def full_name(self):
    return f'{self.first_name} {self.last_name}'.strip()

  def __str__(self):
    return f"{self.first_name} {self.last_name}"
    
class EmergencyContact(models.Model):
  beneficiary = models.ForeignKey(Beneficiary, on_delete=models.CASCADE, related_name='emergency_contacts')
  name = models.CharField(max_length=100, blank=True, null=True)
  address = models.CharField(max_length=255, blank=True, null=True)
  relationship_to_patient = models.CharField(max_length=50, blank=True, null=True)
  email = models.EmailField(blank=True, null=True)
  landline_number = models.CharField(max_length=15, blank=True, null=True)
  mobile_number = models.CharField(max_length=15, blank=True, null=True)

  class Meta:
    verbose_name = 'Emergency Contact'
    verbose_name_plural = 'Emergency Contacts'
    ordering = ['name']

  def __str__(self):
    return f"{self.name} ({self.relationship_to_patient})"

