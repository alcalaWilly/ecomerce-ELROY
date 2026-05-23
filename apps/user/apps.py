from django.apps import AppConfig


class UserConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.user'

    # def ready(self):
    #     import apps.user.signals

    # def ready(self):
    #     import apps.user.signals  # Importar la señal para que se ejecute
