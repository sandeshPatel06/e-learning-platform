from django.shortcuts import render, redirect, get_object_or_404
from .forms import QuestionForm
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django import forms
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from courses.models import Course  # Only Course from courses.models
from Enrollment.models import Enrollment
from Account.models import CustomUser
from Category.models import Category
from Lesson.models import Lesson
from Quiz.models import Quiz
from FAQ.models import FAQ
from django.views.generic import ListView
from django.contrib.auth.views import PasswordResetView
import os
# DRF Imports
from rest_framework import viewsets
from .serializers import (
    CustomUserSerializer, CategorySerializer, CourseSerializer,
    LessonSerializer, EnrollmentSerializer, QuizSerializer, FAQSerializer
)
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import SessionAuthentication, BasicAuthentication


# --- DRF ViewSets ---

class CustomUserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    # Only authenticated users can access, but allow anyone to create (for registration)
    permission_classes = [AllowAny] # You might want to customize this further for production
    authentication_classes = [SessionAuthentication, BasicAuthentication]


class CategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows categories to be viewed or edited.
    """
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class CourseViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows courses to be viewed or edited.
    Includes nested lessons and related instructor/category data.
    """
    queryset = Course.objects.all().order_by('-created_at')
    serializer_class = CourseSerializer
    permission_classes = [AllowAny] # Adjust permissions as needed (e.g., IsAdminUser for write operations)


class LessonViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows lessons to be viewed or edited.
    """
    queryset = Lesson.objects.all().order_by('order')
    serializer_class = LessonSerializer
    permission_classes = [AllowAny]


class EnrollmentViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows enrollments to be viewed or edited.
    """
    queryset = Enrollment.objects.all().order_by('-enrolled_at')
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated] # Only authenticated users can manage enrollments

    def perform_create(self, serializer):
        """
        Set the student to the requesting user when creating an enrollment.
        """
        serializer.save(student=self.request.user)


class QuizViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows quizzes to be viewed or edited.
    """
    queryset = Quiz.objects.all().order_by('-created_at')
    serializer_class = QuizSerializer
    permission_classes = [AllowAny] # Adjust as needed


class FAQViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows FAQs to be viewed or edited.
    """
    queryset = FAQ.objects.all().order_by('-created_at')
    serializer_class = FAQSerializer
    permission_classes = [AllowAny]


# --- Existing Django Views (kept for template rendering) ---

def faq_view(request):
    faqs = FAQ.objects.exclude(answer="").order_by('-created_at')
    form = QuestionForm()

    if request.method == 'POST':
        form = QuestionForm(request.POST)
        if form.is_valid():
            FAQ.objects.create(
                question=form.cleaned_data['question'],
                answer=''
            )
            return redirect('faq')

    return render(request, 'faq.html', {'faqs': faqs, 'form': form})

class RegisterForm(forms.ModelForm):
    password1 = forms.CharField(widget=forms.PasswordInput, label="Password")
    password2 = forms.CharField(widget=forms.PasswordInput, label="Confirm Password")

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'role']

    def clean_password2(self):
        password1 = self.cleaned_data.get('password1')
        password2 = self.cleaned_data.get('password2')
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords don't match")
        return password2

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])

        if self.cleaned_data.get('role') == 'instructor':
            user.is_staff = True

        if commit:
            user.save()
        return user

def index(request):
    courses = Course.objects.all()
    context = {'courses': courses}
    return render(request, 'index.html', context)

def frontend(request):
    return redirect(os.getenv('FRONTEND_URL'))
def courses(request):
    courses = Course.objects.all()
    courses = {'courses': courses}
    return render(courses)

def course_detail(request, slug):
    course = get_object_or_404(Course, slug=slug)
    is_enrolled = False
    if request.user.is_authenticated:
        is_enrolled = Enrollment.objects.filter(student=request.user, course=course).exists()
    context = {'course': course, 'is_enrolled': is_enrolled}
    return render(request, 'course_detail.html', context)

@login_required
def profile(request):
    enrollments = Enrollment.objects.filter(student=request.user)
    context = {'enrollments': enrollments}
    return render(request, 'profile.html', context)

def user_login(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('index')
        else:
            form = forms.Form()
            return render(request, 'login.html', {'form': form})
    return render(request, 'login.html', {'form': forms.Form()})

def user_logout(request):
    logout(request)
    return redirect('index')

def register(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.set_password(form.cleaned_data['password1'])
            user.save()
            subject = 'Welcome to E-Learn!'
            html_message = render_to_string('registration/welcome_email.html', {
                'user': user,
                'site_url': request.build_absolute_uri('/')
            })
            plain_message = f"Hi {user.username},\n\nWelcome to E-Learn! We're excited to have you on board. Start exploring our courses at {request.build_absolute_uri('/')}\n\nBest,\nThe E-Learn Team"
            try:
                send_mail(
                    subject,
                    plain_message,
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    html_message=html_message,
                    fail_silently=False,
                )
            except Exception as e:
                messages.warning(request, 'Welcome email could not be sent, but your account was created.')
            login(request, user)
            messages.success(request, 'Registration successful! A welcome email has been sent.')
            return redirect('index')
    else:
        form = RegisterForm()
    return render(request, 'register.html', {'form': form})

@login_required
def enroll(request, slug):
    course = get_object_or_404(Course, slug=slug)
    if request.method == 'POST':
        if not Enrollment.objects.filter(student=request.user, course=course).exists():
            enrollment = Enrollment.objects.create(student=request.user, course=course)
            subject = f'Enrolled in {course.title}'
            html_message = render_to_string('registration/course_enrollment_email.html', {
                'user': request.user,
                'course': course,
                'course_url': request.build_absolute_uri(course.get_absolute_url())
            })
            plain_message = f"Hi {request.user.username},\n\nYou have successfully enrolled in {course.title}! Access the course at {request.build_absolute_uri(course.get_absolute_url())}\n\nBest,\nThe E-Learn Team"
            try:
                send_mail(
                    subject,
                    plain_message,
                    settings.DEFAULT_FROM_EMAIL,
                    [request.user.email],
                    html_message=html_message,
                    fail_silently=False,
                )
            except Exception as e:
                messages.warning(request, 'Enrollment email could not be sent, but you are enrolled.')
            messages.success(request, f'You have successfully enrolled in {course.title}!')
            return redirect('course_detail', slug=course.slug)
    return render(request, 'enroll.html', {'course': course})

class CustomPasswordResetView(PasswordResetView):
    def form_valid(self, form):
        opts = {
            'use_https': self.request.is_secure(),
            'token_generator': self.token_generator,
            'from_email': self.from_email or settings.DEFAULT_FROM_EMAIL,
            'email_template_name': self.email_template_name,
            'request': self.request,
            'html_email_template_name': self.html_email_template_name,
            'subject_template_name': self.subject_template_name,
        }
        form.save(**opts)
        return super().form_valid(form)
