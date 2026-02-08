from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from Account.models import CustomUser
from courses.models import Course
from Category.models import Category
from Certificate.models import Certificate
from Enrollment.models import Enrollment
from FAQ.models import FAQ
from Lesson.models import Lesson
from Question.models import Question, AnswerChoice
from Quiz.models import Quiz, UserQuizAttempt
from Review.models import Review

class Command(BaseCommand):
    help = 'Set up groups and assign permissions for user roles'

    def handle(self, *args, **kwargs):
        # Content types for all models
        ct = {
            'course': ContentType.objects.get_for_model(Course),
            'customuser': ContentType.objects.get_for_model(CustomUser),
            'category': ContentType.objects.get_for_model(Category),
            'certificate': ContentType.objects.get_for_model(Certificate),
            'enrollment': ContentType.objects.get_for_model(Enrollment),
            'faq': ContentType.objects.get_for_model(FAQ),
            'lesson': ContentType.objects.get_for_model(Lesson),
            'question': ContentType.objects.get_for_model(Question),
            'answerchoice': ContentType.objects.get_for_model(AnswerChoice),
            'quiz': ContentType.objects.get_for_model(Quiz),
            'userquizattempt': ContentType.objects.get_for_model(UserQuizAttempt),
            'review': ContentType.objects.get_for_model(Review),
        }

        groups = {
            'Student': [
                ('view_course', ct['course']),
                ('view_lesson', ct['lesson']),
                ('view_quiz', ct['quiz']),
                ('view_enrollment', ct['enrollment']),
                ('view_category', ct['category']),
                ('view_certificate', ct['certificate']),
                ('view_faq', ct['faq']),
                ('view_question', ct['question']),
                ('view_answerchoice', ct['answerchoice']),
                ('view_review', ct['review']),
            ],
            'Instructor': [
                # Course
                ('add_course', ct['course']),
                ('change_course', ct['course']),
                ('delete_course', ct['course']),
                ('view_course', ct['course']),
                # User
                ('view_customuser', ct['customuser']),  # <-- Add this line
                ('change_customuser', ct['customuser']),  # <-- Optionally add this line if you want edit access
                ('delete_customuser', ct['customuser']),
                # Category
                ('add_category', ct['category']),
                ('change_category', ct['category']),
                ('view_category', ct['category']),
                # Certificate
                ('add_certificate', ct['certificate']),
                ('change_certificate', ct['certificate']),
                ('view_certificate', ct['certificate']),
                # Enrollment
                ('delete_enrollment', ct['enrollment']),
                ('view_enrollment', ct['enrollment']),
                # FAQ
                ('add_faq', ct['faq']),
                ('change_faq', ct['faq']),
                ('delete_faq', ct['faq']),
                ('view_faq', ct['faq']),
                # Lesson
                ('add_lesson', ct['lesson']),
                ('change_lesson', ct['lesson']),
                ('delete_lesson', ct['lesson']),
                ('view_lesson', ct['lesson']),
                # Quiz
                ('add_quiz', ct['quiz']),
                ('change_quiz', ct['quiz']),
                ('delete_quiz', ct['quiz']),
                ('view_quiz', ct['quiz']),
                # Question/AnswerChoice
                ('add_question', ct['question']),
                ('change_question', ct['question']),
                ('delete_question', ct['question']),
                ('view_question', ct['question']),
                ('add_answerchoice', ct['answerchoice']),
                ('change_answerchoice', ct['answerchoice']),
                ('delete_answerchoice', ct['answerchoice']),
                ('view_answerchoice', ct['answerchoice']),
                # Review (view only)
                ('view_review', ct['review']),
            ],
            'Admin': []  # Will be assigned all permissions
        }

        # Setup groups
        for group_name, perms in groups.items():
            group, created = Group.objects.get_or_create(name=group_name)
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created group: {group_name}"))
            else:
                self.stdout.write(f"Group already exists: {group_name}")

            group.permissions.clear()

            if group_name == 'Admin':
                group.permissions.set(Permission.objects.all())
                self.stdout.write(f"Assigned ALL permissions to {group_name}")
            else:
                for codename, content_type in perms:
                    try:
                        perm = Permission.objects.get(codename=codename, content_type=content_type)
                        group.permissions.add(perm)
                        self.stdout.write(f"Added {codename} to {group_name}")
                    except Permission.DoesNotExist:
                        self.stdout.write(self.style.WARNING(f"Permission {codename} not found for {content_type}"))

        self.stdout.write(self.style.SUCCESS("Group and permission setup complete."))
# python manage.py setup_roles