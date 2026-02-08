from django.contrib import admin
from .models import Review

class ReviewAdmin(admin.ModelAdmin):
    list_display = ('course', 'student', 'rating', 'is_approved', 'created_at')
    list_filter = ('is_approved', 'rating', 'course')
    search_fields = ('course__title', 'student__username', 'comment')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)

admin.site.register(Review, ReviewAdmin)
