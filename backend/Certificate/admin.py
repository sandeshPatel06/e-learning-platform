from django.contrib import admin
from .models import Certificate

class CertificateAdmin(admin.ModelAdmin):
    list_display = ('enrollment', 'unique_id', 'issue_date')
    search_fields = ('unique_id', 'enrollment__student__username', 'enrollment__course__title')
    readonly_fields = ('unique_id', 'issue_date')
    ordering = ('-issue_date',)

admin.site.register(Certificate, CertificateAdmin)
