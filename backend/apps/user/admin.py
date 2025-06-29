from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from . import models

# Register your models here.

class UserAdminConfig(UserAdmin):
    list_display = ('username', 'last_name', 'first_name', 'email', 
                    'date_of_birth', 'age', 'phone_number', 'is_resident_of_cebu', 
                    'lgu', 'address', 'is_rhu', 'is_private')
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('date_of_birth', 'age', 'phone_number', 'is_resident_of_cebu', 
                           'lgu', 'address', 'avatar', 'is_rhu', 'is_private', 'is_first_login')}),
    )

admin.site.register(models.User, UserAdminConfig)