from django.contrib import admin
from django.urls import path, include
from courses import views
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth import views as auth_views
from courses.views import faq_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('sandesh', views.index, name='index'),
    path('', views.frontend, name='index'),
    path('courses/', views.courses, name='courses'),
    path('course/<slug:slug>/', views.course_detail, name='course_detail'),
    path('profile/', views.profile, name='profile'),
    path('login/', views.user_login, name='login'),
    path('logout/', views.user_logout, name='logout'),
    path('register/', views.register, name='register'),
    path('enroll/<slug:slug>/', views.enroll, name='enroll'),
    path('api/', include('courses.urls')),
   path('faq/', faq_view, name='faq'),
   path(
        'password_reset/',
        auth_views.PasswordResetView.as_view(
            template_name='registration/password_reset_form.html',
            email_template_name='registration/password_reset_email.html',
            subject_template_name='registration/password_reset_subject.txt'
        ),
        name='password_reset'
    ),

    # Password reset - email sent confirmation
    path(
        'password_reset/done/',
        auth_views.PasswordResetDoneView.as_view(
            template_name='registration/password_reset_done.html'
        ),
        name='password_reset_done'
    ),

    # Password reset - confirm link with uid and token
    path(
        'reset/<uidb64>/<token>/',
        auth_views.PasswordResetConfirmView.as_view(
            template_name='registration/password_reset_confirm.html'
        ),
        name='password_reset_confirm'
    ),

    # Password reset - complete
    path(
        'reset/done/',
        auth_views.PasswordResetCompleteView.as_view(
            template_name='registration/password_reset_complete.html'
        ),
        name='password_reset_complete'
    ),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
