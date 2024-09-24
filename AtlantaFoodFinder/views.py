from django.contrib.auth.views import LoginView
from django.shortcuts import render
from django.contrib.auth.forms import UserCreationForm
from django.urls import reverse_lazy
from django.views.generic import CreateView, TemplateView


class SignUpView(CreateView):
    form_class = UserCreationForm
    success_url = reverse_lazy("login")
    template_name = "AtlantaFoodFinder/signup.html"

class IndexView(TemplateView):
    template_name = "AtlantaFoodFinder/index.html"

class LogInView(LoginView):
    template_name = "AtlantaFoodFinder/login.html"




