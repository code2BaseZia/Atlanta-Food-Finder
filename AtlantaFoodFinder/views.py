from django.shortcuts import render

# Create your views here.
from .models import Restaurant
from django.conf import settings

def map_view(request):
    return render(request, 'map.html', {'google_maps_api_key': settings.GOOGLE_MAPS_API_KEY})