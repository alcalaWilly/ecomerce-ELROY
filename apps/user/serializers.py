from djoser.serializers import UserCreateSerializer  as BaseUserCreateSerializer
from rest_framework import serializers
from .models import UserAccount
from django.contrib.auth import get_user_model
User = get_user_model()


# class UserCreateSerializer(serializers.ModelSerializer):
#     telefono = serializers.CharField(required=False, allow_blank=True, default=None)
#     direccion = serializers.CharField(required=False, allow_blank=True, default=None)
#     ruc = serializers.CharField(required=False, allow_blank=True, default=None)
#     ciudad = serializers.CharField(required=False, allow_blank=True, default=None)
#     region = serializers.CharField(required=False, allow_blank=True, default=None)
#     codPostal = serializers.CharField(required=False, allow_blank=True, default=None)
#     provider = serializers.CharField(required=False, allow_blank=True, default="manual")  # Para detectar Google

#     class Meta:
#         model = UserAccount
#         fields = ('id', 'email', 'first_name', 'last_name', 'password', 
#                 'telefono', 'direccion', 'ruc', 'ciudad', 'region', 'codPostal', 'provider')
#         extra_kwargs = {'password': {'write_only': True}}

#     def create(self, validated_data):
#         provider = validated_data.pop('provider', 'manual')

#         if provider == 'google-oauth2':
#             # Google no proporciona estos datos, aseguramos que sean None
#             validated_data['telefono'] = None
#             validated_data['direccion'] = None
#             validated_data['ruc'] = None
#             validated_data['ciudad'] = None
#             validated_data['region'] = None
#             validated_data['codPostal'] = None

#         user = UserAccount.objects.create_user(**validated_data)
#         return user


class UserCreateSerializer(serializers.ModelSerializer):
    telefono = serializers.CharField(required=False, allow_blank=True, default=None)
    direccion = serializers.CharField(required=False, allow_blank=True, default=None)
    ruc = serializers.CharField(required=False, allow_blank=True, default=None)
    ciudad = serializers.CharField(required=False, allow_blank=True, default=None)
    region = serializers.CharField(required=False, allow_blank=True, default=None)
    codPostal = serializers.CharField(required=False, allow_blank=True, default=None)
    provider = serializers.CharField(required=False, allow_blank=True, default="manual")

    class Meta:
        model = UserAccount
        fields = (
            'id', 'email', 'first_name', 'last_name', 'password',
            'telefono', 'direccion', 'ruc', 'ciudad', 'region', 'codPostal',
            'provider'
        )
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        provider = validated_data.pop('provider', 'manual')
        password = validated_data.pop('password', None)

        # "" -> None (evita choques con unique, sobre todo ruc)
        for f in ['telefono','direccion','ruc','ciudad','region','codPostal']:
            if validated_data.get(f) == "":
                validated_data[f] = None

        # Si algún día lo usas para Google
        if provider == 'google-oauth2':
            password = None
            for f in ['telefono','direccion','ruc','ciudad','region','codPostal']:
                validated_data[f] = None

        user = UserAccount.objects.create_user(
            email=validated_data['email'],
            password=password,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            telefono=validated_data.get('telefono'),
            direccion=validated_data.get('direccion'),
            ruc=validated_data.get('ruc'),
            ciudad=validated_data.get('ciudad'),
            region=validated_data.get('region'),
            codPostal=validated_data.get('codPostal'),
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAccount
        fields = (
            "id", "email", "first_name", "last_name",
            "telefono", "direccion", "ruc", "ciudad", "region", "codPostal"
        )
        read_only_fields = ("id", "email")