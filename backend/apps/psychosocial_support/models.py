from django.db import models

from apps.patient.models import Patient

class Activity(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    date = models.DateField()

    photo = models.ImageField(upload_to='psychosocial_support/photos/', null=True, blank=True)
    attachment = models.FileField(upload_to='psychosocial_support/attachments/', null=True, blank=True)

    # Store attendee names as a simple comma-separated string for simplicity.
    patients = models.TextField(blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-id']

    def __str__(self):
        return f"{self.title} ({self.date})"

class PsychosocialAttendance(models.Model):
  activity = models.ForeignKey(
      Activity, 
      on_delete=models.CASCADE, 
      related_name="attendances"
  )
  patient = models.ForeignKey(
      Patient, 
      on_delete=models.CASCADE,
      related_name="pyschosocial_attendances"
  )
  attended_at = models.DateTimeField(auto_now_add=True)
  
  class Meta:
      verbose_name = 'Psychosocial Activity Attendance'
      verbose_name_plural = 'Psychosocial Activity Attendances'
      unique_together = ['activity', 'patient']  # Prevent duplicate entries
  
  def __str__(self):
      return f"{self.patient.full_name} - {self.activity.title}"