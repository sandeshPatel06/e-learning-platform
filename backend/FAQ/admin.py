from django.contrib import admin
from .models import FAQ

class FAQAdmin(admin.ModelAdmin):
    list_display = ('question', 'category', 'is_published', 'order', 'created_at')
    list_filter = ('is_published', 'category')
    search_fields = ('question', 'answer')
    ordering = ('order',)
    readonly_fields = ('created_at', 'updated_at')

admin.site.register(FAQ, FAQAdmin)
