
from django.urls import path

from .views import register_user, login_user, get_users


urlpatterns = [

    path("register/", register_user, name="register"),

    path("login/", login_user, name="login"),

    path("users/", get_users, name="get_users"),

]

