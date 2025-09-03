import os
import requests

SPOTIFY_CLIENT_ID = os.environ.get("6922ed1f01fc45b9936f304f240a92c5")
SPOTIFY_CLIENT_SECRET = os.environ.get("379fc217e5714eb5af9e98a4d7143a42")

def get_spotify_token():
    if not SPOTIFY_CLIENT_ID or not SPOTIFY_CLIENT_SECRET:
        return None

    import base64
    auth_str = f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}"
    b64_auth_str = base64.b64encode(auth_str.encode()).decode()

    headers = {"Authorization": f"Basic {b64_auth_str}"}
    data = {"grant_type": "client_credentials"}

    res = requests.post("https://accounts.spotify.com/api/token", headers=headers, data=data)
    return res.json().get("access_token")

def get_playlist(mood):
    token = get_spotify_token()
    if not token:
        return "https://open.spotify.com"

    headers = {"Authorization": f"Bearer {token}"}
    params = {"q": mood, "type": "playlist", "limit": 1}

    res = requests.get("https://api.spotify.com/v1/search", headers=headers, params=params)

    playlists = res.json().get('playlists', {}).get('items', [])
    if playlists:
        return playlists[0]['external_urls']['spotify']
    return "https://open.spotify.com"

