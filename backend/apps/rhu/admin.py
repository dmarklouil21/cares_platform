from django.contrib import admin
from .models import RHU, Rhuv2, Representative

@admin.register(RHU)
class RHUAdmin(admin.ModelAdmin):
    list_display = (
        'lgu',
        'official_representative_name',
        'representative_first_name',
        'representative_last_name',
        'email',
        'phone_number',
        'created_at',
    )
    search_fields = (
        'lgu', 'official_representative_name', 'representative_first_name',
        'representative_last_name', 'email', 'phone_number'
    )
    list_filter = ('lgu',)
    readonly_fields = ('created_at',)

admin.site.register(Rhuv2)
admin.site.register(Representative)