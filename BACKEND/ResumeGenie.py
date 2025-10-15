import os
import json
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError(" Missing GEMINI_API_KEY in environment variables")

genai.configure(api_key=API_KEY)

def call_gemini(prompt: str):
    """
    Calls the Gemini API to get an ATS analysis and returns a JSON object.
    """
    system_instruction = (
        "You are an expert Applicant Tracking System (ATS). Analyze the provided resume "
        "against the job description. Respond ONLY in valid JSON format with the keys: "
        "'ats_score', 'missing_skills', 'suggestions', and 'summary'."
    )

    try:
       
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            system_instruction=system_instruction
        )

        
        generation_config = genai.GenerationConfig(
            response_mime_type="application/json"
        )

       
        response = model.generate_content(
            prompt,
            generation_config=generation_config
        )

       
        return json.loads(response.text)

    except Exception as e:
        print(f"An error occurred: {e}")
        return {
            "ats_score": 0,
            "missing_skills": [],
            "suggestions": [f"API or processing error: {str(e)}"],
            "summary": "Failed to get a valid response from the Gemini API."
        }
