from django.db import models
from django.contrib.auth.models import AbstractBaseUser,Group, Permission, PermissionsMixin, BaseUserManager
import os
from apps.cart.models import Cart
# from apps.cart.models import Cart
# from apps.user_profile.models import UserProfile
# from apps.wishlist.models import WishList

# class UserAccountManager(BaseUserManager):
#     def create_user(self, email, password=None, **extra_fields):
#         if not email:
#             raise ValueError('Debes proporcionar un correo electrónico.')

#         email = self.normalize_email(email)
#         user = self.model(email=email, **extra_fields)
#         user.set_password(password)
#         user.save(using=self._db)  # Es importante especificar el `using` para bases de datos múltiples.

#         shopping_cart = Cart.objects.create(user=user)
#         shopping_cart.save()
#         return user

#     def create_superuser(self, email, password=None, **extra_fields):
#         extra_fields.setdefault('is_staff', True)
#         extra_fields.setdefault('is_superuser', True)

#         if extra_fields.get('is_staff') is not True:
#             raise ValueError('El superusuario debe tener is_staff=True.')
#         if extra_fields.get('is_superuser') is not True:
#             raise ValueError('El superusuario debe tener is_superuser=True.')

#         return self.create_user(email, password, **extra_fields)

#     def get_by_natural_key(self, email):
#         return self.get(email=email)


# class UserAccount(AbstractBaseUser, PermissionsMixin):
#     email = models.EmailField(max_length=255, unique=True)
#     first_name = models.CharField(max_length=255)
#     last_name = models.CharField(max_length=255)
#     is_active = models.BooleanField(default=True)
#     is_staff = models.BooleanField(default=False)

#     objects = UserAccountManager()  # Asegúrate de que aquí esté bien escrito

#     USERNAME_FIELD = 'email'
#     REQUIRED_FIELDS = ['first_name', 'last_name']

#     def get_full_name(self):
#         return f"{self.first_name} {self.last_name}"

#     def get_short_name(self):
#         return self.first_name

#     def __str__(self):
#         return self.email


class UserAccountManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
            if not email:
                raise ValueError('Debes proporcionar un correo electrónico.')

            email = self.normalize_email(email)
            user = self.model(email=email, **extra_fields)
            # 👇 clave: por defecto inactivo (requiere activación)
            user.is_active = False
            user.set_password(password)
            user.save(using=self._db)  # Es importante especificar el `using` para bases de datos múltiples.

            # Crear un carrito de compras para el usuario
            shopping_cart = Cart.objects.create(user=user)
            shopping_cart.save()

            return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('El superusuario debe tener is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('El superusuario debe tener is_superuser=True.')

        extra_fields.setdefault("is_active", True)
        return self.create_user(email, password, **extra_fields)

    def get_by_natural_key(self, email):
        return self.get(email=email)


class UserAccount(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(max_length=255, unique=True)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    telefono = models.CharField(max_length=15, blank=True, null=True)
    direccion = models.CharField(max_length=255, blank=True, null=True)
    ruc = models.CharField(max_length=20, blank=True, null=True, unique=True)
    ciudad = models.CharField(max_length=100, blank=True, null=True)
    region = models.CharField(max_length=100, blank=True, null=True)
    codPostal = models.CharField(max_length=10, blank=True, null=True)

    # 🔹 NUEVOS CAMPOS
    profile_picture = models.URLField(blank=True, null=True)
    provider = models.CharField(max_length=30, blank=True, null=True, default="manual")

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserAccountManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"

    def get_short_name(self):
        return self.first_name

    def __str__(self):
        return self.email


