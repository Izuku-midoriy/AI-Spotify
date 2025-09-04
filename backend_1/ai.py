import os
import requests

HF_API_KEY = os.environ.get("HF_API_KEY")

def detect_mood(text):
    if not HF_API_KEY:
        print("❌ Hugging Face key missing")
        return "neutral"

    headers = {"Authorization": f"Bearer {HF_API_KEY}"}
    payload = {"inputs": text}

    try:
        response = requests.post(
            "https://huggingface.co/distilbert/distilbert-base-uncased-finetuned-sst-2-english",
            headers=headers,
            json=payload,
            timeout=15
        )
        print("🔍 Raw Hugging Face response:", response.text)  # 👈 Debug
        response.raise_for_status()
        result = response.json()

        if isinstance(result, list):
            label = result[0][0]['label'] if isinstance(result[0], list) else result[0]['label']
        else:
            return "neutral"

        if label == "POSITIVE":
            return "happy"
        elif label == "NEGATIVE":
            return "sad"
        return "neutral"

    except Exception as e:
        print("❌ Error contacting Hugging Face:", e)
        return "neutral"

