from django.shortcuts import render, redirect
from django.views.decorators.cache import never_cache
from django.contrib.auth.decorators import login_required
from networkx import reverse
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.decorators import user_passes_test

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import User
from rest_framework.decorators import api_view
import requests
from urllib.parse import urlencode
import json
from django.contrib.auth.hashers import make_password
from django.views.decorators.csrf import csrf_exempt
from apps.user.serializers import UserCreateSerializer
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from urllib.parse import urlencode, quote_plus
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate, login
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication


from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings

from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode

from django.utils.http import urlsafe_base64_decode

# def index(request):
#     if request.headers.get('X-Requested-With') == 'XMLHttpRequest':  # Detecta Fetch API
#         return render(request, "index.html")
#     return render(request, "base.html", {"content_template": "index.html"})

def index(request):
    return render(request, 'index.html')


def mi_vista(request):
    context = {
        "API_BASE_URL": settings.API_BASE_URL
    }
    return render(request, "base.html", context)

def mi_vistaDash(request):
    context = {
        "API_BASE_URL": settings.API_BASE_URL
    }
    return render(request, "dash/baseHome.html", context)

# def about(request):
#     if request.headers.get('X-Requested-With') == 'XMLHttpRequest':  # Detecta Fetch API
#         return render(request, "about.html")
#     return render(request, "base.html", {"content_template": "about.html"})


def about(request):
    return render(request, 'about.html')

def contact(request):
    return render(request, 'contact.html')

@login_required
def pedidos_detalle(request):
    return render(request, 'detallePedido.html')

@login_required
def pedidos_partial(request):
    return render(request, 'pedidos.html')

@login_required
def perfil_partial(request):
    return render(request, 'perfil.html')
# def perfil(request):
#     return render(request, 'userLogated.html')
def is_staff_or_superuser(user):
    return user.is_authenticated and (user.is_staff or user.is_superuser)

@csrf_exempt
@never_cache
# @user_passes_test(is_staff_or_superuser, login_url='/login/')
def perfil(request):
    # Al entrar a /perfil/ cargamos userLogated.html con pedidos.html
    return render(request, 'userLogated.html', {'content_template': 'pedidos.html'})

#####################################################################333

@never_cache
@login_required
def userLogated(request):
    user = request.user

    # Activar la cuenta si no está activa
    if not user.is_active:
        user.is_active = True
        user.save()

    # Inicializar variables
    picture_url = None
    google_access_token = None
    google_refresh_token = None
    first_name = user.first_name
    last_name = user.last_name

    # Manejo de usuarios autenticados con Google OAuth2
    if hasattr(user, "social_auth"):
        social_accounts = user.social_auth.all()
        for account in social_accounts:
            if account.provider == "google-oauth2": 
                google_access_token = account.extra_data.get("access_token")
                google_refresh_token = account.extra_data.get("refresh_token") 
                picture_url = account.extra_data.get("picture")

                # Obtener usuario desde user_useraccount
                User = get_user_model()
                google_user = User.objects.filter(id=account.user_id).first()
                if google_user:
                    first_name = google_user.first_name
                    last_name = google_user.last_name

    # Si no es un usuario de Google, establecer una imagen de perfil predeterminada
    if not picture_url:
        picture_url = "/static/images/default_profile.png"  # Ruta de imagen por defecto

    # Generar JWTs para todos los usuarios
    refresh = RefreshToken.for_user(user)
    jwt_access_token = str(refresh.access_token)
    jwt_refresh_token = str(refresh)

    # Redirigir al frontend con los datos en la URL
    params = {
        "access_token": jwt_access_token,
        "refresh_token": jwt_refresh_token,
        "email": user.email,
        "first_name": first_name,
        "last_name": last_name,
        "picture_url": picture_url
    }

    redirect_url = f"/perfil/?{urlencode(params, quote_via=quote_plus)}"

    return redirect(redirect_url)

