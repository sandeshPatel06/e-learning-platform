from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = (
        'username', 'email', 'role', 'is_active_user', 'is_email_verified',
        'date_joined', 'last_login', 'instructor_rating', 'total_reviews'
    )
    list_filter = ('role', 'is_active_user', 'is_email_verified', 'date_joined')
    search_fields = ('username', 'email', 'role', 'skills')
    readonly_fields = ('date_joined', 'last_login')
    fieldsets = UserAdmin.fieldsets + (
        ("Additional Info", {
            'fields': (
                'role', 'bio', 'profile_picture', 'date_of_birth', 'gender',
                'contact_number', 'address', 'country', 'is_email_verified',
                'highest_qualification', 'institution', 'skills',
                'linkedin_profile', 'github_profile', 'enrolled_courses',
                'completed_courses', 'quiz_scores', 'instructor_rating',
                'total_reviews', 'is_active_user', 'last_activity', 'login_ip',
                'two_factor_enabled'
            )
        }),
    )

admin.site.register(CustomUser, CustomUserAdmin)
