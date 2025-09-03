import os
import requests

HF_API_KEY = os.environ.get("HF_API_KEY")  # ✅ make sure this is set in Render

def detect_mood(text: str) -> str:
    if not HF_API_KEY:
        print("⚠️ Hugging Face API key not found.")
        return "neutral"

    headers = {"Authorization": f"Bearer {HF_API_KEY}"}
    payload = {"inputs": text}

    try:
        response = requests.post(
            "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english",
            headers=headers,
            json=payload
        )
        response.raise_for_status()
        result = response.json()

        # Handle both possible formats
        if isinstance(result, list):
            if isinstance(result[0], list):
                label = result[0][0]["label"]
            else:
                label = result[0]["label"]
        else:
            label = "NEUTRAL"

        # Map Hugging Face labels to moods
        if label == "POSITIVE":
            return "happy"
        elif label == "NEGATIVE":
            return "sad"
        else:
            return "neutral"

    except Exception as e:
        print("Error in detect_mood:", e)
        return "neutral"
