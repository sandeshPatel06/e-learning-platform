from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from Account.models import CustomUser
from Lesson.models import Lesson
# Create your models here.
class Quiz(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='quizzes')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True, help_text="Optional description for the quiz.")
    passing_score = models.PositiveIntegerField(default=70, validators=[MinValueValidator(0), MaxValueValidator(100)], help_text="Percentage required to pass the quiz.")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Quiz: {self.title} for {self.lesson.title}"

    class Meta:
        verbose_name_plural = "Quizzes"


class UserQuizAttempt(models.Model):
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='quiz_attempts', limit_choices_to={'role': 'student'})
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, validators=[MinValueValidator(0.00), MaxValueValidator(100.00)])
    passed = models.BooleanField(default=False)
    attempt_number = models.PositiveIntegerField(default=1)
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.username} - {self.quiz.title} (Score: {self.score}%)"

    class Meta:
        ordering = ['-submitted_at']
        unique_together = ('student', 'quiz', 'attempt_number')
