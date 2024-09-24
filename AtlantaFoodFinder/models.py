from django.db import models

# Create your models here.
class Restaurant(models.Model):
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=200)
    latitude = models.FloatField()
    longitude = models.FloatField()

class Favorite(models.Model):
    name = models.CharField(max_length=100)
    location = (models.DecimalField(max_digits=8, decimal_places=6),
                models.DecimalField(max_digits=8, decimal_places=6))
    def __str__(self):
        return self.name
