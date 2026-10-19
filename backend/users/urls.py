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
    get_restaurant_food_items,
    place_order,
    restaurant_notifications,
    restaurant_login,
    add_food_item,
    get_all_orders,
    mark_notifications_viewed,
    get_customer_orders,
    delete_food_item,
    update_food_item,
    update_order_status,
    get_all_food_items,
    admin_login,
    admin_all_orders,
    add_restaurant,
    delete_restaurant,
    update_restaurant_visibility,
    update_restaurant_food_permission,
    update_restaurant_profile,
    update_user_profile,
    cancel_customer_order,
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
    "customer-orders/",
    get_customer_orders,
    name="get_customer_orders"
    ),
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
    path(
    "restaurant-food-items/",
    get_restaurant_food_items,
    name="get_restaurant_food_items"
    ),
    path(
    "all-orders/",
    get_all_orders,
    name="get_all_orders"
    ),
    path(
    "mark-notifications-viewed/",
    mark_notifications_viewed,
    name="mark_notifications_viewed"
    ),
    path(
    "delete-food-item/",
    delete_food_item,
    name="delete_food_item"
    ),
    path(
    "update-food-item/",
    update_food_item,
    name="update_food_item"
    ),
    path(
    "update-order-status/",
    update_order_status,
    name="update_order_status"
    ),
    path(
    "all-food-items/",
    get_all_food_items,
    name="get_all_food_items"
    ),
    path(
    "admin-login/",
    admin_login,
    name="admin_login"
    ),
    path(
    "admin-all-orders/",
    admin_all_orders,
    name="admin_all_orders"
    ),
    path(
    "add-restaurant/",
    add_restaurant,
    name="add_restaurant"
    ),
    path(
    "delete-restaurant/<int:restaurant_id>/",
    delete_restaurant,
    name="delete_restaurant"
    ),
    path(
    "update-restaurant-visibility/",
    update_restaurant_visibility,
    name="update_restaurant_visibility"
    ),
    path(
    "update-restaurant-food-permission/",
    update_restaurant_food_permission,
    name="update_restaurant_food_permission"
    ),
    path(
    "update-restaurant-profile/",
    update_restaurant_profile,
    name="update_restaurant_profile"
    ),
    path(
    "update-user-profile/",
    update_user_profile,
    name="update_user_profile"
    ),
    path(
    "cancel-customer-order/",
    cancel_customer_order,
    name="cancel_customer_order"
    ),
    
]