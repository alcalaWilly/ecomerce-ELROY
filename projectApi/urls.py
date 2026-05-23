"""
URL configuration for projectApi project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth import views as auth_views
from apps.user.views import logout_view
from .views import login_user, actualizar_usuario, validate_session,activate_view
from . import views

urlpatterns = [
    path("activate/<uid>/<token>", activate_view, name="activate_no_slash"),
    path("activate/<uid>/<token>/", activate_view, name="activate"),
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),
    path('auth/', include('djoser.social.urls')),
    path('auth/', include('social_django.urls', namespace="social")),
    path("api/jwt-from-session/", views.jwt_from_session, name="jwt_from_session"),

    path("google-success/", views.google_login_success, name="google_success"), 
    # path("auth/o/google-oauth2/", include("djoser.social.urls")), 

    path('admin/', admin.site.urls),
    path('', views.index, name='index'),
    # path('', views.dash, name='das'),
    path('about/', views.about, name='about'),
    path('contact/', views.contact, name='contact'),
    ##############################################
    path('pedidos/', views.pedidos_partial, name='pedidos'),
    path('perfilUser/', views.perfil_partial, name='perfilUser'),
    path('perfil/', views.perfil, name='my_acount'),
    path('pedidos_detalle/', views.pedidos_detalle, name='pedidos_detalle'),

#############################################
    path('user-logated/', views.user_logated, name='user_logated'),
    
    path('login/', login_user, name='login_user'),  # Cambiar a tu vista personalizada
    # activar la ceunta desde correro
    path('activar/<uidb64>/<token>/', views.activar_cuenta, name='activar_cuenta'),

    # path("api/registro/", registro_usuario, name="registro_usuario"),
    path('actualizar-usuario/<int:id>/', actualizar_usuario, name='actualizar_usuario'),  # ✅ RUTA CORRECTA

    path("logout/", logout_view, name="logout"),
    path('validate-session/', validate_session, name='validate_session'),

    ##########################################################
    # Endpoint para verificar el token de Google y obtener JWT
    path('', include('apps.user.urls')),
    path('', include('apps.category.urls')),
    path('', include('apps.product.urls')),
    path('api/cart/', include('apps.cart.urls')),
    #para iniciar y salir
    #LOS SHIPPIN
    path('api/', include('apps.shipping.urls')),
    # PARA LAS ORDENES
    path('api/orders/', include('apps.orders.urls')),
    # PARA LOS PAGOS
    path('api/payment/', include('apps.payment.urls')),
    # DAAAASH
    path('dash/', views.dash, name='dash'),
    path('dash-allProducts/', views.dashProduct, name='allProducts'),
    path('dash-allUsers/', views.dashUser, name='allUsers'),
    path('dash-addProducts/', views.dashAddProducts, name='dashAddProducts'),
    # 
    path('dash-addProduct/', views.dashAddProduct, name='dashAddProduct'),
    # 
    path('dash-configuration/', views.dashConfiguration, name='dashConfiguration'),

    path('dash-promocion/', views.dashPromocion, name='dashPromocion'),
    path('dash-addDescuento/', views.addDescuento, name='dashAddDescuento'),
    path('dash-updateDescuento/', views.updateDescuento, name='dashUpdateDescuento'),

    path('dash-inicio/', views.dashInicio, name='dashInicio'),
    path('dash-addClient/', views.dashAddClient, name='dashAddClient'),
    # En urls.py
    path('dash-profileClient/<int:idCliente>/', views.profileClient, name='profileClient'),
    # 
    path('dash-allPedido/', views.dashAllPedido, name='dashAllPedido'),
    path('dash-addPedido/', views.dashAddPedido, name='dashAddPedido'),
    path('dash-detallePedido/', views.dashDetallePedido, name='dashDetallePedido'),
    # path('dash-pedidoCliente/<int:idCliente>/', views.dashPedidoCliente, name='dashPedidoCliente'),
    path('dash-pedidoCliente/', views.dashPedidoCliente, name='dashPedidoCliente'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) 