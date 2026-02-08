from django.contrib import admin
from .models import Question, AnswerChoice

class AnswerChoiceInline(admin.TabularInline):
    model = AnswerChoice
    extra = 2

class QuestionAdmin(admin.ModelAdmin):
    list_display = ('question_text', 'quiz', 'question_type', 'order')
    list_filter = ('quiz', 'question_type')
    search_fields = ('question_text', 'quiz__title')
    ordering = ('quiz', 'order')
    inlines = [AnswerChoiceInline]

class AnswerChoiceAdmin(admin.ModelAdmin):
    list_display = ('choice_text', 'question', 'is_correct')
    list_filter = ('is_correct', 'question')
    search_fields = ('choice_text', 'question__question_text')

admin.site.register(Question, QuestionAdmin)
admin.site.register(AnswerChoice, AnswerChoiceAdmin)
