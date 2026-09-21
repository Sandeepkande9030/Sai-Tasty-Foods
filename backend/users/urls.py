from django.urls import path

from .views import (
    register_user,
    login_user,
    get_users,
    verify_otp,
    resend_otp
)


urlpatterns = [

    path("register/", register_user, name="register"),

    path("login/", login_user, name="login"),

    path("users/", get_users, name="get_users"),

    # OTP verification
    path("verify-otp/", verify_otp, name="verify_otp"),
    # Resend OTP
    path("resend-otp/", resend_otp, name="resend_otp"),

]