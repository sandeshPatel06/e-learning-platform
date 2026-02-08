from django.db import models
import uuid
from Enrollment.models import Enrollment
# Create your models here.
class Certificate(models.Model):
    enrollment = models.OneToOneField(Enrollment, on_delete=models.CASCADE, related_name='certificate')
    unique_id = models.CharField(max_length=100, unique=True)
    issue_date = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.unique_id:
            self.unique_id = str(uuid.uuid4())
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Certificate for {self.enrollment.student.username} - {self.enrollment.course.title}"


