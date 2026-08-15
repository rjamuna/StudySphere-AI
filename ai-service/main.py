import os, json, re
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from groq import Groq
import fitz
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"

app = FastAPI(title="StudySphere AI Service")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

def generate(prompt: str) -> str:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=4096,
    )
    return response.choices[0].message.content

def extract_json(text: str):
    match = re.search(r'```(?:json)?\s*([\s\S]*?)```', text)
    raw = match.group(1) if match else text
    return json.loads(raw.strip())

# ── AI Tutor ──────────────────────────────────────────────────────────────────
class TutorRequest(BaseModel):
    message: str
    history: list = []

@app.post("/tutor/chat")
async def tutor_chat(req: TutorRequest):
    messages = [{"role": "system", "content": "You are StudySphere AI Tutor, a helpful and friendly study assistant. Respond clearly and helpfully. Use markdown formatting."}]
    for m in req.history[-6:]:
        messages.append({"role": m["role"] if m["role"] != "assistant" else "assistant", "content": m["content"]})
    messages.append({"role": "user", "content": req.message})
    response = client.chat.completions.create(model=MODEL, messages=messages, temperature=0.7, max_tokens=2048)
    return {"reply": response.choices[0].message.content}

# ── Quiz Generator ────────────────────────────────────────────────────────────
class QuizRequest(BaseModel):
    topic: str
    numQuestions: int = 5
    type: str = "mcq"

@app.post("/quiz/generate")
async def generate_quiz(req: QuizRequest):
    prompt = f"""Generate {req.numQuestions} {req.type} questions about "{req.topic}".
Return ONLY valid JSON:
```json
{{
  "questions": [
    {{
      "question": "...",
      "type": "{req.type}",
      "options": ["Full option text A", "Full option text B", "Full option text C", "Full option text D"],
      "answer": "Full option text A"
    }}
  ]
}}
```
CRITICAL RULES:
- "answer" MUST be the EXACT full text of the correct option, copied verbatim from the options array.
- Do NOT use letters like "A", "B", "C". Use the full option string.
- For truefalse: options = ["True", "False"], answer = "True" or "False".
- For fillin: options = [], answer = the expected answer string."""
    return extract_json(generate(prompt))

# ── Roadmap Generator ─────────────────────────────────────────────────────────
class RoadmapRequest(BaseModel):
    goal: str
    skillLevel: str
    dailyHours: float
    targetDate: Optional[str] = None

@app.post("/roadmap/generate")
async def generate_roadmap(req: RoadmapRequest):
    prompt = f"""Create a detailed learning roadmap for:
Goal: {req.goal}
Current Level: {req.skillLevel}
Daily Study Hours: {req.dailyHours}
Target Date: {req.targetDate or 'flexible'}

Return ONLY valid JSON:
```json
{{
  "overview": "brief summary",
  "totalWeeks": 12,
  "phases": [
    {{
      "phase": 1,
      "title": "Phase title",
      "duration": "4 weeks",
      "goals": ["goal1", "goal2"],
      "topics": ["topic1", "topic2"],
      "projects": ["project1"],
      "resources": ["resource1"],
      "milestones": ["milestone1"]
    }}
  ],
  "weeklyPlan": [
    {{ "week": 1, "focus": "...", "tasks": ["task1", "task2"] }}
  ]
}}
```"""
    return extract_json(generate(prompt))

# ── PDF Processing ────────────────────────────────────────────────────────────
@app.post("/pdf/process")
async def process_pdf(pdf: UploadFile = File(...)):
    content = await pdf.read()
    doc = fitz.open(stream=content, filetype="pdf")
    text = "\n".join(page.get_text() for page in doc)
    if len(text) > 12000:
        text = text[:12000]

    prompt = f"""Analyze this document and return ONLY valid JSON:
```json
{{
  "summary": "2-3 paragraph summary",
  "keyPoints": ["point1", "point2", "point3", "point4", "point5"],
  "flashcards": [
    {{ "front": "question/term", "back": "answer/definition" }}
  ],
  "topics": ["topic1", "topic2"]
}}
```
Document:
{text}"""
    result = extract_json(generate(prompt))
    result["textContent"] = text[:5000]
    return result

class PDFAskRequest(BaseModel):
    question: str
    context: str

@app.post("/pdf/ask")
async def ask_pdf(req: PDFAskRequest):
    prompt = f"""Based on this document content, answer the question clearly.
Document: {req.context[:6000]}
Question: {req.question}
Answer using only information from the document. Use markdown."""
    return {"answer": generate(prompt)}

# ── Study Planner AI ──────────────────────────────────────────────────────────
class PlannerRequest(BaseModel):
    tasks: list
    studyHours: float = 4

@app.post("/planner/suggest")
async def suggest_schedule(req: PlannerRequest):
    tasks_text = "\n".join([f"- {t.get('title')} (due: {t.get('dueDate', 'flexible')}, priority: {t.get('priority', 'medium')})" for t in req.tasks])
    prompt = f"""Given these study tasks and {req.studyHours} hours/day, suggest an optimized daily schedule.
Tasks:
{tasks_text}
Return ONLY valid JSON:
```json
{{
  "schedule": [
    {{ "time": "9:00 AM", "task": "task name", "duration": "1 hour", "tip": "study tip" }}
  ],
  "advice": "general study advice"
}}
```"""
    return extract_json(generate(prompt))
