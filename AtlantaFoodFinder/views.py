from django.http import HttpResponse
from django.shortcuts import render

# Create your views here.
from .models import Restaurant
from django.conf import settings


def index_view(request):
    return render(request, 'AtlantaFoodFinder/index.html')


def login_view(request):
    return render(request, 'AtlantaFoodFinder/login.html')


def signup_view(request):
    return render(request, 'AtlantaFoodFinder/signup.html')


def map_view(request):
    return render(request, 'AtlantaFoodFinder/map.html', {'google_maps_api_key': settings.GOOGLE_MAPS_API_KEY})


def construction_view(request):
    return HttpResponse('This page is under construction', status=503)
