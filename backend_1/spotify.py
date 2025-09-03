import os
import requests
import base64

# Get credentials from environment variables (set these in Render Dashboard)
SPOTIFY_CLIENT_ID = os.environ.get("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.environ.get("SPOTIFY_CLIENT_SECRET")

def get_spotify_token():
    """Fetch OAuth token from Spotify API."""
    if not SPOTIFY_CLIENT_ID or not SPOTIFY_CLIENT_SECRET:
        print("Spotify credentials not set in environment.")
        return None

    auth_str = f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}"
    b64_auth_str = base64.b64encode(auth_str.encode()).decode()

    headers = {"Authorization": f"Basic {b64_auth_str}"}
    data = {"grant_type": "client_credentials"}

    try:
        res = requests.post("https://accounts.spotify.com/api/token", headers=headers, data=data)
        res.raise_for_status()
        return res.json().get("access_token")
    except Exception as e:
        print("Error fetching Spotify token:", e)
        return None

def get_playlist(mood):
    """Search playlist by mood and return an EMBED URL for iframe."""
    token = get_spotify_token()
    if not token:
        # fallback embed playlist
        return "https://open.spotify.com/embed/playlist/37i9dQZF1DX3rxVfibe1L0"

    headers = {"Authorization": f"Bearer {token}"}
    params = {"q": mood, "type": "playlist", "limit": 1}

    try:
        res = requests.get("https://api.spotify.com/v1/search", headers=headers, params=params)
        res.raise_for_status()
        playlists = res.json().get('playlists', {}).get('items', [])
        if playlists:
            playlist_url = playlists[0]['external_urls']['spotify']  # normal URL
            # Convert to embed format
            return playlist_url.replace("open.spotify.com/playlist", "open.spotify.com/embed/playlist")
    except Exception as e:
        print("Error fetching playlist:", e)

    # fallback neutral playlist
    return "https://open.spotify.com/embed/playlist/37i9dQZF1DX3rxVfibe1L0"
