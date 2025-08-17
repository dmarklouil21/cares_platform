from django.contrib import admin
from . import models

# Register your models here.
class CancerAwarenessActivityAdmin(admin.ModelAdmin):
  list_display = ('uploader', 'title', 'description', 'date', 'created_at')

admin.site.register(models.CancerAwarenessActivity, CancerAwarenessActivityAdmin)