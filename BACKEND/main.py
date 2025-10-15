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
    allow_origins=["https://resumegenie-ai.vercel.app"],
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
def read_root():
    return {"status": "FastAPI is working!"}
@app.post("/optimize")
async def optimize_resume(resume: UploadFile, jobDesc: str = Form(...)):
    try:
        if not API_KEY:
            return JSONResponse({"error": "Missing OpenRouter API key"}, status_code=500)

        resume_text = extract_text(resume)

        prompt = f"""
        You are simulating an advanced Applicant Tracking System (ATS) used by top tech companies.

        Evaluate how well the following resume matches the given job description.

        Job Description:
        {jobDesc}

        Resume:
        {resume_text}

        Respond strictly in valid JSON format with the following keys:
        {{
          "ats_score": number (0-100),
          "missing_skills": ["list of strings"],
          "suggestions": ["list of strings"],
          "summary": "string"
        }}

        """

        result = call_openrouter(prompt)
        return JSONResponse(result)

    except Exception as e:
        return JSONResponse({"error": f"Error processing resume: {str(e)}"}, status_code=500)
