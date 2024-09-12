from django.urls import path

from . import views

app_name = "atl_food_finder"

urlpatterns = [
    path('map/', views.map_view, name='map'),
]