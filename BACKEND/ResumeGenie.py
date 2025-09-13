# resumegenie.py
import os, requests, json, re
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("OPENROUTER_API_KEY")
BASE_URL = "https://openrouter.ai/api/v1/chat/completions"

if not API_KEY:
    raise ValueError("❌ Missing OPENROUTER_API_KEY in environment variables")

