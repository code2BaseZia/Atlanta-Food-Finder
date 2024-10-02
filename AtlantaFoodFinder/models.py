from django.contrib.auth.models import User
from django.db import models


class Restaurant(models.Model):
    place_id = models.CharField(max_length=512, primary_key=True)


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    favorites = models.ManyToManyField(Restaurant)