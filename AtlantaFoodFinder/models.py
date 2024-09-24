from django.db import models

class Favorite(models.Model):
    name = models.CharField(max_length=100)
    location = (models.DecimalField(max_digits=8, decimal_places=6),
                models.DecimalField(max_digits=8, decimal_places=6))
    def __str__(self):
        return self.name
