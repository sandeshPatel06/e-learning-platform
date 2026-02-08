import os
from premailer import transform
# logoImg = os.getenv('logoImg')
# BACKEND_DOMAIN = os.getenv('BACKEND_DOMAIN')
# ADDRESS = os.getenv('ADDRESS')
# SUPPORT_MAIL = os.getenv('SUPPORT_MAIL')
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings

def trigger_email(context, template, subject, recipients, message="Unable to view this, contact admin."):
    try:
        context['imgLogo'] = "www.example.com/logo.png"
        context['BACKEND_DOMAIN'] = 'http://localhost:8000'
        context['ADDRESS'] = '123 Example St, City, Country'
        context['SUPPORT_MAIL'] = 'support@example.com'

        raw_html = render_to_string(template_name=template, context=context)
        html_message = transform(raw_html)

        send_mail(
            subject=subject,
            message=message,
            from_email=None,
            html_message=html_message,
            recipient_list=recipients,
            fail_silently=False,
        )
        return None
    except Exception as e:
        return e