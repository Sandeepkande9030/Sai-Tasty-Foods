from django.db import models


# =========================
# USER MODEL
# =========================

class User(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)

    # Email verification
    is_verified = models.BooleanField(default=False)

    # OTP
    otp = models.CharField(max_length=6, blank=True, null=True)

    # OTP creation time
    otp_created_at = models.DateTimeField(
        blank=True,
        null=True
    )

    def __str__(self):
        return self.email


# =========================
# RESTAURANT MODEL
# =========================

class Restaurant(models.Model):

    name = models.CharField(max_length=150)

    image = models.CharField(max_length=500)

    cuisine = models.CharField(max_length=100)

    rating = models.DecimalField(
        max_digits=2,
        decimal_places=1
    )

    delivery_time = models.CharField(max_length=50)

    location = models.CharField(max_length=200)

    description = models.TextField()

    email = models.EmailField(
        unique=True,
        null=True,
        blank=True
    )

    password = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )

    def __str__(self):
        return self.name
# =========================
# ORDER MODEL
# =========================

class Order(models.Model):

    customer_name = models.CharField(max_length=100)

    customer_email = models.EmailField()

    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE
    )

    items = models.TextField()

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    status = models.CharField(
        max_length=50,
        default="Pending"
    )

    is_notified = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"Order #{self.id} - {self.restaurant.name}"
    # =========================
# FOOD ITEM MODEL
# =========================

class FoodItem(models.Model):

    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE
    )

    name = models.CharField(
        max_length=150
    )

    description = models.TextField(
        blank=True
    )

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    image = models.CharField(
        max_length=500,
        blank=True
    )

    is_available = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return self.name