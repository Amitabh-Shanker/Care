# CareNexus ML API

Medical Symptom & Disease Predictor API using FastAPI, PyTorch, and TensorFlow.

## Features

- **Text Analysis**: NER-based symptom extraction from text
- **Image Analysis**: Skin disease classification using EfficientNet
- **Severity Assessment**: Emergency, urgent, moderate, mild classification
- **Nearby Medical Help**: Google Maps integration

## Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

## Deploy to Hugging Face Spaces

1. Create a new Space at [huggingface.co/new-space](https://huggingface.co/new-space)
2. Select **Docker** as the SDK
3. Clone your Space and copy all files from this folder
4. Push to deploy

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/predict_text` | POST | Analyze symptoms from text |
| `/predict_image` | POST | Analyze skin condition from image |
| `/predict_combined` | POST | Combined text + image analysis |
| `/symptoms` | GET | List all known symptoms |
| `/diseases` | GET | List all known diseases |
| `/nearby_medical_help` | POST | Find nearby medical facilities |

## Models

- **Text Model**: Fine-tuned BERT for medical NER (~431 MB)
- **Image Model**: EfficientNet for skin disease classification (~41 MB)
