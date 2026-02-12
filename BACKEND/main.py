from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PyPDF2 import PdfReader
import docx
import os
import asyncio
from concurrent.futures import ThreadPoolExecutor
from ResumeGenie import call_gemini  # blocking Gemini call

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://resumegenieai.careerprep.tech"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


executor = ThreadPoolExecutor(max_workers=5)  

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

    return text.replace('"', "'")  

API_KEY = os.getenv("GEMINI_API_KEY")

@app.get("/")
def read_root():
    return {"status": "FastAPI + Gemini API is working!"}

@app.get("/ping")
def ping():
    return {"status": "awake"}


async def run_gemini_async(prompt: str):
    """
    Run the blocking Gemini API call in a thread executor to prevent blocking FastAPI.
    """
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(executor, call_gemini, prompt)

@app.post("/optimize")
async def optimize_resume(resume: UploadFile, jobDesc: str = Form(...)):
    try:
        if not API_KEY:
            return JSONResponse({"error": "Missing GEMINI_API_KEY in environment"}, status_code=500)

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

        # Run Gemini asynchronously
        result = await run_gemini_async(prompt)
        return JSONResponse(result)

    except Exception as e:
        return JSONResponse({"error": f"Error processing resume: {str(e)}"}, status_code=500)
