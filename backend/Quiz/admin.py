from django.contrib import admin
from .models import Quiz, UserQuizAttempt

class QuizAdmin(admin.ModelAdmin):
    list_display = ('title', 'lesson', 'passing_score', 'created_at')
    list_filter = ('lesson',)
    search_fields = ('title', 'lesson__title')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')

class UserQuizAttemptAdmin(admin.ModelAdmin):
    list_display = ('student', 'quiz', 'score', 'passed', 'attempt_number', 'submitted_at')
    list_filter = ('quiz', 'passed', 'submitted_at')
    search_fields = ('student__username', 'quiz__title')
    ordering = ('-submitted_at',)
    readonly_fields = ('submitted_at',)

admin.site.register(Quiz, QuizAdmin)
admin.site.register(UserQuizAttempt, UserQuizAttemptAdmin)
