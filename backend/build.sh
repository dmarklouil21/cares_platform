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