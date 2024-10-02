from django.contrib.auth.views import LoginView
from django.http import JsonResponse
from django.contrib.auth.forms import UserCreationForm
from django.urls import reverse_lazy
from django.views.decorators.http import require_http_methods
from django.views.generic import CreateView, TemplateView
from json import loads

from .models import Restaurant

@require_http_methods(['GET', 'POST', 'DELETE'])
def favorites(request):
    if request.method == 'GET':
        try:
            profile = request.user.profile
            if request.GET.get('id', False):
                favorite = profile.favorites.filter(place_id=request.GET.get('id')).exists()
                return JsonResponse({'favorites': favorite })
            else:
                ids = []
                for restaurant in profile.favorites.all():
                    ids.append(restaurant.place_id)
                return JsonResponse(status=200, data={ 'favorites': ids })
        except Exception as error:
            return JsonResponse(status=500, data={'error': str(error)})
    if request.method == 'POST':
        try:
            post = loads(request.body)
            if 'id' not in post:
                return JsonResponse(status=500, data={'error': 'You must include a restaurant id'})
            restaurant_id = post['id']
            has_restaurant = Restaurant.objects.filter(place_id=restaurant_id).exists()
            if not has_restaurant:
                Restaurant.objects.create(place_id=restaurant_id)
            restaurant = Restaurant.objects.get(place_id=restaurant_id)
            profile = request.user.profile
            if restaurant in profile.favorites.all():
                profile.favorites.remove(restaurant)
                return JsonResponse(status=200, data={'message': 'Restaurant removed from favorites'})
            else:
                profile.favorites.add(restaurant)
                return JsonResponse(status=200, data={'message': 'Restaurant added to favorites'})
        except Exception as error:
            return JsonResponse(status=500, data={'error': str(error)})

class SignUpView(CreateView):
    form_class = UserCreationForm
    success_url = reverse_lazy("login")
    template_name = "AtlantaFoodFinder/signup.html"

class IndexView(TemplateView):
    template_name = "AtlantaFoodFinder/index.html"

class LogInView(LoginView):
    template_name = "AtlantaFoodFinder/login.html"




