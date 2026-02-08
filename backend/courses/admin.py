from django.contrib import admin
from .models import Course

class CourseAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'instructor', 'category', 'price', 'is_free',
        'is_published', 'level', 'average_rating', 'total_lectures',
        'created_at'
    )
    list_filter = ('is_published', 'is_free', 'level', 'category', 'created_at')
    search_fields = ('title', 'short_description', 'description', 'instructor__email')
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ('average_rating', 'number_of_reviews', 'created_at', 'updated_at')
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)
    fieldsets = (
        ("Basic Info", {
            'fields': ('title', 'slug', 'short_description', 'description', 'thumbnail', 'promo_video_url')
        }),
        ("Course Content", {
            'fields': ('what_you_will_learn', 'requirements', 'target_audience')
        }),
        ("Instructor & Category", {
            'fields': ('instructor', 'category')
        }),
        ("Pricing & Access", {
            'fields': ('price', 'is_free', 'is_published', 'level')
        }),
        ("Statistics", {
            'fields': ('duration', 'total_lectures', 'average_rating', 'number_of_reviews')
        }),
        ("Timestamps", {
            'fields': ('created_at', 'updated_at')
        }),
    )

admin.site.register(Course, CourseAdmin)
