from django.db.models.signals import pre_save
from django.utils import timezone
from django.dispatch import receiver
from .models import Beneficiary

def generate_beneficiary_id():
    year = timezone.now().year
    prefix = f"BEN-{year}"
        
    # Count how many beneficiaries were created this year
    last_beneficiary = Beneficiary.objects.filter(
        beneficiary_id__startswith=prefix
    ).order_by('-beneficiary_id').first()

    if last_beneficiary:
        # Extract and increment the last sequence number
        last_sequence = int(last_beneficiary.beneficiary_id.split('-')[-1])
        new_sequence = last_sequence + 1
    else:
        new_sequence = 1

    return f"{prefix}-{new_sequence:06d}"

@receiver(pre_save, sender=Beneficiary)
def set_beneficiary_id(sender, instance, **kwargs):
    if not instance.beneficiary_id:
        instance.beneficiary_id = generate_beneficiary_id()