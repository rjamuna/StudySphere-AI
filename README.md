# 🚀 StudySphere AI

## Personalized AI Learning Assistant

> **Learn smarter. Stay ahead.**

StudySphere AI is an AI-powered learning platform designed to help students manage their complete learning journey in one place.

It combines AI tutoring, PDF intelligence, personalized learning roadmaps, quizzes, study planning, progress tracking, chat history, and learning insights into a single platform.

---

## 🏆 International Hackathon Competition 2026

**Hackathon:** International Hackathon Competition 2026  
**Theme:** Open Innovation  
**Category:** Software Development  
**Project:** StudySphere AI  
**Participant:** Jamuna

---

## 🎯 Problem Statement

Students have access to a huge amount of educational content, but managing their learning journey can be difficult.

Students commonly face problems such as:

- Finding what to study next
- Creating a structured learning plan
- Understanding difficult topics
- Learning efficiently from large PDF documents
- Practicing with relevant questions
- Managing study tasks and deadlines
- Identifying weak topics
- Tracking learning progress
- Revisiting previous AI conversations

Using different applications for each activity makes the learning process scattered and difficult to manage.

---

## 💡 Our Solution

**StudySphere AI** brings the complete learning journey into one intelligent platform.

The platform helps students:

**Learn → Plan → Practice → Track → Improve**

Instead of functioning only as a question-answer chatbot, StudySphere AI acts as a continuous learning companion that helps students understand what to learn, practice it, monitor progress, identify weak areas, and decide what to focus on next.

---

## ✨ Key Features

### 🤖 AI Tutor
Students can ask questions and receive clear, student-friendly explanations. The tutor maintains recent conversation context so students can continue learning naturally.

### 📄 PDF Intelligence
Students can upload study materials and use AI to generate summaries, key points, flashcards, topics, and document-based questions and answers.

### 🗺️ Personalized AI Roadmap
Students provide their learning goal, current skill level, available study hours, and target date. The AI generates a structured roadmap with phases, topics, projects, resources, and milestones.

### 📝 AI Quiz Generator
Students can generate practice questions based on a selected topic to test understanding and identify areas that need more practice.

### 📅 Smart Study Planner
Students provide tasks, priorities, deadlines, and available study time. The AI recommends an organized study schedule.

### 📊 Progress Tracking
Students can monitor quiz performance, completed tasks, learning activity, study progress, and topics studied.

### 💬 Chat History
Previous AI Tutor conversations are organized so students can easily revisit earlier discussions and continue learning.

### 👤 Student Profile
Students can view learning activity, study statistics, progress, quiz performance, and personal learning information.

### 🧠 Study Risk Predictor
The platform can analyze quiz performance, task completion, study consistency, and upcoming goals to identify areas that may need additional attention.

---

## 🔄 How StudySphere AI Works

    STUDENT
       ↓
    Set Learning Goal
       ↓
    AI Understands Learning Needs
       ↓
    Personalized Roadmap
       ↓
    Learn + Practice
       ↓
    ┌───────────────┐
    │               │
    ↓               ↓
    AI Tutor      Quizzes
    │               │
    └───────┬───────┘
            ↓
      Track Progress
            ↓
     Identify Weak Areas
            ↓
    Recommend Next Step
            ↓
     Continuous Learning

---

## 🏗️ Project Structure

    StudySphere-AI/
    │
    ├── frontend/
    │   ├── src/
    │   │   ├── components/
    │   │   ├── pages/
    │   │   ├── services/
    │   │   ├── hooks/
    │   │   ├── context/
    │   │   └── assets/
    │   ├── public/
    │   ├── package.json
    │   └── ...
    │
    ├── backend/
    │   ├── src/
    │   │   ├── controllers/
    │   │   ├── routes/
    │   │   ├── models/
    │   │   ├── middleware/
    │   │   ├── services/
    │   │   └── server.js
    │   ├── package.json
    │   └── ...
    │
    ├── ai-service/
    │   ├── main.py
    │   ├── requirements.txt
    │   └── ...
    │
    ├── .gitignore
    ├── README.md
    └── ...

---

## 🏗️ System Architecture

    ┌─────────────────────────────────────────┐
    │                 FRONTEND                 │
    │               React + Vite               │
    └────────────────────┬────────────────────┘
                         │
                         ▼
    ┌─────────────────────────────────────────┐
    │                  BACKEND                 │
    │          Node.js + Express.js            │
    │               REST APIs                  │
    └──────────────┬───────────────┬──────────┘
                   │               │
                   ▼               ▼
          ┌────────────────┐  ┌─────────────────┐
          │    MongoDB     │  │   FastAPI AI    │
          │     Atlas      │  │     Service     │
          └────────────────┘  └────────┬────────┘
                                       │
                                       ▼
                                ┌─────────────┐
                                │  AI Model   │
                                │    / API    │
                                └─────────────┘

