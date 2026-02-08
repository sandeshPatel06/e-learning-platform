from django.db import models
from django.utils.text import slugify
from django.urls import reverse
from django.core.validators import MinValueValidator, MaxValueValidator
from Account.models import CustomUser
from Category.models import Category

class Course(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, max_length=200)
    short_description = models.CharField(max_length=500, help_text="A brief overview of the course.")
    description = models.TextField(help_text="Detailed course description, including learning objectives.")
    what_you_will_learn = models.TextField(blank=True, null=True, help_text="Comma-separated or bullet points of learning outcomes.")
    requirements = models.TextField(blank=True, null=True, help_text="Prerequisites or materials needed for the course.")
    target_audience = models.TextField(blank=True, null=True, help_text="Who is this course for?")

    instructor = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='taught_courses', limit_choices_to={'role__in': ['instructor', 'admin']}) # Allow admin to be instructor
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='courses')

    thumbnail = models.ImageField(upload_to='course_thumbnails/', blank=True, null=True, help_text="Thumbnail image for the course listing.")
    promo_video_url = models.URLField(blank=True, null=True, help_text="Link to a promotional video for the course.")

    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_free = models.BooleanField(default=False)
    is_published = models.BooleanField(default=False, help_text="Set to true to make the course visible to users.")
    level = models.CharField(max_length=50, choices=[('beginner', 'Beginner'), ('intermediate', 'Intermediate'), ('advanced', 'Advanced')], default='beginner')

    duration = models.CharField(max_length=50, blank=True, null=True, help_text="E.g., '10 hours', '3 weeks'")
    total_lectures = models.PositiveIntegerField(default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00, validators=[MinValueValidator(0), MaxValueValidator(5)])
    number_of_reviews = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse('course_detail', kwargs={'slug': self.slug})

    class Meta:
        ordering = ['-created_at']






