from django.db import models
from Quiz.models import Quiz
# Create your models here.
class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=50, choices=[('mcq', 'Multiple Choice'), ('text', 'Text Answer')], default='mcq')
    order = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.question_text[:75]

    class Meta:
        ordering = ['order']

class AnswerChoice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    choice_text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.choice_text[:75]