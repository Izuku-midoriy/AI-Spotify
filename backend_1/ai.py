import os
import requests

# ✅ Store your Hugging Face token in Render as environment variable: HF_API_KEY
HF_API_KEY = os.environ.get("HF_API_KEY")

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
        # Response format: [[{'label': 'POSITIVE', 'score': 0.99}]]
        label = response.json()[0][0]['label']
        if label == "POSITIVE":
            return "happy"
        elif label == "NEGATIVE":
            return "sad"
        return "neutral"
    except Exception as e:
        print("Error parsing Hugging Face response:", e, response.text)
        return "neutral"
