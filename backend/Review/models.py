from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from Account.models import CustomUser
from courses.models import Course
# Create your models here.
class Review(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='reviews')
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='reviews_given', limit_choices_to={'role': 'student'})
    rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)], help_text="Rating out of 5 stars.")
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_approved = models.BooleanField(default=False, help_text="Admin approval for review visibility.")

    class Meta:
        unique_together = ('course', 'student')
        ordering = ['-created_at']

    def __str__(self):
        return f"Review for {self.course.title} by {self.student.username} - {self.rating} stars"