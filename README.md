# StudySphere AI

## Setup

### 1. Backend
```bash
cd backend
# Edit .env — set MONGO_URI and JWT_SECRET
npm run dev
```

### 2. AI Service
```bash
cd ai-service
pip install -r requirements.txt
# Edit .env — set GEMINI_API_KEY
uvicorn main:app --reload --port 8000
```

### 3. Frontend
```bash
cd frontend
npm run dev
```

Open http://localhost:5173

## Environment Variables

**backend/.env**
```
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/studysphere
JWT_SECRET=change_this_to_a_long_random_string
AI_SERVICE_URL=http://localhost:8000
PORT=5000
```

**ai-service/.env**
```
GEMINI_API_KEY=your_gemini_api_key
```
