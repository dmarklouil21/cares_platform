from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.utils import timezone

from .models import User

def generate_user_id():
    year = timezone.now().year
    prefix = f"USR-{year}"

    last_user = User.objects.filter(user_id__startswith=prefix).order_by('-user_id').first()

    if last_user:
        last_number = int(last_user.user_id.split('-')[-1]) 
        new_number = last_number + 1
    else:
        new_number = 1

    return f"{prefix}-{new_number:06d}"

@receiver(pre_save, sender=User)
def set_user_id(sender, instance, **kwargs):
    if not instance.user_id:
        instance.user_id = generate_user_id()
