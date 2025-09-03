import os
import requests

HF_API_KEY = os.environ.get("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")  # Set this in Cloud Run

def detect_mood(text):
    if not HF_API_KEY:
        return "neutral"

    headers = {"Authorization": f"Bearer {HF_API_KEY}"}
    payload = {"inputs": text}
    response = requests.post(
        "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english",
        headers=headers,
        json=payload
    )

    try:
        label = response.json()[0][0]['label']
        if label == "POSITIVE":
            return "happy"
        elif label == "NEGATIVE":
            return "sad"
        return "neutral"
    except Exception:
        return "neutral"

