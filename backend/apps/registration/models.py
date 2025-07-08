from django.db import models

# Create your models here.

class Registration(models.Model):
    email = models.EmailField()
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    phone_number = models.CharField(max_length=15)
    password = models.CharField(max_length=128)  
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.email} - {self.phone_number}"
