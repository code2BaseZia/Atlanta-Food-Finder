from django.urls import path

from .views import SignUpView
from django.views.generic import TemplateView

urlpatterns = [
    path("signup/", SignUpView.as_view(), name="signup"),
    path("", TemplateView.as_view(template_name="favorites.html"), name="favorites"),
]