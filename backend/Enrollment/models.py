from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

from Account.models import CustomUser
from courses.models import Course
# Create your models here.

class Enrollment(models.Model):
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='enrollments', limit_choices_to={'role': 'student'})
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    progress = models.FloatField(default=0.0, validators=[MinValueValidator(0.0), MaxValueValidator(100.0)])
    is_completed = models.BooleanField(default=False)

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.student.username} enrolled in {self.course.title}"