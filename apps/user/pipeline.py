def save_google_provider(strategy, details, user=None, response=None, *args, **kwargs):
    if not user:
        return

    user.provider = "google-oauth2"
    user.is_active = True

    # Google suele mandar la foto en response['picture']
    if response and response.get("picture"):
        user.profile_picture = response["picture"]

    user.save()