from django.contrib.auth import user_logged_in
from django.contrib.auth.views import LoginView
from django.shortcuts import render
from django.contrib.auth.forms import UserCreationForm
from django.urls import reverse_lazy
from django.views.generic import CreateView, TemplateView
from django import forms
from django.contrib.auth.models import User

class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=True, help_text='Enter a valid email address.')

    class Meta:
        model = User
        fields = ("username", "email", "password1", "password2")

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data["email"]
        if commit:
            user.save()
        return user

class SignUpView(CreateView):
    form_class = CustomUserCreationForm
    success_url = reverse_lazy("login")
    template_name = "AtlantaFoodFinder/signup.html"

class IndexView(TemplateView):
    template_name = "AtlantaFoodFinder/index.html"

class LogInView(LoginView):
    template_name = "AtlantaFoodFinder/login.html"




