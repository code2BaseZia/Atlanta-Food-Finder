from django.contrib.auth.views import LoginView
from django.shortcuts import render
from django.contrib.auth.forms import UserCreationForm
from django.urls import reverse_lazy
from django.views.generic import CreateView, TemplateView

from django.shortcuts import get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from .models import Restaurant

@login_required
@require_POST
def favorite_restaurant(request, restaurant_id):
    restaurant = get_object_or_404(Restaurant, id=restaurant_id)
    profile = request.user.profile

    if restaurant in profile.favorited_restaurants.all():
        # Unfavorite the restaurant
        profile.favorited_restaurants.remove(restaurant)
    else:
        # Favorite the restaurant
        profile.favorited_restaurants.add(restaurant)

    return redirect(request.POST.get('next', '/'))

class SignUpView(CreateView):
    form_class = UserCreationForm
    success_url = reverse_lazy("login")
    template_name = "AtlantaFoodFinder/signup.html"

class IndexView(TemplateView):
    template_name = "AtlantaFoodFinder/index.html"

class LogInView(LoginView):
    template_name = "AtlantaFoodFinder/login.html"




