from django.contrib import admin
from . import models

# Register your models here

class PreCancerousMedsRequestAdmin(admin.ModelAdmin):
    list_display = ('id',)

admin.site.register(models.PreCancerousMedsRequest, PreCancerousMedsRequestAdmin)
