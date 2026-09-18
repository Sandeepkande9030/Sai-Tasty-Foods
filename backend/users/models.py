from django.db import models


class User(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)

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

    def __str__(self):
        return self.name