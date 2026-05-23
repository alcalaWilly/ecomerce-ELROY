# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from .models import UserAccount
# from django.core.mail import send_mail
# from django.conf import settings
# # from ././pro import enviar_correo_bienvenida  # ajusta import

# @receiver(post_save, sender=UserAccount)
# def welcome_email(sender, instance, created, **kwargs):
#     if created:
#         enviar_correo_bienvenida(instance)


# def enviar_correo_bienvenida(usuario):
#     asunto = '¡Bienvenido a Vudera!'
#     mensaje = f"""
# Hola {usuario.first_name},

# Gracias por registrarte en EL♥ROY. ¡Estamos felices de tenerte con nosotros!

# Atentamente,
# El equipo de EL♥ROY
# """
#     send_mail(
#         asunto,
#         mensaje,
#         settings.EMAIL_HOST_USER,
#         [usuario.email],
#         fail_silently=False
#     )