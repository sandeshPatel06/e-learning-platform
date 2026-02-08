from django.contrib import admin
from .models import Lesson

class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order', 'is_preview', 'created_at')
    list_filter = ('course', 'is_preview')
    search_fields = ('title', 'course__title', 'slug')
    ordering = ('course', 'order')
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ('created_at', 'updated_at')

admin.site.register(Lesson, LessonAdmin)
