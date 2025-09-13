from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PyPDF2 import PdfReader
import docx
from ResumeGenie import call_openrouter   # lowercase filename!
import os
app = FastAPI()

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_text(file: UploadFile) -> str:
    filename = file.filename.lower()
    text = " "

    if filename.endswith(".pdf"):
        file.file.seek(0)
        pdf = PdfReader(file.file)
        text = "\n".join([page.extract_text() or "" for page in pdf.pages])
    elif filename.endswith(".docx"):
        file.file.seek(0)
        document = docx.Document(file.file)
        text = "\n".join([para.text for para in document.paragraphs])
    elif filename.endswith(".txt"):
        file.file.seek(0)
        text = file.file.read().decode("utf-8")

    # Clean quotes 
    text = text.replace('"', "'")
    return text

API_KEY = os.getenv("OPENROUTER_API_KEY")

@app.get("/")
d
    except Exception as e:
        return JSONResponse({"error": f"Error processing resume: {str(e)}"}, status_code=500)
