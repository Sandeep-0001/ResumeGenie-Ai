# resumegenie.py
import os, json, re
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError(" Missing GEMINI_API_KEY in environment variables")

# Configure Gemini API
genai.configure(api_key=API_KEY)

# Default model
MODEL_NAME = "gemini-2.5-flash"

def call_openrouter(prompt, model=MODEL_NAME):
    """
    Calls Google Gemini API and returns a parsed JSON response.
    """
    try:
        # Create a model instance
        model_instance = genai.GenerativeModel(model)

        # Generate content
        response = model_instance.generate_content(
            prompt=(
                "You are simulating an advanced ATS (Applicant Tracking System). "
                "Analyze the resume against the job description and respond ONLY in JSON "
                "with keys: ats_score (0-100), missing_skills (list of strings), "
                "suggestions (list of strings), summary (string). "
                f"\n\n{prompt}"
            )
        )

        raw_response = response.text.strip()

        # Extract JSON safely
        match = re.search(r"\{.*\}", raw_response, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        else:
            return {
                "ats_score": 0,
                "missing_skills": [],
                "suggestions": [" Could not parse Gemini response"],
                "summary": "Invalid JSON format from Gemini"
            }

    except Exception as e:
        return {
            "ats_score": 0,
            "missing_skills": [],
            "suggestions": [f"API error: {str(e)}"],
            "summary": "Failed to contact Gemini API"
        }
