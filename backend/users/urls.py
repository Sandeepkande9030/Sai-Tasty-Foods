from django.urls import path

from .views import (
    register_user,
    login_user,
    get_users,
    verify_otp,
    resend_otp,
    forgot_password,
    reset_password,
    get_restaurants,
    place_order,
    restaurant_notifications,
    restaurant_login,
    add_food_item
)


urlpatterns = [

    path("register/", register_user, name="register"),

    path("login/", login_user, name="login"),

    path("users/", get_users, name="get_users"),

    # OTP verification
    path("verify-otp/", verify_otp, name="verify_otp"),
    # Resend OTP
    path("resend-otp/", resend_otp, name="resend_otp"),
    # Forgot password
    path("forgot-password/", forgot_password, name="forgot_password"),
    # Reset password
    path("reset-password/", reset_password, name="reset_password"),
    path("restaurants/", get_restaurants, name="get_restaurants"),
    path("place-order/", place_order, name="place_order"),
    path(
    "restaurant-notifications/",
    restaurant_notifications,
    name="restaurant_notifications"
    ),
    path(
        "restaurant-login/",
        restaurant_login,
        name="restaurant_login"
    ),
    path(
        "add-food-item/",
        add_food_item,
        name="add_food_item"
    ),


]