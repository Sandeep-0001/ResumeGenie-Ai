import os
import json
import google.generativeai as genai
from dotenv import load_dotenv


load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError("Missing GEMINI_API_KEY in environment variables")

genai.configure(api_key=API_KEY)

MODEL_NAME = "gemini-2.5-flash"
MODEL = genai.GenerativeModel(
    model_name=MODEL_NAME,
    system_instruction=(
        "You are an expert Applicant Tracking System (ATS). Analyze the provided resume "
        "against the job description. Respond ONLY in valid JSON format with the keys: "
        "'ats_score', 'missing_skills', 'suggestions', and 'summary'."
    ),
)
GEN_CONFIG = genai.GenerationConfig(response_mime_type="application/json")

def call_gemini(prompt: str):
    """
    Calls the Gemini API once per prompt using preloaded model and config.
    This reduces setup overhead and increases response speed.
    """
    try:
        response = MODEL.generate_content(prompt, generation_config=GEN_CONFIG)
        
        return json.loads(response.text)
    except json.JSONDecodeError:
        print("Invalid JSON returned from model.")
        return {
            "ats_score": 0,
            "missing_skills": [],
            "suggestions": ["Invalid JSON returned from Gemini."],
            "summary": "Error decoding Gemini output."
        }
    except Exception as e:
        print(f" Gemini API error: {e}")
        return {
            "ats_score": 0,
            "missing_skills": [],
            "suggestions": [f"API or processing error: {str(e)}"],
            "summary": "Failed to get a valid response from Gemini API."
        }
