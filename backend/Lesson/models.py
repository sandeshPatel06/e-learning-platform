from django.db import models
from django.utils.text import slugify
from django.urls import reverse
from courses.models import Course
# Create your models here.
class Lesson(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=250) # Removed unique=True here, as unique_together handles it
    content = models.TextField(blank=True, null=True)
    video_url = models.URLField(blank=True, null=True, help_text="Direct URL to video or embed link.")
    order = models.PositiveIntegerField(help_text="Order of the lesson within the course.")
    is_preview = models.BooleanField(default=False, help_text="Can this lesson be previewed by non-enrolled users?")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']
        unique_together = ('course', 'slug')

    def save(self, *args, **kwargs):
        if not self.slug:
            # Ensure slug is unique for this course, but not globally unique
            base_slug = slugify(self.title)
            unique_slug = base_slug
            num = 1
            while Lesson.objects.filter(course=self.course, slug=unique_slug).exists():
                unique_slug = f"{base_slug}-{num}"
                num += 1
            self.slug = unique_slug
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.course.title} - {self.order}. {self.title}"

    def get_absolute_url(self):
        return reverse('lesson_detail', kwargs={'course_slug': self.course.slug, 'lesson_slug': self.slug})