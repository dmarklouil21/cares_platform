#!/usr/bin/env bash
# Exit on error
set -o errexit

# Create and activate virtual environment
# python -m venv venv
# source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Install dependencies
# pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --no-input

# Run migrations
python manage.py migrate

# Create superuser if it doesn't exist
python manage.py shell -c "
  from django.contrib.auth import get_user_model
  User = get_user_model()
  if not User.objects.filter(username='admin').exists():
      User.objects.create_superuser('admin', '', 'admin123')
      print('Superuser created: admin / admin123')
  else:
      print('Superuser already exists')
  "