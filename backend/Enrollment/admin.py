from django.contrib import admin
from .models import Enrollment

class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'enrolled_at', 'completed_at', 'progress', 'is_completed')
    list_filter = ('is_completed', 'enrolled_at', 'completed_at', 'course')
    search_fields = ('student__username', 'student__email', 'course__title')
    readonly_fields = ('enrolled_at',)
    ordering = ('-enrolled_at',)

admin.site.register(Enrollment, EnrollmentAdmin)
