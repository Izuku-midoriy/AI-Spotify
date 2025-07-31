#!/bin/bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/mood-backend

gcloud run deploy mood-backend \
  --image gcr.io/YOUR_PROJECT_ID/mood-backend \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated