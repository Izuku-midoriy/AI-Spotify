from flask import Flask, request, jsonify
from flask_cors import CORS
from spotify import get_playlist
from ai import detect_mood

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "MoodTunes Flask Backend is Running!"

@app.route('/detectMood', methods=['POST'])
def detect_mood_route():
    data = request.get_json()
    text = data.get('text', '')

    # AI-based mood detection
    mood = detect_mood(text)

    # Get playlist from Spotify
    playlist_url = get_playlist(mood)

    return jsonify({"mood": mood, "playlistUrl": playlist_url})

if __name__ == '__main__':
    import os
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)
