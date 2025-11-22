from django.utils import timezone
from django.db import models
from apps.user.models import User
from cloudinary.models import CloudinaryField

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
PATIENT_STATUS_CHOICES = [
  ('validated', 'Validated'),
  ('pending', 'Pending'),
  ('active', 'Active'),
  ('rejected', 'Rejected'),
  ('archived', 'Archived'),
]
REGISTERED_BY = [
  ('rafi', 'Rafi'),
  ('rhu', 'Rhu'),
  ('private', 'Private'),
  ('self', 'Self'),
]

class Patient(models.Model):
  user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, related_name='patient')
  patient_id = models.CharField(max_length=20, unique=True)

  first_name = models.CharField(max_length=100)
  middle_name = models.CharField(max_length=100, blank=True, null=True)
  last_name = models.CharField(max_length=100)
  suffix = models.CharField(max_length=10, blank=True, null=True)
  date_of_birth = models.DateField()
  sex = models.CharField(max_length=10, choices=SEX_CHOICES)
  civil_status = models.CharField(max_length=20, choices=CIVIL_STATUS_CHOICES)
  number_of_children = models.PositiveIntegerField(default=0)
  status = models.CharField(max_length=20, choices=PATIENT_STATUS_CHOICES, default='pending')

  # Contact and Address Information
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
  
  photo_url = CloudinaryField('image', folder='images', null=True, blank=True)
  registered_by = models.CharField(max_length=20, default='Self')
  created_at = models.DateTimeField(auto_now_add=True)

  class Meta:
    verbose_name = 'Patient'
    verbose_name_plural = 'Patients'
    ordering = ['last_name', 'first_name']

  @property
  def age(self):
    today = timezone.now().date()
    return today.year - self.date_of_birth.year - (
      (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
    )
  
  @property
  def full_name(self):
    return f'{self.first_name} {self.last_name}'.strip()

  def __str__(self):
    return f"Patient: {self.first_name} {self.last_name} (ID: {self.patient_id})"

class EmergencyContact(models.Model):
  patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='emergency_contacts')
  name = models.CharField(max_length=100, blank=True, null=True)
  address = models.CharField(max_length=255, blank=True, null=True)
  relationship_to_patient = models.CharField(max_length=50, blank=True, null=True)
  email = models.EmailField(blank=True, null=True)
  landline_number = models.CharField(max_length=15, blank=True, null=True)
  mobile_number = models.CharField(max_length=15, blank=True, null=True)

  created_at = models.DateTimeField(auto_now_add=True)

  class Meta:
    verbose_name = 'Emergency Contact'
    verbose_name_plural = 'Emergency Contacts'
    ordering = ['created_at']

  def __str__(self):
    return f"{self.name} ({self.relationship_to_patient})"

class CancerDiagnosis(models.Model):
  patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='diagnosis')
  diagnosis = models.CharField(max_length=255, blank=True, null=True)
  date_diagnosed = models.DateField(blank=True, null=True)
  cancer_site = models.CharField(max_length=100, blank=True, null=True)
  cancer_stage = models.CharField(max_length=50, blank=True, null=True)

  class Meta:
    verbose_name = 'CancerDiagnosis'
    verbose_name_plural = 'CancerDiagnosis'

  def __str__(self):
    return f"Diagnosis for {self.patient.full_name}: {self.cancer_site or 'N/A'} - Stage {self.cancer_stage or 'N/A'}"
  
class ServiceReceived(models.Model):
  patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='service_received')
  service_type = models.CharField(max_length=100)
  date_completed = models.DateField(blank=True, null=True)

  class Meta:
    verbose_name = 'ServiceReceived'
    verbose_name_plural = 'ServicesReceived'

  def __str__(self):
    return f"Service received by {self.patient.full_name}"

