from django.urls import path, include

from .views import SignUpView, LogInView, IndexView, favorites

urlpatterns = [
    path('favorites/', favorites, name='favorites'),
    path("signup/", SignUpView.as_view(), name="signup"),
    path("login/", LogInView.as_view(), name="login"),
    path("", IndexView.as_view(), name="home"),
    path('', include('django.contrib.auth.urls')),
]
