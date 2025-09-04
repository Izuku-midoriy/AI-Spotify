from flask import Flask, request, jsonify
from flask_cors import CORS
from spotify import get_playlist
from ai import detect_mood
import os

app = Flask(__name__)
CORS(app)  # allow frontend (Vercel) to call this backend

@app.route('/')
def home():
    return jsonify({"status": "✅ MoodTunes Flask Backend is Running!"})

@app.route('/detectMood', methods=['POST'])
def detect_mood_route():
    try:
        data = request.get_json()
        text = data.get('text', '').strip()

        if not text:
            return jsonify({"error": "No input text provided"}), 400

        # Step 1: detect mood
        mood = detect_mood(text)

        # Step 2: get playlist for mood
        playlist_url = get_playlist(mood)

        return jsonify({
            "mood": mood,
            "playlistUrl": playlist_url
        })

    except Exception as e:
        print("❌ Backend error:", e)
        return jsonify({"error": "Server error"}), 500


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8080))  # Render provides PORT
    app.run(host="0.0.0.0", port=port)