class HistoricalUpdate(models.Model):
  patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='historical_updates')
  date = models.DateField(blank=True, null=True)
  note = models.CharField(max_length=255, blank=True, null=True)

  class Meta:
    verbose_name = 'HistoricalUpdate'
    verbose_name_plural = 'HistoricalUpdates'

  def __str__(self):
    return f"Update for {self.patient.full_name} on {self.date}: {self.note or 'No note'}"

class DiagnosisBasis(models.Model):
  name = models.CharField(max_length=100)

  def __str__(self):
    return self.name

class PrimarySite(models.Model):
  name = models.CharField(max_length=100)

  def __str__(self):
    return self.name

class DistantMetastasisSite(models.Model):
  name = models.CharField(max_length=100)

  def __str__(self):
    return self.name

class TreatmentOption(models.Model):
  name = models.CharField(max_length=100)

  def __str__(self):
    return self.name 

class PreScreeningForm(models.Model):
  patient = models.OneToOneField(Patient, on_delete=models.CASCADE, related_name='pre_screening_form', null=True)
  referred_from = models.CharField(max_length=255, blank=True)
  referring_doctor_or_facility = models.CharField(max_length=255, blank=True)
  reason_for_referral = models.TextField(blank=True)
  chief_complaint = models.TextField(blank=True)
  date_of_consultation = models.DateField(null=True, blank=True)
  date_of_diagnosis = models.DateField(null=True, blank=True)

  # Diagnosis
  diagnosis_basis = models.ManyToManyField(DiagnosisBasis, blank=True)
  multiple_primaries = models.PositiveSmallIntegerField(null=True, blank=True)
  primary_sites = models.ManyToManyField(PrimarySite, blank=True)
  primary_sites_other = models.CharField(max_length=255, blank=True)

  laterality = models.CharField(
    max_length=50,
    choices=[
      ('Left', 'Left'), ('Right', 'Right'), ('Not Stated', 'Not Stated'),
      ('Bilateral', 'Bilateral'), ('Mild', 'Mild')
    ],
    blank=True
  )

  histology = models.CharField(max_length=255, blank=True)

  # Staging
  staging = models.CharField(
    max_length=50,
    choices=[
      ('In-Situ', 'In-Situ'), ('Localized', 'Localized'), ('Direct Extension', 'Direct Extension'),
      ('Regional Lymph Node', 'Regional Lymph Node'), ('3+4', '3+4'), ('Distant Metastasis', 'Distant Metastasis'),
      ('Unknown', 'Unknown')
    ],
    blank=True
  )

  # TNM System
  t_system = models.CharField(max_length=2, blank=True)
  n_system = models.CharField(max_length=2, blank=True)
  m_system = models.CharField(max_length=2, blank=True)

  distant_metastasis_sites = models.ManyToManyField(DistantMetastasisSite, blank=True)
  distant_metastasis_sites_other = models.CharField(max_length=255, blank=True)

  final_diagnosis = models.TextField(blank=True)
  final_diagnosis_icd10 = models.CharField(max_length=50, blank=True)

  # Treatment
  treatment_purpose = models.CharField(
    max_length=50,
    choices=[
      ('Curative-Complete', 'Curative-Complete'),
      ('Curative-Incomplete', 'Curative-Incomplete'),
      ('Palliative Only', 'Palliative Only')
    ],
    blank=True
  )
  treatment_purpose_other = models.CharField(max_length=255, blank=True)

  primary_assistance_by_ejacc = models.CharField(max_length=255, blank=True)
  date_of_assistance = models.DateField(null=True, blank=True)

  adjuvant_treatments_received = models.ManyToManyField(
    TreatmentOption,
    related_name='adjuvant_treatments',
    blank=True
  )
  adjuvant_treatments_other = models.CharField(max_length=255, blank=True)

  other_source_treatments = models.ManyToManyField(
    TreatmentOption,
    related_name='other_source_treatments',
    blank=True
  )
  other_source_treatments_other = models.CharField(max_length=255, blank=True)

  created_at = models.DateTimeField(auto_now_add=True)

  def __str__(self):
    return f"Cancer Screening - {self.referred_from or 'Unknown'}"