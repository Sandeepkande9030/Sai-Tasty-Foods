
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.core.mail import send_mail
from .models import User
import json
import random
import os

# =========================
# REGISTER USER
# =========================

@csrf_exempt
def register_user(request):

    if request.method == "POST":

        try:
            data = json.loads(request.body)

            print("=================================", flush=True)
            print("REGISTER FUNCTION CALLED", flush=True)

            name = data.get("name")
            email = data.get("email")
            password = data.get("password")

            print("Name:", name, flush=True)
            print("Email:", email, flush=True)

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

            # Generate 6-digit OTP
            otp = str(random.randint(100000, 999999))

            print("OTP GENERATED:", otp, flush=True)

            # Create user
            user = User.objects.create(
                name=name,
                email=email,
                password=password,
                is_verified=False,
                otp=otp,
                otp_created_at=timezone.now()
            )

            print("USER CREATED SUCCESSFULLY", flush=True)

            # =========================
            # SEND OTP EMAIL
            # =========================

            send_mail(
                subject="Sai Tasty Foods - Email Verification OTP",
                message=f"""
Hello {name},

Thank you for registering with Sai Tasty Foods.

Your email verification OTP is:

{otp}

This OTP is valid for 5 minutes.

Please do not share this OTP with anyone.

Regards,
Sai Tasty Foods
""",
                from_email=None,
                recipient_list=[email],
                fail_silently=False,
            )

            print("OTP EMAIL SENT SUCCESSFULLY", flush=True)

            return JsonResponse({
                "success": True,
                "message": "Registration successful. OTP sent to your email.",
                "email": email
            })

        except Exception as e:

            print("REGISTER ERROR:", str(e), flush=True)

            return JsonResponse({
                "success": False,
                "message": str(e)
            })

    return JsonResponse({
        "success": False,
        "message": "Only POST method is allowed"
    })


# =========================
# VERIFY OTP
# =========================

