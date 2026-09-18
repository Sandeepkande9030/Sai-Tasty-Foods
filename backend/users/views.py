
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import User
import json


# =========================
# REGISTER USER
# =========================

@csrf_exempt
def register_user(request):

    if request.method == "POST":

        try:
            data = json.loads(request.body)

            name = data.get("name")
            email = data.get("email")
            password = data.get("password")

            # Check required fields
            if not name or not email or not password:
                return JsonResponse({
                    "success": False,
                    "message": "All fields are required"
                })

            # Check whether email already exists
            if User.objects.filter(email=email).exists():
                return JsonResponse({
                    "success": False,
                    "message": "Email already registered"
                })

            # Create user
            user = User.objects.create(
                name=name,
                email=email,
                password=password
            )

            return JsonResponse({
                "success": True,
                "message": "Registration successful"
            })

        except Exception as e:

            return JsonResponse({
                "success": False,
                "message": str(e)
            })


# =========================
# LOGIN USER
# =========================

@csrf_exempt
def login_user(request):

    if request.method == "POST":

        try:
            data = json.loads(request.body)

            email = data.get("email")
            password = data.get("password")

            # Check required fields
            if not email or not password:
                return JsonResponse({
                    "success": False,
                    "message": "Email and password are required"
                })

            # Find user
            user = User.objects.filter(
                email=email,
                password=password
            ).first()

            if user:

                return JsonResponse({
                    "success": True,
                    "message": "Login successful",
                    "user": {
                        "id": user.id,
                        "name": user.name,
                        "email": user.email
                    }
                })

            else:

                return JsonResponse({
                    "success": False,
                    "message": "Invalid email or password"
                })

        except Exception as e:

            return JsonResponse({
                "success": False,
                "message": str(e)
            })

    return JsonResponse({
        "success": False,
        "message": "Only POST method is allowed"
    })


# =========================
# GET ALL USERS
# =========================

def get_users(request):

    if request.method == "GET":

        users = User.objects.all().order_by("-id")

        user_list = []

        for user in users:
            user_list.append({
                "id": user.id,
                "name": user.name,
                "email": user.email
            })

        return JsonResponse({
            "success": True,
            "users": user_list
        })

    return JsonResponse({
        "success": False,
        "message": "Only GET method is allowed"
    })

