import os
import requests

HF_API_KEY = os.environ.get("HF_API_KEY")

def detect_mood(text):
    if not HF_API_KEY:
        return "neutral"

    headers = {"Authorization": f"Bearer {HF_API_KEY}"}
    payload = {"inputs": text}

    try:
        response = requests.post(
            "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english",
            headers=headers,
            json=payload,
            timeout=15
        )
        result = response.json()

        # Response format may vary
        if isinstance(result, list):
            label = result[0][0]['label'] if isinstance(result[0], list) else result[0]['label']
        else:
            label = "NEUTRAL"

        if label == "POSITIVE":
            return "happy"
        elif label == "NEGATIVE":
            return "sad"
        return "neutral"

    except Exception as e:
        print("❌ Error in detect_mood:", e, response.text)
        return "neutral"