@csrf_exempt
def verify_otp(request):

    if request.method == "POST":

        try:
            data = json.loads(request.body)

            email = data.get("email")
            otp = data.get("otp")

            # Check required fields
            if not email or not otp:

                return JsonResponse({
                    "success": False,
                    "message": "Email and OTP are required"
                })

            # Find user
            user = User.objects.filter(
                email=email
            ).first()

            if not user:

                return JsonResponse({
                    "success": False,
                    "message": "User not found"
                })

            # Check whether already verified
            if user.is_verified:

                return JsonResponse({
                    "success": False,
                    "message": "Email is already verified"
                })

            # =========================
            # OTP EXPIRY CHECK
            # =========================

            if user.otp_created_at:

                current_time = timezone.now()

                time_difference = (
                    current_time - user.otp_created_at
                ).total_seconds()

                # OTP expires after 5 minutes
                if time_difference > 300:

                    return JsonResponse({
                        "success": False,
                        "message": "OTP has expired. Please request a new OTP."
                    })

            # =========================
            # CHECK OTP
            # =========================

            if user.otp != otp:

                return JsonResponse({
                    "success": False,
                    "message": "Invalid OTP"
                })

            # Mark email as verified
            user.is_verified = True

            # Clear OTP
            user.otp = None
            user.otp_created_at = None

            user.save()

            return JsonResponse({
                "success": True,
                "message": "Email verified successfully"
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

                # Check whether email is verified
                if not user.is_verified:

                    return JsonResponse({
                        "success": False,
                        "message": "Please verify your email before logging in."
                    })

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


# =========================
# RESEND OTP
# =========================

@csrf_exempt
def resend_otp(request):

    if request.method == "POST":

        try:

            data = json.loads(request.body)

            email = data.get("email")

            if not email:

                return JsonResponse({
                    "success": False,
                    "message": "Email is required"
                })

            # Find user
            user = User.objects.filter(
                email=email
            ).first()

            if not user:

                return JsonResponse({
                    "success": False,
                    "message": "User not found"
                })

            # Check if already verified
            if user.is_verified:

                return JsonResponse({
                    "success": False,
                    "message": "Email is already verified"
                })

            # Generate new OTP
            otp = str(random.randint(100000, 999999))

            # Save new OTP and time
            user.otp = otp
            user.otp_created_at = timezone.now()

            user.save()

            # =========================
            # SEND NEW OTP EMAIL
            # =========================

            send_mail(
                subject="Sai Tasty Foods - New OTP",
                message=f"""
Hello {user.name},

Your new Sai Tasty Foods email verification OTP is:

{otp}

This OTP is valid for 5 minutes.

Please do not share this OTP with anyone.

Regards,
Sai Tasty Foods
""",
                from_email=None,
                recipient_list=[email],
                fail_silently=False,
            )

            print("RESEND OTP EMAIL SENT SUCCESSFULLY", flush=True)

            return JsonResponse({
                "success": True,
                "message": "New OTP sent to your email."
            })

        except Exception as e:

            print("RESEND OTP ERROR:", str(e), flush=True)

            return JsonResponse({
                "success": False,
                "message": str(e)
            })

    return JsonResponse({
        "success": False,
        "message": "Only POST method is allowed"
    })
# =========================
# FORGOT PASSWORD
# =========================

@csrf_exempt
def forgot_password(request):

    if request.method == "POST":

        try:

            data = json.loads(request.body)

            email = data.get("email")

            if not email:

                return JsonResponse({
                    "success": False,
                    "message": "Email is required"
                })

            # Find user
            user = User.objects.filter(
                email=email
            ).first()

            if not user:

                return JsonResponse({
                    "success": False,
                    "message": "Email not registered"
                })

            # Generate 6-digit OTP
            otp = str(random.randint(100000, 999999))

            print("PASSWORD RESET OTP:", otp, flush=True)

            # Save OTP
            user.otp = otp
            user.otp_created_at = timezone.now()

            user.save()

            # =========================
            # SEND PASSWORD RESET OTP
            # =========================
            print("EMAIL USER:", os.getenv("EMAIL_HOST_USER"), flush=True)
            print("EMAIL PASSWORD EXISTS:", bool(os.getenv("EMAIL_HOST_PASSWORD")), flush=True)
            send_mail(
                subject="Sai Tasty Foods - Password Reset OTP",
                message=f"""
Hello {user.name},

We received a request to reset your Sai Tasty Foods password.

Your password reset OTP is:

{otp}

This OTP is valid for 5 minutes.

If you did not request a password reset, please ignore this email.

Regards,
Sai Tasty Foods
""",
                from_email=None,
                recipient_list=[email],
                fail_silently=False,
            )

            print(
                "PASSWORD RESET OTP EMAIL SENT SUCCESSFULLY",
                flush=True
            )

            return JsonResponse({
                "success": True,
                "message": "Password reset OTP sent to your email.",
                "email": email
            })

        except Exception as e:

            print(
                "FORGOT PASSWORD ERROR:",
                str(e),
                flush=True
            )

            return JsonResponse({
                "success": False,
                "message": str(e)
            })

    return JsonResponse({
        "success": False,
        "message": "Only POST method is allowed"
    })
    # =========================
# RESET PASSWORD
# =========================

@csrf_exempt
def reset_password(request):

    if request.method == "POST":

        try:

            data = json.loads(request.body)

            email = data.get("email")
            otp = data.get("otp")
            new_password = data.get("new_password")

            # Check required fields
            if not email or not otp or not new_password:

                return JsonResponse({
                    "success": False,
                    "message": "Email, OTP and new password are required"
                })

            # Find user
            user = User.objects.filter(
                email=email
            ).first()

            if not user:

                return JsonResponse({
                    "success": False,
                    "message": "User not found"
                })

            # =========================
            # OTP EXPIRY CHECK
            # =========================

            if not user.otp_created_at:

                return JsonResponse({
                    "success": False,
                    "message": "Please request a new OTP"
                })

            current_time = timezone.now()

            time_difference = (
                current_time - user.otp_created_at
            ).total_seconds()

            # OTP expires after 5 minutes
            if time_difference > 300:

                return JsonResponse({
                    "success": False,
                    "message": "OTP has expired. Please request a new OTP."
                })

            # =========================
            # CHECK OTP
            # =========================

            if user.otp != otp:

                return JsonResponse({
                    "success": False,
                    "message": "Invalid OTP"
                })

            # =========================
            # CHANGE PASSWORD
            # =========================

            user.password = new_password

            # Clear OTP after successful reset
            user.otp = None
            user.otp_created_at = None

            user.save()

            return JsonResponse({
                "success": True,
                "message": "Password reset successfully"
            })

        except Exception as e:

            print(
                "RESET PASSWORD ERROR:",
                str(e),
                flush=True
            )

            return JsonResponse({
                "success": False,
                "message": str(e)
            })

    return JsonResponse({
        "success": False,
        "message": "Only POST method is allowed"
    })