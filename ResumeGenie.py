# resumegenie.py
import os, requests, json, re
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("OPENROUTER_API_KEY")
BASE_URL = "https://openrouter.ai/api/v1/chat/completions"

if not API_KEY:
    raise ValueError("❌ Missing OPENROUTER_API_KEY in environment variables")

def call_openrouter(prompt, model="openai/gpt-3.5-turbo"):
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost",
        "X-Title": "ResumeGenie API"
    }

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You are an ATS. Respond ONLY in JSON."},
            {"role": "user", "content": prompt}
        ]
    }

    try:
        response = requests.post(BASE_URL, headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        raw_response = response.json()["choices"][0]["message"]["content"]

        import re, json
        match = re.search(r"\{.*\}", raw_response, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        else:
            return {
                "ats_score": 0,
                "missing_skills": [],
                "suggestions": [],
                "summary": "⚠️ Could not parse AI response"
            }
    except requests.exceptions.RequestException as e:
        return {
            "ats_score": 0,
            "missing_skills": [],
            "suggestions": [f"API error: {str(e)}"],
            "summary": "Failed to contact OpenRouter"
        }
