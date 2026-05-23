from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
User = get_user_model()
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
import requests
from django.shortcuts import render, redirect
from django.conf import settings
from django.contrib.auth import logout

from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.cache import never_cache
from django.contrib.sessions.models import Session
from rest_framework_simplejwt.tokens import OutstandingToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from django.http import HttpResponse
from .models import UserAccount
from .serializers import UserCreateSerializer
from django.contrib.auth.decorators import user_passes_test
from django.contrib.auth.decorators import login_required
# Create your views here.


# def shop(request):
#     return render(request, 'shop.html', {'active_page': 'shop'})

def shop(request):
    category_id = request.GET.get('category')  # lee ?category=1 si existe
    context = {
        'active_page': 'shop',
        'category_id': category_id,  # lo puedes usar en tu template o JS
    }
    return render(request, 'shop.html', context)


def is_staff_or_superuser(user):
    return user.is_authenticated and (user.is_staff or user.is_superuser)

# @csrf_exempt
# @never_cache
# @login_required(login_url='/login/')
# def logout_view(request):
#     # responder al pre-flight
#     if request.method == "OPTIONS":
#         resp = HttpResponse()
#         resp["Allow"] = "POST, OPTIONS"
#         return resp
    
#     if request.method == "POST":
#         user = request.user
#         if user.is_authenticated:
#             tokens = OutstandingToken.objects.filter(user=user)
#             for t in tokens:
#                 BlacklistedToken.objects.get_or_create(token=t)
#                 t.delete()
#         logout(request)
#         response = redirect(settings.LOGOUT_REDIRECT_URL)    # redirige al “/”
#         # limpia cookies igual que antes…
#         for c in ("sessionid","access_token","csrftoken","refresh_token"):
#             response.delete_cookie(c)
#         response['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
#         response['Pragma'] = 'no-cache'
#         response['Expires'] = '0'
#         return JsonResponse({"message": "Sesión cerrada con éxito"})
#     return JsonResponse({"error":"Método no permitido"}, status=405)

# @csrf_exempt
# @never_cache
# @login_required(login_url='/login/')
# def logout_view(request):
#     if request.method == "OPTIONS":
#         resp = HttpResponse()
#         resp["Allow"] = "POST, OPTIONS"
#         return resp

#     if request.method == "POST":
#         user = request.user
#         if user.is_authenticated:
#             tokens = OutstandingToken.objects.filter(user=user)
#             for t in tokens:
#                 BlacklistedToken.objects.get_or_create(token=t)
#                 t.delete()

#         logout(request)

#         response = JsonResponse({"message": "Sesión cerrada con éxito"})
#         for c in ("sessionid","access_token","csrftoken","refresh_token"):
#             response.delete_cookie(c)

#         response['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
#         response['Pragma'] = 'no-cache'
#         response['Expires'] = '0'
#         return response

#     return JsonResponse({"error":"Método no permitido"}, status=405)


@never_cache
@login_required(login_url='/login/')
def logout_view(request):
    if request.method == "OPTIONS":
        resp = HttpResponse()
        resp["Allow"] = "POST, OPTIONS"
        return resp

    if request.method == "POST":
        user = request.user
        if user.is_authenticated:
            tokens = OutstandingToken.objects.filter(user=user)
            for t in tokens:
                BlacklistedToken.objects.get_or_create(token=t)
                t.delete()

        logout(request)

        response = JsonResponse({"message": "Sesión cerrada con éxito"})
        for c in ("sessionid", "access_token", "csrftoken", "refresh_token"):
            response.delete_cookie(c)

        response["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        response["Pragma"] = "no-cache"
        response["Expires"] = "0"
        return response

    return JsonResponse({"error": "Método no permitido"}, status=405)

class clientListView(APIView):
    
    authentication_classes = [JWTAuthentication] 
    permission_classes = [IsAuthenticated]  

    def get(self, request):
        try:
            users = UserAccount.objects.all()
            serializer = UserCreateSerializer(users, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