@csrf_exempt
def login_user(request):
    if request.method == "POST":
        email = request.POST.get("username")
        password = request.POST.get("password")

        # Autenticación
        user = authenticate(request, email=email, password=password)

        if user is not None:
            login(request, user)

            # Generar JWT usando SimpleJWT
            refresh = RefreshToken.for_user(user)
            jwt_access_token = str(refresh.access_token)
            jwt_refresh_token = str(refresh)

            # Retornar los tokens y los datos adicionales
            return JsonResponse({
                "message": "Inicio de sesión exitoso",
                "access_token": jwt_access_token,
                "refresh_token": jwt_refresh_token,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "telefono": user.telefono,  # Asegúrate de que el modelo de usuario tenga este campo
                "direccion": user.direccion,
                "ruc": user.ruc,
                "ciudad": user.ciudad,
                "region": user.region,
                "codPostal": user.codPostal
            }, status=200)
        else:
            return JsonResponse({"error": "Correo o contraseña incorrectos"}, status=400)

    return JsonResponse({"error": "Método no permitido"}, status=405)


User = get_user_model()  # Usa el modelo personalizado de usuario

import traceback
@csrf_exempt  # Desactiva CSRF solo si es necesario (para pruebas)
@permission_classes([AllowAny]) 
def registro_usuario(request):
    if request.method == "POST":
        try:
            #data = json.loads(request.body)  # Recibe el JSON del frontend
            data = json.loads(request.body.decode("utf-8"))
            # Extraer datos del JSON
            email = data.get("email")
            password = data.get("password")
            first_name = data.get("first_name")
            last_name = data.get("last_name")
            telefono = data.get("phone")
            direccion = data.get("direccion")
            ruc = data.get("ruc")
            ciudad = data.get("ciudad")
            region = data.get("region")
            codPostal = data.get("codPostal")

            # Convertir valores vacíos a None
            telefono = telefono if telefono else None
            direccion = direccion if direccion else None
            ruc = ruc if ruc else None
            ciudad = ciudad if ciudad else None
            region = region if region else None
            codPostal = codPostal if codPostal else None

            # Verificar si el usuario ya existe
            if User.objects.filter(email=email).exists():
                return JsonResponse({"error": "El usuario ya existe."}, status=400)

            # Crear usuario usando create_user
            user = User.objects.create_user(
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                telefono=telefono,
                direccion=direccion,
                ruc=ruc,
                ciudad=ciudad,
                region=region,
                codPostal=codPostal
            )

            # ⬇️ Envía el correo después del registro
            #enviar_correo_activacion(user, request)
            enviar_correo_bienvenida(user)

            return JsonResponse({"message": "Usuario registrado exitosamente."}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Formato JSON inválido."}, status=400)
        # except Exception as e:
        #     traceback.print_exc()
        #     return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Método no permitido."}, status=405)


def enviar_correo_bienvenida(usuario):
    asunto = '¡Bienvenido a Vudera!'
    mensaje = f"""
Hola {usuario.first_name},

Gracias por registrarte en EL♥ROY. ¡Estamos felices de tenerte con nosotros!

Atentamente,
El equipo de EL♥ROY
"""
    send_mail(
        asunto,
        mensaje,
        settings.EMAIL_HOST_USER,
        [usuario.email],
        fail_silently=False
    )

def enviar_correo_activacion(usuario, request):
    token = default_token_generator.make_token(usuario)
    uid = urlsafe_base64_encode(force_bytes(usuario.pk))
    
    activation_link = request.build_absolute_uri(
        reverse('activar_cuenta', kwargs={'uidb64': uid, 'token': token})
    )

    asunto = 'Activa tu cuenta en EL♥ROY'
    mensaje = f"""
Hola {usuario.first_name},

Gracias por registrarte en EL♥ROY. Por favor activa tu cuenta haciendo clic en el siguiente enlace:

{activation_link}

Este enlace expirará después de cierto tiempo por seguridad.

El equipo de EL♥ROY
"""
    send_mail(asunto, mensaje, settings.EMAIL_HOST_USER, [usuario.email])

def activar_cuenta(request, uidb64, token):
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(pk=uid)
    except (User.DoesNotExist, ValueError):
        user = None

    if user and default_token_generator.check_token(user, token):
        user.is_active = True
        user.save()

        # Generar tokens JWT
        refresh = RefreshToken.for_user(user)
        jwt_access_token = str(refresh.access_token)
        jwt_refresh_token = str(refresh)

        # Redireccionar al perfil con los tokens
        params = {
            "access_token": jwt_access_token,
            "refresh_token": jwt_refresh_token,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
        }

        url = f"/perfil/?{urlencode(params)}"
        return redirect(url)
    else:
        return HttpResponse("El enlace de activación es inválido o ha expirado.")

    
@csrf_exempt  # ⚠️ Solo para pruebas locales
@api_view(["GET", "PUT"])  # ✅ Permitir GET y PUT
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def actualizar_usuario(request, id):
    try:
        # ✅ Método GET para mostrar datos
        if request.method == "GET":
            user = User.objects.filter(id=id).first()
            if not user:
                return JsonResponse({"error": "Usuario no encontrado."}, status=404)

            datos_cliente = {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "telefono": user.telefono,
                "direccion": user.direccion,
                "ruc": user.ruc,
                "ciudad": user.ciudad,
                "region": user.region,
                "codPostal": user.codPostal,
            }
            return JsonResponse(datos_cliente, status=200)

        # ✅ Método PUT para actualizar datos
        if request.method == "PUT":
            data = json.loads(request.body)
            user = User.objects.filter(id=id).first()
            if not user:
                return JsonResponse({"error": "Usuario no encontrado."}, status=404)

            # Mostrar datos antes de actualizar
            datos_antes = {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "telefono": user.telefono,
                "direccion": user.direccion,
                "ruc": user.ruc,
                "ciudad": user.ciudad,
                "region": user.region,
                "codPostal": user.codPostal,
            }

            # Actualizar datos
            campos_actualizables = [
                "email", "first_name", "last_name", "telefono",
                "direccion", "ruc", "ciudad", "region", "codPostal"
            ]
            for campo in campos_actualizables:
                setattr(user, campo, data.get(campo, getattr(user, campo)))

            # Actualizar contraseña si se envía
            password = data.get("password", None)
            if password:
                user.set_password(password)

            user.save()

            datos_despues = {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "telefono": user.telefono,
                "direccion": user.direccion,
                "ruc": user.ruc,
                "ciudad": user.ciudad,
                "region": user.region,
                "codPostal": user.codPostal,
            }

            return JsonResponse({
                "message": "Usuario actualizado exitosamente.",
                "antes": datos_antes,
                "despues": datos_despues
            }, status=200)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Formato JSON inválido."}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

###################################################################################


# PARA EL PANEL ADMINISTRATIVO
def is_staff_or_superuser(user):
    return user.is_authenticated and (user.is_staff or user.is_superuser)


@login_required
def validate_session(request):
    return JsonResponse({"message": "Sesión activa"})

@never_cache
@user_passes_test(is_staff_or_superuser, login_url='/login/')
@login_required
def dash(request):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':  
        return render(request, "dash/home.html")
    return render(request, "dash/baseHome.html", {"content_template": "dash/home.html"})
# @user_passes_test(is_staff_or_superuser, login_url='/login/')
# def dash(request):
#     return render(request, 'dash/home.html')


@user_passes_test(is_staff_or_superuser, login_url='/login/')
def dashProduct(request):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':  # Detecta Fetch API
        return render(request, "dash/pages/product/dashProduct.html")
    return render(request, "dash/baseHome.html", {"content_template": "dash/pages/product/dashProduct.html"})


@user_passes_test(is_staff_or_superuser, login_url='/login/')
def dashUser(request):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':  # Detecta Fetch API
        return render(request, "dash/pages/users/dashUser.html")
    return render(request, "dash/baseHome.html", {"content_template": "dash/pages/users/dashUser.html"})


@user_passes_test(is_staff_or_superuser, login_url='/login/')
def dashAddProducts(request):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':  # Detecta Fetch API
        return render(request, "dash/pages/product/dashAddProducts.html")
    return render(request, "dash/baseHome.html", {"content_template": "dash/pages/product/dashAddProducts.html"})

# LO NUEVOOOOOOOOOOOOOOOOOOO PARA AGREGAR PRODUCTOS
@user_passes_test(is_staff_or_superuser, login_url='/login/')
def dashAddProduct(request):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':  # Detecta Fetch API
        return render(request, "dash/pages/product/dashAddProduct.html")
    return render(request, "dash/baseHome.html", {"content_template": "dash/pages/product/dashAddProduct.html"})


@user_passes_test(is_staff_or_superuser, login_url='/login/')
def dashConfiguration(request):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':  # Detecta Fetch API
        return render(request, "dash/pages/configuration/dashConfig.html")
    return render(request, "dash/baseHome.html", {"content_template": "dash/pages/configuration/dashConfig.html"})


@user_passes_test(is_staff_or_superuser, login_url='/login/')
def dashPromocion(request):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':  # Detecta Fetch API
        return render(request, "dash/pages/configuration/dashPromociones.html")
    return render(request, "dash/baseHome.html", {"content_template": "dash/pages/configuration/dashPromociones.html"})

@user_passes_test(is_staff_or_superuser, login_url='/login/')
def addDescuento(request):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':  # Detecta Fetch API
        return render(request, "dash/pages/configuration/addDescuento.html")
    return render(request, "dash/baseHome.html", {"content_template": "dash/pages/configuration/addDescuento.html"})

@user_passes_test(is_staff_or_superuser, login_url='/login/')
def updateDescuento(request):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':  # Detecta Fetch API
        return render(request, "dash/pages/configuration/updateDescuento.html")
    return render(request, "dash/baseHome.html", {"content_template": "dash/pages/configuration/updateDescuento.html"})



# PÁGINAS
@user_passes_test(is_staff_or_superuser, login_url='/login/')
def dashInicio(request):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':  # Detecta Fetch API
        return render(request, "dash/pages/paginas/dashInicio.html")
    return render(request, "dash/baseHome.html", {"content_template": "dash/pages/paginas/dashInicio.html"})


# CLIENTES
@user_passes_test(is_staff_or_superuser, login_url='/login/')
def dashAddClient(request):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':  # Detecta Fetch API
        return render(request, "dash/pages/users/dashAddClient.html")
    return render(request, "dash/baseHome.html", {"content_template": "dash/pages/users/dashAddClient.html"})

@user_passes_test(is_staff_or_superuser, login_url='/login/')
def profileClient(request, idCliente):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':  # Detecta Fetch API
        return render(request, "dash/pages/users/profileClient.html", {"idCliente": idCliente})
    
    # Renderizado general con idCliente
    return render(request, "dash/baseHome.html", {
        "content_template": "dash/pages/users/profileClient.html",
        "idCliente": idCliente
    })

# PEDIDOS
@user_passes_test(is_staff_or_superuser, login_url='/login/')
def dashAllPedido(request):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':  # Detecta Fetch API
        return render(request, "dash/pages/pedidos/allPedidos.html")
    return render(request, "dash/baseHome.html", {"content_template": "dash/pages/pedidos/allPedidos.html"})

@user_passes_test(is_staff_or_superuser, login_url='/login/')
def dashAddPedido(request):
    idCliente = request.GET.get('id')  # Puede ser None si no viene

    context = {
        "content_template": "dash/pages/pedidos/addPedido.html",
        "idCliente": idCliente  # Lo pasamos de todas formas
    }

    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return render(request, "dash/pages/pedidos/addPedido.html", {"idCliente": idCliente})
    
    return render(request, "dash/baseHome.html", context)


@user_passes_test(is_staff_or_superuser, login_url='/login/')
def dashDetallePedido(request):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':  # Detecta Fetch API
        return render(request, "dash/pages/pedidos/detallePedido.html")
    return render(request, "dash/baseHome.html", {"content_template": "dash/pages/pedidos/detallePedido.html"})

@user_passes_test(is_staff_or_superuser, login_url='/login/')
def dashPedidoCliente(request):
    idCliente = request.GET.get('id')

    if not idCliente:
        return HttpResponse("ID de cliente no proporcionado", status=400)

    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return render(request, "dash/pages/pedidos/pedidoCliente.html", {"idCliente": idCliente})
    
    return render(request, "dash/baseHome.html", {
        "content_template": "dash/pages/pedidos/pedidoCliente.html",
        "idCliente": idCliente
    })



