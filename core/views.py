from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_POST
import json


def home(request):
    return render(request, 'core/index.html')


@require_POST
def contact_submit(request):
    """Handle AJAX contact form submission."""
    try:
        data = json.loads(request.body)
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        message = data.get('message', '').strip()

        if not all([name, email, message]):
            return JsonResponse(
                {'success': False, 'error': 'All fields are required.'},
                status=400,
            )

        # TODO: Configure EMAIL_BACKEND in settings.py to send real emails
        print(f"[Contact Form] {name} <{email}>: {message}")

        return JsonResponse({
            'success': True,
            'message': 'Thank you! Your message has been received.',
        })
    except (json.JSONDecodeError, Exception):
        return JsonResponse(
            {'success': False, 'error': 'Something went wrong. Please try again.'},
            status=400,
        )
