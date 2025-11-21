import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = "Creates an admin user non-interactively if it doesn't exist"

    def handle(self, *args, **options):
        User = get_user_model()
        
        # Get credentials from Environment Variables (or use defaults)
        email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "caresadmin@gmail.com")
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "admin123")
        
        # Check if this user already exists
        if not User.objects.filter(username=email).exists():
            print(f"Creating superuser: {email}...")
            
            # We create a new user instance
            admin = User.objects.create_superuser(
                username=email,
                password=password,
            )
            admin.save()
            print(f"Superuser {email} created successfully!")
        else:
            print("Superuser already exists. Skipping creation.")