---

## 🛠️ Technology Stack

### Frontend
- React
- Vite
- JavaScript
- CSS
- Responsive UI

### Backend
- Node.js
- Express.js
- REST APIs
- Mongoose

### AI Service
- Python
- FastAPI
- Google GenAI API

### Database
- MongoDB
- MongoDB Atlas
- Mongoose

### Document Processing
- PyMuPDF
- PDF text extraction
- AI document analysis

### Development Tools
- Git
- GitHub
- VS Code
- Postman

---

## ⚙️ Local Setup

### Prerequisites

- Node.js
- npm
- Python 3
- MongoDB Atlas account
- Git

### Frontend

    cd frontend
    npm install
    npm run dev

### Backend

    cd backend
    npm install
    npm run dev

Create a backend `.env` file:

    PORT=5000
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_secret
    FRONTEND_URL=your_frontend_url
    AI_SERVICE_URL=your_ai_service_url

### AI Service

    cd ai-service
    python -m venv venv

Windows:

    venv\Scripts\activate

Install dependencies:

    pip install -r requirements.txt

Create `.env`:

    GEMINI_API_KEY=your_api_key

Run:

    uvicorn main:app --reload

---

## 🔐 Security

Sensitive credentials must never be committed to GitHub.

Never upload:

- `.env`
- `.env.local`
- `.env.production`
- API keys
- MongoDB passwords
- JWT secrets
- Private tokens
- Credentials

Use environment variables for sensitive configuration.

---

## 🧪 Main User Journey

    Register / Login
          ↓
    Student Dashboard
          ↓
    Set Learning Goal
          ↓
    Generate AI Roadmap
          ↓
    Study with AI Tutor
          ↓
    Upload & Analyze PDFs
          ↓
    Generate Quizzes
          ↓
    Create Study Plan
          ↓
    Track Progress
          ↓
    Review Chat History
          ↓
    Identify Weak Topics
          ↓
    Get Next Learning Recommendation

---

## 🌟 What Makes StudySphere AI Different?

Many AI learning tools mainly follow:

**Question → Answer**

StudySphere AI focuses on a complete learning cycle:

**Question → Learn → Practice → Track → Identify Weakness → Improve → Next Action**

The goal is to transform AI from a simple chatbot into a continuous learning companion.

---

## 🎯 Real-World Impact

StudySphere AI aims to help students:

- Reduce scattered learning
- Organize study activities
- Understand difficult topics
- Create personalized learning plans
- Practice more effectively
- Identify weak areas earlier
- Track their learning journey
- Decide what to focus on next

---

## 🚀 Future Improvements

### 📱 Mobile Learning
Android and iOS applications for learning plans, AI Tutor, quizzes, and progress tracking.

### 🎙️ Voice-Based AI Tutor
Voice input and voice responses for more natural interaction.

### 📅 Calendar Integration
Connect study schedules with calendars, classes, exams, and deadlines.

### 🌐 Multilingual Learning
Support multiple languages for wider accessibility.

### 📊 Advanced Learning Analytics
Show study consistency, topic performance, improvement trends, and learning patterns.

### 👨‍🏫 Teacher Dashboard
Allow teachers to create materials, assign quizzes, monitor progress, and provide support.

### 🏫 Institution Dashboard
Provide institution-level learning analytics for colleges and educational organizations.

### 🤖 Specialized AI Study Agents
Add specialized assistants such as Research Assistant, Coding Tutor, Exam Preparation Assistant, Career Guidance Assistant, and Project Mentor.

### 🔔 Smart Reminders
Generate intelligent reminders based on deadlines, learning activity, and study consistency.

### 📚 Learning Resource Integration
Recommend trusted educational resources based on student goals and skill level.

### 🧠 Adaptive Learning
Automatically adjust roadmap difficulty and recommended topics based on performance.

### 🎯 Personalized Weakness Detection
Detect weak concepts and automatically generate targeted practice.

---


## 🏆 Hackathon Submission

**International Hackathon Competition 2026**

**Theme:** Open Innovation

**Project:** StudySphere AI

**Participant:** Jamuna

StudySphere AI is designed to solve a real-world education problem using artificial intelligence and full-stack web technologies.

---

## 👩‍💻 Creator

### Jamuna

Computer Science & Engineering Student

**Interests:**
- Artificial Intelligence
- Web Development
- Cybersecurity
- Full-Stack Development
- Building practical technology solutions




# 🚀 StudySphere AI

### Learn smarter. Stay ahead.

**International Hackathon Competition 2026**



</div>
