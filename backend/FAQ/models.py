from django.db import models
from Category.models import Category
# Create your models here.

class FAQ(models.Model):
    question = models.TextField()
    answer = models.TextField(blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='faqs')
    is_published = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.question[:60] + "..." if len(self.question) > 60 else self.question

    class Meta:
        verbose_name_plural = "FAQs"
        ordering = ['order']