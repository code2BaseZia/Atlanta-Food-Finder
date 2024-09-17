from django.urls import path

from . import views

app_name = "atl_food_finder"

urlpatterns = [
    path('', views.index_view, name='index'),
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup_view, name='signup'),
    path('map/', views.map_view, name='map'),
    path('settings/', views.construction_view, name='settings'),
    path('reviews/', views.construction_view, name='reviews'),
    path('reset/', views.construction_view, name='reset'),
    path('recover/', views.construction_view, name='recover')
]