from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('instructor', 'Instructor'),
        ('admin', 'Admin'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    bio = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=[('male', 'Male'), ('female', 'Female'), ('other', 'Other')], blank=True)
    contact_number = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    country = models.CharField(max_length=50, blank=True)
    is_email_verified = models.BooleanField(default=False)
    highest_qualification = models.CharField(max_length=100, blank=True)
    institution = models.CharField(max_length=100, blank=True)
    skills = models.TextField(blank=True, help_text="Comma-separated skills like Python, ML, etc.")
    linkedin_profile = models.URLField(blank=True)
    github_profile = models.URLField(blank=True) 
    enrolled_courses = models.ManyToManyField('courses.Course', blank=True, related_name='enrolled_students_via_m2m') 
    completed_courses = models.ManyToManyField('courses.Course', blank=True, related_name='completed_students_via_m2m') 
    quiz_scores = models.JSONField(blank=True, null=True, help_text="Store quiz scores or progress data")
    instructor_rating = models.FloatField(default=0.0)
    total_reviews = models.PositiveIntegerField(default=0)
    is_active_user = models.BooleanField(default=True)
    last_activity = models.DateTimeField(null=True, blank=True)
    login_ip = models.GenericIPAddressField(null=True, blank=True)
    two_factor_enabled = models.BooleanField(default=False)
    class Meta:
        verbose_name = 'Custom User'
        verbose_name_plural = 'Custom Users'
        pass 

    def __str__(self):
        return f"{self.username} ({self.role})"
    

    # The save method was commented out, keep it that way if it's not needed,
    # otherwise uncomment and ensure it doesn't conflict with AbstractUser's save logic
    # def save(self, *args, **kwargs):
    #     if self.role in ['instructor', 'admin']:
    #         self.is_staff = True
    #     else:
    #         self.is_staff = False
    #     super().save(*args, **kwargs)