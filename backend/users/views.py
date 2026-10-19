
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.uploadedfile import UploadedFile
from django.utils import timezone
from django.core.mail import send_mail
from .models import User, Restaurant, Order, FoodItem, Admin
import json
import random
import os
import uuid
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from vercel.blob import BlobClient
from django.core import signing
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
            phone = data.get("phone")
            email = data.get("email")
            password = data.get("password")

            print("Name:", name, flush=True)
            print("Email:", email, flush=True)

            # Check required fields
            if not name or not phone or not email or not password:

                return JsonResponse({
                    "success": False,
                    "message": "All fields are required"
                })
            if not phone.isdigit() or len(phone) != 10:

                return JsonResponse({
                    "success": False,
                    "message": "Please enter a valid 10 digit phone number"
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
                phone=phone,
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
                        "email": user.email,
                        "phone": user.phone
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

@csrf_exempt
def update_user_profile(request):
    if request.method != "POST":
        return JsonResponse({
            "success": False,
            "message": "Only POST method is allowed"
        }, status=405)

    try:
        data = json.loads(request.body)

        user_id = data.get("user_id")
        name = data.get("name", "").strip()
        phone = data.get("phone", "").strip()

        if not user_id:
            return JsonResponse({
                "success": False,
                "message": "User ID is required"
            }, status=400)

        if not name:
            return JsonResponse({
                "success": False,
                "message": "Name is required"
            }, status=400)

        if not phone.isdigit() or len(phone) != 10:
            return JsonResponse({
                "success": False,
                "message": "Enter a valid 10-digit phone number"
            }, status=400)

        user = User.objects.filter(id=user_id).first()

        if not user:
            return JsonResponse({
                "success": False,
                "message": "User not found"
            }, status=404)

        user.name = name
        user.phone = phone
        user.save(update_fields=["name", "phone"])

        return JsonResponse({
            "success": True,
            "message": "Profile updated successfully",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "phone": user.phone
            }
        })

    except (ValueError, TypeError):
        return JsonResponse({
            "success": False,
            "message": "Invalid request data"
        }, status=400)

    except Exception:
        return JsonResponse({
            "success": False,
            "message": "Unable to update profile"
        }, status=500)


# =========================
# GET ALL USERS
# =========================

def get_users(request):

    if request.method == "GET":

        users = User.objects.all().order_by("-id")

        user_list = []

        # Current month
        current_date = timezone.localtime(
            timezone.now()
        )

        current_year = current_date.year
        current_month = current_date.month

        for user in users:

            # Check whether user placed an order
            # during the current month
            order_count = Order.objects.filter(
                customer_email=user.email,
                created_at__year=current_year,
                created_at__month=current_month
            ).count()

            # Set user activity status
            if order_count > 0:
                user_status = "Active"
            else:
                user_status = "Inactive"

            user_list.append({

                "id":
                    user.id,

                "name":
                    user.name,

                "email":
                    user.email,

                "phone":
                    user.phone,

                "status":
                    user_status

            })

        return JsonResponse({

            "success": True,

            "users":
                user_list

        })

    return JsonResponse({

        "success": False,

        "message":
            "Only GET method is allowed"

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
    

# =========================
# GET ALL RESTAURANTS
# =========================

def get_restaurants(request):

    if request.method == "GET":

        # Customers can request visible restaurants only
        if request.GET.get("visible_only") == "true":
            restaurants = Restaurant.objects.filter(
                is_visible=True,
                is_temporarily_closed=False
            ).order_by("id")
        else:
            # Admin can see all restaurants
            restaurants = Restaurant.objects.all().order_by("id")

        restaurant_list = []

        for restaurant in restaurants:

                # Generate a sample number if missing.
                # This is demo data, not a real FSSAI license.
            
            if not restaurant.fssai_number:
                restaurant.fssai_number = "".join(
                    random.choices("123456789", k=14)
                )
                restaurant.fssai_is_demo = True
                restaurant.save(
                    update_fields=[
                        "fssai_number",
                        "fssai_is_demo"
                    ]
                )


            restaurant_list.append({
                "id": restaurant.id,
                "name": restaurant.name,
                "image": restaurant.image,
                "cuisine": restaurant.cuisine,
                "rating": float(restaurant.rating),
                "location": restaurant.location,
                "description": restaurant.description,
                "is_visible": restaurant.is_visible,
                "can_add_food_items": restaurant.can_add_food_items,
                # Restaurant contact and timings
                "email": restaurant.email or "",
                "phone": restaurant.phone or "",

                "opening_time": (
                    restaurant.opening_time.strftime("%H:%M")
                    if hasattr(restaurant.opening_time, "strftime")
                    else str(restaurant.opening_time or "")
                ),

                "closing_time": (
                    restaurant.closing_time.strftime("%H:%M")
                    if hasattr(restaurant.closing_time, "strftime")
                    else str(restaurant.closing_time or "")
                ),

                # Sample FSSAI details
                "fssai_number": restaurant.fssai_number,
                "fssai_license_type": restaurant.fssai_license_type,
                "fssai_valid_from": (
                    restaurant.fssai_valid_from.isoformat()
                    if restaurant.fssai_valid_from else None
                ),
                "fssai_valid_until": (
                    restaurant.fssai_valid_until.isoformat()
                    if restaurant.fssai_valid_until else None
                ),
                
                "fssai_is_demo": restaurant.fssai_is_demo,

                "email": restaurant.email,

            })

        return JsonResponse({
            "success": True,
            "restaurants": restaurant_list
        })

    return JsonResponse({
        "success": False,
        "message": "Only GET method is allowed"
    })

# =========================
# UPDATE RESTAURANT VISIBILITY
# =========================

@csrf_exempt
def update_restaurant_visibility(request):

    if request.method != "POST":
        return JsonResponse({
            "success": False,
            "message": "Only POST method is allowed"
        }, status=405)

    try:
        data = json.loads(request.body)

        restaurant_id = data.get("restaurant_id")
        is_visible = data.get("is_visible")

        if not isinstance(is_visible, bool):
            return JsonResponse({
                "success": False,
                "message": "Invalid visibility value"
            }, status=400)

        restaurant = Restaurant.objects.filter(
            id=restaurant_id
        ).first()

        if not restaurant:
            return JsonResponse({
                "success": False,
                "message": "Restaurant not found"
            }, status=404)

        restaurant.is_visible = is_visible
        restaurant.save(update_fields=["is_visible"])

        return JsonResponse({
            "success": True,
            "message": "Restaurant visibility updated",
            "is_visible": restaurant.is_visible
        })

    except (json.JSONDecodeError, TypeError, ValueError):
        return JsonResponse({
            "success": False,
            "message": "Invalid request data"
        }, status=400)

    except Exception as e:
        print("UPDATE VISIBILITY ERROR:", str(e), flush=True)

        return JsonResponse({
            "success": False,
            "message": "Unable to update restaurant visibility"
        }, status=500)
    # =========================
# ADD RESTAURANT - ADMIN
# =========================

@csrf_exempt
def add_restaurant(request):

    if request.method != "POST":

        return JsonResponse({
            "success": False,
            "message": "Only POST method is allowed"
        })

    try:

        data = json.loads(request.body)

        # =========================
        # GET FORM DATA
        # =========================

        name = data.get("name", "").strip()
        image = data.get("image", "").strip()
        cuisine = data.get("cuisine", "").strip()
        rating = data.get("rating")
        delivery_time = data.get(
            "delivery_time",
            ""
        ).strip()
        location = data.get(
            "location",
            ""
        ).strip()
        description = data.get(
            "description",
            ""
        ).strip()
        email = data.get(
            "email",
            ""
        ).strip()
        password = data.get(
            "password",
            ""
        )

        # =========================
        # REQUIRED FIELDS
        # =========================

        if not name:
            return JsonResponse({
                "success": False,
                "message": "Restaurant name is required"
            })

        if not cuisine:
            return JsonResponse({
                "success": False,
                "message": "Cuisine is required"
            })

        if not rating:
            return JsonResponse({
                "success": False,
                "message": "Rating is required"
            })

        if not location:
            return JsonResponse({
                "success": False,
                "message": "Location is required"
            })

        if not description:
            return JsonResponse({
                "success": False,
                "message": "Description is required"
            })

        if not email:
            return JsonResponse({
                "success": False,
                "message": "Restaurant email is required"
            })

        if not password:
            return JsonResponse({
                "success": False,
                "message": "Restaurant password is required"
            })

        # =========================
        # CHECK EMAIL
        # =========================

        if Restaurant.objects.filter(
            email=email
        ).exists():

            return JsonResponse({
                "success": False,
                "message":
                    "Restaurant email already exists"
            })

        # =========================
        # CREATE RESTAURANT
        # =========================

        restaurant = Restaurant.objects.create(

            name=name,

            image=image,

            cuisine=cuisine,

            rating=rating,

            delivery_time=delivery_time,

            location=location,

            description=description,

            email=email,

            password=password

        )

        # =========================
        # SUCCESS RESPONSE
        # =========================

        return JsonResponse({

            "success": True,

            "message":
                "Restaurant added successfully",

            "restaurant": {

                "id":
                    restaurant.id,

                "name":
                    restaurant.name,

                "image":
                    restaurant.image,

                "cuisine":
                    restaurant.cuisine,

                "rating":
                    float(restaurant.rating),

                "delivery_time":
                    restaurant.delivery_time,

                "location":
                    restaurant.location,

                "description":
                    restaurant.description,

                "email":
                    restaurant.email

            }

        })

    except Exception as e:

        print(
            "ADD RESTAURANT ERROR:",
            str(e),
            flush=True
        )

        return JsonResponse({

            "success": False,

            "message":
                str(e)

        })
    # =========================
# PLACE ORDER
# =========================

@csrf_exempt
def place_order(request):

    if request.method == "POST":

        try:

            data = json.loads(request.body)

            # =========================
            # CUSTOMER DETAILS
            # =========================

            customer_name = data.get("customer_name")
            customer_email = data.get("customer_email")

            # =========================
            # RESTAURANT
            # =========================

            restaurant_id = data.get("restaurant_id")

            # =========================
            # ORDER DETAILS
            # =========================

            items = data.get("items")
            total_amount = data.get("total_amount")

            # =========================
            # DELIVERY ADDRESS
            # =========================

            delivery_phone = data.get("delivery_phone", "")
            delivery_house = data.get("delivery_house", "")
            delivery_area = data.get("delivery_area", "")
            delivery_city = data.get("delivery_city", "")
            delivery_state = data.get("delivery_state", "")
            delivery_pincode = data.get("delivery_pincode", "")
            delivery_landmark = data.get("delivery_landmark", "")

            # =========================
            # CHECK CUSTOMER DETAILS
            # =========================

            if not customer_name or not customer_email:

                return JsonResponse({
                    "success": False,
                    "message": "Customer details are required"
                })

            # =========================
            # CHECK RESTAURANT
            # =========================

            if not restaurant_id:

                return JsonResponse({
                    "success": False,
                    "message": "Restaurant is required"
                })

            # =========================
            # CHECK ITEMS
            # =========================

            if not items:

                return JsonResponse({
                    "success": False,
                    "message": "Order items are required"
                })

            # =========================
            # FIND RESTAURANT
            # =========================

            restaurant = Restaurant.objects.filter(
                id=restaurant_id
            ).first()

            if not restaurant:

                return JsonResponse({
                    "success": False,
                    "message": "Restaurant not found"
                })

            # =========================
            # CHECK FOOD AVAILABILITY
            # =========================

            for item in items:

                item_name = item.get("name")

                if not item_name:

                    return JsonResponse({
                        "success": False,
                        "message": "Food item name is missing"
                    })

                # Find food item belonging to this restaurant
                food_item = FoodItem.objects.filter(
                    restaurant_id=restaurant_id,
                    name=item_name
                ).first()

                # Food item does not exist
                if not food_item:

                    return JsonResponse({
                        "success": False,
                        "message":
                            f"{item_name} is no longer available."
                    })

                # Food item is disabled
                if not food_item.is_available:

                    return JsonResponse({
                        "success": False,
                        "message":
                            f"{item_name} is currently unavailable. "
                            
                    })

            # =========================
            # CREATE ORDER
            # =========================

            order = Order.objects.create(

                customer_name=customer_name,

                customer_email=customer_email,

                restaurant=restaurant,

                items=json.dumps(items),

                total_amount=total_amount,

                # Delivery address
                delivery_phone=delivery_phone,

                delivery_house=delivery_house,

                delivery_area=delivery_area,

                delivery_city=delivery_city,

                delivery_state=delivery_state,

                delivery_pincode=delivery_pincode,

                delivery_landmark=delivery_landmark,

                status="pending",

                is_notified=False
            )

            # =========================
            # SUCCESS RESPONSE
            # =========================

            return JsonResponse({

                "success": True,

                "message": "Order placed successfully",

                "order": {

                    "id": order.id,

                    "restaurant": restaurant.name,

                    "status": order.status

                }

            })

        except Exception as e:

            print(
                "PLACE ORDER ERROR:",
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
# RESTAURANT NOTIFICATIONS
# =========================

@csrf_exempt
def restaurant_notifications(request):

    if request.method == "GET":

        try:

            restaurant_id = request.GET.get("restaurant_id")

            if not restaurant_id:

                return JsonResponse({
                    "success": False,
                    "message": "Restaurant ID is required"
                })


            # Get new orders for this restaurant
            orders = (
                Order.objects
                .filter(
                    restaurant_id=restaurant_id,
                    is_notified=False
                )
                .select_related("restaurant")
                .order_by("-created_at")
            )


            notification_list = []


            for order in orders:

                items = json.loads(order.items or "[]")

                item_list = []

                for item in items:

                    item_name = item.get("name", "Unknown Item")
                    quantity = item.get("quantity", 1)

                    item_list.append(
                        f"{item_name} x {quantity}"
                    )


                local_time = timezone.localtime(order.created_at)

                notification_list.append({

                    "id": order.id,

                    "customer_name":
                        order.customer_name,

                    "items":
                        item_list,

                    "total_amount":
                        str(order.total_amount),

                    "status":
                        order.status,

                    "created_at":
                        local_time.strftime(
                            "%Y-%m-%d %H:%M:%S"
                        )
                })

            return JsonResponse({

                "success": True,

                "count":
                    len(notification_list),

                "notifications":
                    notification_list

            })


        except Exception as e:

            print(
                "NOTIFICATION ERROR:",
                str(e),
                flush=True
            )

            return JsonResponse({

                "success": False,

                "message":
                    str(e)

            })


    return JsonResponse({

        "success": False,

        "message":
            "Only GET method is allowed"

    })
    # =========================
# MARK NOTIFICATIONS VIEWED
# =========================

@csrf_exempt
def mark_notifications_viewed(request):

    if request.method == "POST":

        try:

            data = json.loads(request.body)

            restaurant_id = data.get(
                "restaurant_id"
            )

            if not restaurant_id:

                return JsonResponse({
                    "success": False,
                    "message":
                        "Restaurant ID is required"
                })


            updated_count = Order.objects.filter(
                restaurant_id=restaurant_id,
                is_notified=False
            ).update(
                is_notified=True
            )


            return JsonResponse({

                "success": True,

                "message":
                    "Notifications marked as viewed",

                "updated_count":
                    updated_count

            })


        except Exception as e:

            print(
                "MARK NOTIFICATIONS VIEWED ERROR:",
                str(e),
                flush=True
            )

            return JsonResponse({

                "success": False,

                "message":
                    str(e)

            })


    return JsonResponse({

        "success": False,

        "message":
            "Only POST method is allowed"

    })
    # =========================
# RESTAURANT LOGIN
# =========================

@csrf_exempt
def restaurant_login(request):

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

            # Find restaurant
            restaurant = Restaurant.objects.filter(
                email=email,
                password=password
            ).first()

            if restaurant:

                return JsonResponse({

                    "success": True,

                    "message": "Restaurant login successful",

                    "restaurant": {

                        "id": restaurant.id,

                        "name": restaurant.name,

                        "email": restaurant.email

                    }

                })

            else:

                return JsonResponse({

                    "success": False,

                    "message": "Invalid restaurant email or password"

                })

        except Exception as e:

            print(
                "RESTAURANT LOGIN ERROR:",
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
# ADD FOOD ITEM
# =========================

@csrf_exempt
def add_food_item(request):

    if request.method == "POST":

        try:

            data = json.loads(request.body)

            restaurant_id = data.get("restaurant_id")
            name = data.get("name")
            description = data.get("description")
            price = data.get("price")
            image = data.get("image")

            if not restaurant_id:
                return JsonResponse({
                    "success": False,
                    "message": "Restaurant ID is required"
                })

            if not name:
                return JsonResponse({
                    "success": False,
                    "message": "Food name is required"
                })

            if not price:
                return JsonResponse({
                    "success": False,
                    "message": "Food price is required"
                })

            restaurant = Restaurant.objects.filter(
                id=restaurant_id
            ).first()

            if not restaurant:
                return JsonResponse({
                    "success": False,
                    "message": "Restaurant not found"
                })
            if not restaurant.can_add_food_items:
                return JsonResponse({
                    "success": False,
                    "message": "Admin has disabled adding food items for this restaurant."
                }, status=403)

            food_item = FoodItem.objects.create(

                restaurant=restaurant,

                name=name,

                description=description or "",

                price=price,

                image=image or "",

                is_available=True

            )

            return JsonResponse({

                "success": True,

                "message": "Food item added successfully",

                "food_item": {

                    "id": food_item.id,

                    "restaurant_id":
                        restaurant.id,

                    "name":
                        food_item.name,

                    "description":
                        food_item.description,

                    "price":
                        str(food_item.price),

                    "image":
                        food_item.image,

                    "is_available":
                        food_item.is_available

                }

            })

        except Exception as e:

            print(
                "ADD FOOD ITEM ERROR:",
                str(e),
                flush=True
            )

            return JsonResponse({

                "success": False,

                "messae": str(e)

            })

    return JsonResponse({

        "success": False,

        "message": "Only POST method is allowed"

    })
    # =========================
# GET ALL RESTAURANT ORDERS
# =========================

@csrf_exempt
def get_all_orders(request):

    if request.method == "GET":

        try:

            restaurant_id = request.GET.get("restaurant_id")

            if not restaurant_id:

                return JsonResponse({
                    "success": False,
                    "message": "Restaurant ID is required"
                })

            # Get ALL orders for this restaurant
            orders = Order.objects.filter(
                restaurant_id=restaurant_id
            ).order_by("-created_at")

            order_list = []

            for order in orders:

                items = json.loads(order.items)

                item_list = []

                for item in items:

                    item_name = item.get(
                        "name",
                        "Unknown Item"
                    )

                    quantity = item.get(
                        "quantity",
                        1
                    )

                    item_list.append({
                        "name": item_name,
                        "quantity": quantity
                    })

                local_time = timezone.localtime(
                    order.created_at
                )

                order_list.append({

                    "id": order.id,

                    "customer_name":
                        order.customer_name,

                    "customer_email":
                        order.customer_email,

                    "items":
                        item_list,

                    "total_amount":
                        str(order.total_amount),

                    "status":
                        order.status,

                    "is_notified":
                        order.is_notified,

                    "created_at":
                        local_time.strftime(
                            "%Y-%m-%d %H:%M:%S"
                        )
                })

            return JsonResponse({

                "success": True,

                "count":
                    len(order_list),

                "orders":
                    order_list

            })

        except Exception as e:

            print(
                "GET ALL ORDERS ERROR:",
                str(e),
                flush=True
            )

            return JsonResponse({

                "success": False,

                "message":
                    str(e)

            })

    return JsonResponse({

        "success": False,

        "message":
            "Only GET method is allowed"

    })
# =========================
# GET CUSTOMER ORDERS
# =========================

@csrf_exempt
def get_customer_orders(request):

    if request.method == "GET":

        try:

            customer_email = request.GET.get("email")

            if not customer_email:

                return JsonResponse({
                    "success": False,
                    "message": "Customer email is required"
                })

            # Get customer orders and restaurant together
            orders = (
                Order.objects
                .filter(customer_email=customer_email)
                .select_related("restaurant")
                .order_by("-created_at")
            )

            order_list = []

            for order in orders:

                # =========================
                # GET ORDER ITEMS
                # =========================

                items = json.loads(order.items or "[]")

                item_list = []

                for item in items:

                    item_list.append({

                        "name":
                            item.get(
                                "name",
                                "Unknown Item"
                            ),

                        "quantity":
                            item.get(
                                "quantity",
                                1
                            ),

                        "price":
                            item.get(
                                "price",
                                0
                            )

                    })

                # =========================
                # GET RESTAURANT NAME
                # =========================

                restaurant_name = "Restaurant"

                if order.restaurant_id and order.restaurant:

                    restaurant_name = order.restaurant.name

                # =========================
                # LOCAL TIME
                # =========================

                local_time = timezone.localtime(
                    order.created_at
                )

                # =========================
                # ADD ORDER
                # =========================

                order_list.append({

                    "id":
                        order.id,

                    "customer_name":
                        order.customer_name,

                    "customer_email":
                        order.customer_email,

                    "restaurant_id":
                        order.restaurant_id,

                    "restaurant":
                        restaurant_name,

                    "items":
                        item_list,

                    "total_amount":
                        str(order.total_amount),

                    "status":
                        order.status,

                    "created_at":
                        local_time.strftime(
                            "%Y-%m-%d %H:%M:%S"
                        )

                })

            return JsonResponse({

                "success": True,

                "count":
                    len(order_list),

                "orders":
                    order_list

            })

        except Exception as e:

            print(
                "GET CUSTOMER ORDERS ERROR:",
                str(e),
                flush=True
            )

            return JsonResponse({

                "success": False,

                "message":
                    str(e)

            })

    return JsonResponse({

        "success": False,

        "message":
            "Only GET method is allowed"

    })
    # =========================
# CANCEL CUSTOMER ORDER
# =========================

@csrf_exempt
def cancel_customer_order(request):

    if request.method != "POST":
        return JsonResponse({
            "success": False,
            "message": "Only POST method is allowed"
        }, status=405)

    try:
        data = json.loads(request.body)

        order_id = data.get("order_id")
        customer_email = data.get("customer_email")

        if not order_id or not customer_email:
            return JsonResponse({
                "success": False,
                "message": "Order ID and customer email are required"
            }, status=400)

        # Confirm that this order belongs to the customer.
        try:
            order = Order.objects.get(
                id=order_id,
                customer_email=customer_email
            )
        except Order.DoesNotExist:
            return JsonResponse({
                "success": False,
                "message": "Order not found for this customer"
            }, status=404)

        # Cancellation is allowed only while pending.
        if order.status.lower() != "pending":
            return JsonResponse({
                "success": False,
                "message": "Only pending orders can be cancelled"
            }, status=400)

        order.status = "cancelled"
        order.save(update_fields=["status"])

        return JsonResponse({
            "success": True,
            "message": "Order cancelled successfully",
            "order_id": order.id,
            "status": order.status
        })

    except json.JSONDecodeError:
        return JsonResponse({
            "success": False,
            "message": "Invalid request data"
        }, status=400)

    except Exception as e:
        print("CANCEL CUSTOMER ORDER ERROR:", str(e), flush=True)

        return JsonResponse({
            "success": False,
            "message": "Unable to cancel order"
        }, status=500)

    # =========================
# GET RESTAURANT FOOD ITEMS
# =========================

def get_restaurant_food_items(request):

    if request.method == "GET":

        try:

            restaurant_id = request.GET.get("restaurant_id")

            if not restaurant_id:

                return JsonResponse({
                    "success": False,
                    "message": "Restaurant ID is required"
                })

            food_items = FoodItem.objects.filter(
                restaurant_id=restaurant_id
            ).order_by("-id")

            food_list = []

            for food in food_items:

                food_list.append({

                    "id": food.id,

                    "restaurant_id":
                        food.restaurant_id,

                    "name":
                        food.name,

                    "description":
                        food.description,

                    "price":
                        str(food.price),

                    "image":
                        food.image,

                    "is_available":
                        food.is_available

                })

            return JsonResponse({

                "success": True,

                "food_items":
                    food_list

            })

        except Exception as e:

            print(
                "GET RESTAURANT FOOD ITEMS ERROR:",
                str(e),
                flush=True
            )

            return JsonResponse({

                "success": False,

                "message":
                    str(e)

            })

    return JsonResponse({

        "success": False,

        "message":
            "Only GET method is allowed"

    })
    # =========================
# DELETE RESTAURANT FOOD ITEM
# =========================

@csrf_exempt
def delete_food_item(request):

    if request.method == "DELETE":

        try:

            data = json.loads(request.body)

            food_id = data.get("food_id")
            restaurant_id = data.get("restaurant_id")

            if not food_id:
                return JsonResponse({
                    "success": False,
                    "message": "Food ID is required"
                })

            if not restaurant_id:
                return JsonResponse({
                    "success": False,
                    "message": "Restaurant ID is required"
                })

            food_item = FoodItem.objects.filter(
                id=food_id,
                restaurant_id=restaurant_id
            ).first()

            if not food_item:
                return JsonResponse({
                    "success": False,
                    "message": "Food item not found"
                })

            food_item.delete()

            return JsonResponse({
                "success": True,
                "message": "Food item deleted successfully"
            })

        except Exception as e:

            print(
                "DELETE FOOD ITEM ERROR:",
                str(e),
                flush=True
            )

            return JsonResponse({
                "success": False,
                "message": str(e)
            })

    return JsonResponse({
        "success": False,
        "message": "Only DELETE method is allowed"
    })
    # =========================
# UPDATE RESTAURANT FOOD ITEM
# =========================

@csrf_exempt
def update_food_item(request):

    if request.method != "POST":
        return JsonResponse({
            "success": False,
            "message": "Only POST method is allowed"
        })

    try:

        data = json.loads(request.body)

        food_id = data.get("food_id")
        restaurant_id = data.get("restaurant_id")

        # =========================
        # CHECK FOOD ID
        # =========================

        if not food_id:
            return JsonResponse({
                "success": False,
                "message": "Food ID is required"
            })

        # =========================
        # CHECK RESTAURANT ID
        # =========================

        if not restaurant_id:
            return JsonResponse({
                "success": False,
                "message": "Restaurant ID is required"
            })

        # =========================
        # FIND FOOD ITEM
        # =========================

        food_item = FoodItem.objects.filter(
            id=food_id,
            restaurant_id=restaurant_id
        ).first()

        if not food_item:
            return JsonResponse({
                "success": False,
                "message": "Food item not found"
            })

        # ==================================================
        # AVAILABILITY ONLY
        # ==================================================

        if "is_available" in data and "name" not in data:

            food_item.is_available = bool(
                data.get("is_available")
            )

            food_item.save(
                update_fields=["is_available"]
            )

            return JsonResponse({
                "success": True,
                "message": "Food availability updated successfully",
                "food_item": {
                    "id": food_item.id,
                    "is_available": food_item.is_available
                }
            })

        # ==================================================
        # FULL FOOD ITEM UPDATE
        # ==================================================

        name = data.get("name")
        description = data.get("description")
        price = data.get("price")
        image = data.get("image")

        if not name:
            return JsonResponse({
                "success": False,
                "message": "Food name is required"
            })

        if not price:
            return JsonResponse({
                "success": False,
                "message": "Food price is required"
            })

        food_item.name = name
        food_item.description = description or ""
        food_item.price = price
        food_item.image = image or ""

        if "is_available" in data:
            food_item.is_available = bool(
                data.get("is_available")
            )

        food_item.save()

        return JsonResponse({
            "success": True,
            "message": "Food item updated successfully",
            "food_item": {
                "id": food_item.id,
                "restaurant_id": food_item.restaurant_id,
                "name": food_item.name,
                "description": food_item.description,
                "price": str(food_item.price),
                "image": food_item.image,
                "is_available": food_item.is_available
            }
        })

    except Exception as e:

        print(
            "UPDATE FOOD ITEM ERROR:",
            str(e),
            flush=True
        )

        return JsonResponse({
            "success": False,
            "message": str(e)
        })

# =========================
# UPDATE ORDER STATUS
# =========================

@csrf_exempt
def update_order_status(request):

    if request.method == "POST":

        try:

            data = json.loads(request.body)

            order_id = data.get("order_id")
            restaurant_id = data.get("restaurant_id")
            status = data.get("status")
            rejection_reason = data.get("rejection_reason", "")

            # =========================
            # CHECK REQUIRED FIELDS
            # =========================

            if not order_id:
                return JsonResponse({
                    "success": False,
                    "message": "Order ID is required"
                })

            if not restaurant_id:
                return JsonResponse({
                    "success": False,
                    "message": "Restaurant ID is required"
                })

            if not status:
                return JsonResponse({
                    "success": False,
                    "message": "Order status is required"
                })

            # =========================
            # ALLOWED STATUS
            # =========================

            allowed_statuses = [
                "accepted",
                "rejected",
                "preparing",
                "ready",
                "out for delivery",
                "delivered"
            ]

            if status not in allowed_statuses:

                return JsonResponse({
                    "success": False,
                    "message": "Invalid order status"
                })

            # =========================
            # FIND ORDER
            # =========================

            order = Order.objects.filter(
                id=order_id,
                restaurant_id=restaurant_id
            ).first()

            if not order:

                return JsonResponse({
                    "success": False,
                    "message": "Order not found"
                })

            # =========================
            # STATUS FLOW
            # =========================

            current_status = order.status

            status_flow = {
                "pending": ["accepted", "rejected"],
                "accepted": ["preparing"],
                "preparing": ["ready"],
                "ready": ["out for delivery"],
                "out for delivery": ["delivered"]
            }

            # =========================
            # CHECK STATUS CHANGE
            # =========================

            if status not in status_flow.get(
                current_status, []
            ):

                return JsonResponse({
                    "success": False,
                    "message":
                        f"Cannot change order from "
                        f"{current_status} to {status}"
                })

            # =========================
            # REJECTION REASON
            # =========================

            if status == "rejected" and not rejection_reason:

                return JsonResponse({
                    "success": False,
                    "message":
                        "Rejection reason is required"
                })

            # =========================
            # UPDATE STATUS
            # =========================

            order.status = status
            order.save()

            # =========================
            # ACCEPTED EMAIL
            # =========================

            if status == "accepted":

                send_mail(

                    subject="Sai Tasty Foods - Order Confirmed",

                    message=f"""
Hello {order.customer_name},

Your order #{order.id} has been accepted by
{order.restaurant.name}.

Your food is now preparing.

Order Status:
ACCEPTED

Restaurant:
{order.restaurant.name}

Total Amount:
₹{order.total_amount}

We will keep you updated about your order.

Thank you for ordering from Sai Tasty Foods.

Regards,
Sai Tasty Foods
""",

                    from_email=None,

                    recipient_list=[
                        order.customer_email
                    ],

                    fail_silently=False
                )

            # =========================
            # REJECTED EMAIL
            # =========================

            elif status == "rejected":

                send_mail(

                    subject="Sai Tasty Foods - Order Rejected",

                    message=f"""
Hello {order.customer_name},

We are sorry to inform you that your
order #{order.id} could not be accepted.

Restaurant:
{order.restaurant.name}

Order Status:
REJECTED

Reason:
{rejection_reason}

Please try ordering another food item or
place a new order later.

Regards,
Sai Tasty Foods
""",

                    from_email=None,

                    recipient_list=[
                        order.customer_email
                    ],

                    fail_silently=False
                )

            # =========================
            # SUCCESS RESPONSE
            # =========================

            return JsonResponse({

                "success": True,

                "message":
                    f"Order {status} successfully",

                "order": {

                    "id":
                        order.id,

                    "status":
                        order.status

                }

            })

        except Exception as e:

            print(
                "UPDATE ORDER STATUS ERROR:",
                str(e),
                flush=True
            )

            return JsonResponse({

                "success": False,

                "message":
                    str(e)

            })

    return JsonResponse({

        "success": False,

        "message":
            "Only POST method is allowed"

    })
    # =========================
# GET ALL FOOD ITEMS
# =========================

def get_all_food_items(request):

    if request.method == "GET":

        try:

            food_items = FoodItem.objects.all().order_by("-id")

            food_list = []

            for food in food_items:

                food_list.append({

                    "id": food.id,

                    "restaurant_id":
                        food.restaurant_id,

                    "restaurant_name":
                        food.restaurant.name,

                    "name":
                        food.name,

                    "description":
                        food.description,

                    "price":
                        str(food.price),

                    "image":
                        food.image,

                    "is_available":
                        food.is_available

                })

            return JsonResponse({

                "success": True,

                "food_items":
                    food_list

            })

        except Exception as e:

            print(
                "GET ALL FOOD ITEMS ERROR:",
                str(e),
                flush=True
            )

            return JsonResponse({

                "success": False,

                "message":
                    str(e)

            })

    return JsonResponse({

        "success": False,

        "message":
            "Only GET method is allowed"

    })
    # =========================
# ADMIN LOGIN
# =========================
@csrf_exempt
def admin_login(request):

    if request.method != "POST":
        return JsonResponse({
            "success": False,
            "message": "Only POST method is allowed"
        })

    try:

        data = json.loads(request.body)

        email = data.get("email", "").strip()
        password = data.get("password", "")

        if not email or not password:
            return JsonResponse({
                "success": False,
                "message": "Email and password are required"
            })

        admin = Admin.objects.filter(
            email=email
        ).first()

        if not admin:
            return JsonResponse({
                "success": False,
                "message": "Invalid admin email or password"
            })

        if admin.password != password:
            return JsonResponse({
                "success": False,
                "message": "Invalid admin email or password"
            })

        token = signing.dumps(
            {"admin_id": admin.id},
            salt="admin-orders"
        )

        return JsonResponse({
            "success": True,
            "message": "Admin login successful",
            "admin": {
                "id": admin.id,
                "name": admin.name,
                "email": admin.email
            },
            "token": token
        })

    except Exception as e:

        print(
            "ADMIN LOGIN ERROR:",
            str(e),
            flush=True
        )

        return JsonResponse({
            "success": False,
            "message": str(e)
        })
# =========================
# GET ALL ORDERS - ADMIN
# =========================

@csrf_exempt
def admin_all_orders(request):

    if request.method != "POST":
        return JsonResponse({
            "success": False,
            "message": "Only POST method is allowed"
        }, status=405)

    try:
        data = json.loads(request.body)
        token = data.get("token", "")

        if not token:
            return JsonResponse({
                "success": False,
                "message": "Admin authentication is required"
            }, status=401)

        # Verify the signed admin token.
        # Tokens expire after 1 hour.
        from django.core import signing

        try:
            token_data = signing.loads(
                token,
                salt="admin-orders",
                max_age=3600
            )
        except signing.BadSignature:
            return JsonResponse({
                "success": False,
                "message": "Invalid or expired admin token"
            }, status=401)

        admin = Admin.objects.filter(
            id=token_data.get("admin_id")
        ).first()

        if not admin:
            return JsonResponse({
                "success": False,
                "message": "Admin account not found"
            }, status=401)

        orders = Order.objects.select_related(
            "restaurant"
        ).order_by("-created_at")

        order_list = []

        for order in orders:
            try:
                items = json.loads(order.items or "[]")
            except (json.JSONDecodeError, TypeError):
                items = []

            local_time = timezone.localtime(
                order.created_at
            )

            order_list.append({
                "id": order.id,
                "customer_name": order.customer_name,
                "customer_email": order.customer_email,
                "restaurant_id": order.restaurant_id,
                "restaurant_name": order.restaurant.name,
                "items": items,
                "total_amount": str(order.total_amount),
                "status": order.status,
                "created_at": local_time.strftime(
                    "%Y-%m-%d %H:%M:%S"
                )
            })

        return JsonResponse({
            "success": True,
            "count": len(order_list),
            "orders": order_list
        })

    except Exception as e:
        print(
            "ADMIN ALL ORDERS ERROR:",
            str(e),
            flush=True
        )

        return JsonResponse({
            "success": False,
            "message": "Unable to fetch admin orders"
        }, status=500)
# =========================
# DELETE RESTAURANT - ADMIN
# =========================

@csrf_exempt
def delete_restaurant(request, restaurant_id):

    if request.method != "DELETE":
        return JsonResponse({
            "success": False,
            "message": "Only DELETE method is allowed"
        }, status=405)

    try:
        # Find the selected restaurant
        restaurant = Restaurant.objects.filter(
            id=restaurant_id
        ).first()

        if not restaurant:
            return JsonResponse({
                "success": False,
                "message": "Restaurant not found"
            }, status=404)

        # Preserve customer order history
        if Order.objects.filter(
            restaurant_id=restaurant_id
        ).exists():
            return JsonResponse({
                "success": False,
                "message": (
                    "This restaurant has existing orders "
                    "and cannot be deleted."
                )
            }, status=409)

        restaurant_name = restaurant.name

        # Delete the restaurant.
        # Related food items may also be deleted according
        # to the on_delete setting in your models.
        restaurant.delete()

        return JsonResponse({
            "success": True,
            "message": (
                f"{restaurant_name} deleted successfully."
            )
        })

    except Exception as e:
        print("DELETE RESTAURANT ERROR:", str(e), flush=True)

        return JsonResponse({
            "success": False,
            "message": "Unable to delete restaurant."
        }, status=500)

@csrf_exempt
def update_restaurant_food_permission(request):
    if request.method != "POST":
        return JsonResponse({
            "success": False,
            "message": "Only POST requests are allowed."
        }, status=405)

    try:
        data = json.loads(request.body)
        restaurant_id = data.get("restaurant_id")
        can_add_food_items = data.get("can_add_food_items")

        if restaurant_id is None or not isinstance(can_add_food_items, bool):
            return JsonResponse({
                "success": False,
                "message": "Restaurant ID and a valid permission are required."
            }, status=400)

        restaurant = Restaurant.objects.get(id=restaurant_id)
        restaurant.can_add_food_items = can_add_food_items
        restaurant.save(update_fields=["can_add_food_items"])

        return JsonResponse({
            "success": True,
            "message": "Food-item permission updated.",
            "restaurant_id": restaurant.id,
            "can_add_food_items": restaurant.can_add_food_items
        })

    except Restaurant.DoesNotExist:
        return JsonResponse({
            "success": False,
            "message": "Restaurant not found."
        }, status=404)

    except (json.JSONDecodeError, TypeError, ValueError):
        return JsonResponse({
            "success": False,
            "message": "Invalid request data."
        }, status=400)

# =========================
# UPDATE RESTAURANT PROFILE
# =========================

@csrf_exempt
def update_restaurant_profile(request):
    if request.method != "POST":
        return JsonResponse({
            "success": False,
            "message": "Only POST method is allowed."
        }, status=405)

    try:
        if request.content_type and request.content_type.startswith("multipart/form-data"):
            data = request.POST
        else:
            data = json.loads(request.body)

        restaurant_id = data.get("restaurant_id")

        if not restaurant_id:
            return JsonResponse({
                "success": False,
                "message": "Restaurant ID is required."
            }, status=400)

        try:
            restaurant = Restaurant.objects.get(id=restaurant_id)
        except Restaurant.DoesNotExist:
            return JsonResponse({
                "success": False,
                "message": "Restaurant not found."
            }, status=404)

        
        # Update restaurant name only when a non-empty name is provided
        if "name" in data:
            new_name = data.get("name", "").strip()

            if new_name:
                restaurant.name = new_name

        # Upload a new restaurant image when a file is selected
        uploaded_image = request.FILES.get("image")

        if uploaded_image:
            extension = os.path.splitext(uploaded_image.name)[1].lower()

            allowed_extensions = [".jpg", ".jpeg", ".png", ".webp"]

            if extension not in allowed_extensions:
                return JsonResponse({
                    "success": False,
                    "message": "Please upload a JPG, JPEG, PNG, or WebP image."
                }, status=400)

            
            # Generate a unique filename for Blob storage
            filename = f"{uuid.uuid4().hex}{extension}"

            # Upload the image to Vercel Blob
            token = os.getenv("BLOB_READ_WRITE_TOKEN")
            blob_client = BlobClient(token=token)
            uploaded_blob = blob_client.put(
                f"restaurants/{filename}",
                uploaded_image.read(),
                access="public",
                content_type=uploaded_image.content_type or "image/jpeg",
                add_random_suffix=True
            )

            # Save the online image URL in the database
            restaurant.image = uploaded_blob.url


        elif "image" in data and data.get("image", "").strip():
            # Preserve existing URL-based image updates
            restaurant.image = data["image"].strip()

        if "cuisine" in data:
            restaurant.cuisine = data["cuisine"].strip()

        if "location" in data:
            restaurant.location = data["location"].strip()

        if "description" in data:
            restaurant.description = data["description"].strip()

        if "email" in data:
            restaurant.email = data["email"].strip()

        if "phone" in data:
            restaurant.phone = data["phone"].strip()

        # Update opening and closing times
        if "opening_time" in data:
            value = data["opening_time"]
            restaurant.opening_time = value or None

        if "closing_time" in data:
            value = data["closing_time"]
            restaurant.closing_time = value or None
        # Update temporary closure status
        if "is_temporarily_closed" in data:
            restaurant.is_temporarily_closed = (
                data.get("is_temporarily_closed") == "true"
            )
        # Update FSSAI details
        if "fssai_number" in data:
            restaurant.fssai_number = data["fssai_number"].strip()

        if "fssai_license_type" in data:
            restaurant.fssai_license_type = data["fssai_license_type"].strip()

        if "fssai_valid_from" in data:
            value = data["fssai_valid_from"]
            restaurant.fssai_valid_from = value or None

        if "fssai_valid_until" in data:
            value = data["fssai_valid_until"]
            restaurant.fssai_valid_until = value or None

        if "fssai_is_demo" in data:
            restaurant.fssai_is_demo = data["fssai_is_demo"]

        restaurant.save()

        return JsonResponse({
            "success": True,
            "message": "Restaurant profile updated successfully.",
            "restaurant": {
                "id": restaurant.id,
                "name": restaurant.name,
                "image": restaurant.image,
                "cuisine": restaurant.cuisine,
                "location": restaurant.location,
                "description": restaurant.description,
                "email": restaurant.email,
                "phone": restaurant.phone,
                "opening_time": (
                    restaurant.opening_time.strftime("%H:%M")
                    if hasattr(restaurant.opening_time, "strftime")
                    else str(restaurant.opening_time or "")
                ),
                "closing_time": (
                    restaurant.closing_time.strftime("%H:%M")
                    if hasattr(restaurant.closing_time, "strftime")
                    else str(restaurant.closing_time or "")
                ),
                "fssai_number": restaurant.fssai_number,
                "fssai_license_type": restaurant.fssai_license_type,
                "fssai_valid_from": str(restaurant.fssai_valid_from) if restaurant.fssai_valid_from else "",
                "fssai_valid_until": str(restaurant.fssai_valid_until) if restaurant.fssai_valid_until else "",
                "fssai_is_demo": restaurant.fssai_is_demo
            }
        })

    except Exception as e:
        return JsonResponse({
            "success": False,
            "message": str(e)
        }, status=400)

