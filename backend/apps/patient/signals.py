from django.db.models.signals import pre_save
from django.utils import timezone
from django.dispatch import receiver
from .models import Patient

def generate_patient_id():
    year = timezone.now().year
    prefix = f"PNT-{year}"
        
    # Count how many beneficiaries were created this year
    last_patient = Patient.objects.filter(
        patient_id__startswith=prefix
    ).order_by('-patient_id').first()

    if last_patient:
        # Extract and increment the last sequence number
        last_sequence = int(last_patient.patient_id.split('-')[-1])
        new_sequence = last_sequence + 1
    else:
        new_sequence = 1

    return f"{prefix}-{new_sequence:06d}"

@receiver(pre_save, sender=Patient)
def set_patient_id(sender, instance, **kwargs):
    if not instance.patient_id:
        instance.patient_id = generate_patient_id()