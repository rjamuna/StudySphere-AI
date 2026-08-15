# 🚀 StudySphere AI

## Personalized AI Learning Assistant

> **Learn smarter. Stay ahead.**

StudySphere AI is an AI-powered learning platform designed to help students manage their complete learning journey in one place.

Instead of using separate tools for AI assistance, PDF learning, quizzes, roadmaps, study planning and progress tracking, StudySphere AI brings these features together into one personalized learning platform.

---

# 🏆 Hackathon

**International Hackathon Competition 2026**

**Theme:** Open Innovation  
**Category:** Software Development  
**Project:** StudySphere AI  
**Participant:** Jamuna

---

# 🎯 Problem Statement

Students have access to a large amount of learning content, but managing everything can become difficult.

Students often struggle with:

- Knowing what to study next
- Creating a proper learning plan
- Understanding difficult topics
- Learning from large PDF documents
- Practicing with useful questions
- Managing study tasks and deadlines
- Identifying weak topics
- Tracking their overall learning progress

Using separate applications for each activity can make the learning process scattered and difficult to manage.

---

# 💡 Our Solution

**StudySphere AI** brings the complete learning journey into one platform.

It works as a personalized AI study assistant that helps students:

**Learn → Plan → Practice → Track → Improve**

The platform combines AI tutoring, PDF analysis, personalized roadmaps, quizzes, study planning, progress tracking and learning history.

The goal is to make studying more organized, personalized and easier to follow.

---

# ✨ Key Features

## 🤖 AI Tutor

Students can ask questions and receive clear, student-friendly explanations.

The AI Tutor also maintains recent conversation context so students can continue their learning naturally.

---

## 📄 PDF Intelligence

Students can upload study materials and use AI to understand them faster.

The system can generate:

- Summary
- Key points
- Flashcards
- Topics
- Document-based questions and answers

---

## 🗺️ AI Learning Roadmap

Students can provide:

- Learning goal
- Current skill level
- Available study hours
- Target date

The AI generates a structured learning roadmap with topics, goals, projects, resources and milestones.

---

## 📝 AI Quiz Generator

Students can generate quizzes based on a selected topic.

The system supports different question types and helps students practice what they have learned.

---

## 📅 Smart Study Planner

Students can provide their study tasks, priorities and available study time.

The AI suggests an organized study schedule to help manage learning tasks more effectively.

---

## 📊 Progress Tracking

Students can monitor their learning activity and progress.

The platform can track information such as:

- Quiz performance
- Completed tasks
- Study activity
- Learning progress
- Topics studied

---

## 💬 Chat History

Previous AI Tutor conversations are stored and organized so students can easily revisit earlier discussions.

Students can move between previous conversations instead of starting from the beginning every time.

---

## 👤 Student Profile

The profile section provides a central place to view:

- Learning activity
- Study statistics
- Progress
- Quiz performance
- Personal learning information

---

## 🧠 Study Risk Predictor

StudySphere AI can use learning signals such as:

- Quiz performance
- Task completion
- Study consistency
- Upcoming learning goals

to identify areas that may need more attention.

The system can then suggest targeted revision or practice.

---

# 🔄 How StudySphere AI Works

```text
                    STUDENT
                       │
                       ▼
                Set Learning Goal
                       │
                       ▼
                AI Understands
                       │
                       ▼
            Personalized Roadmap
                       │
                       ▼
              Learn & Practice
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
          AI Tutor             Quizzes
             │                   │
             └─────────┬─────────┘
                       ▼
                Track Progress
                       │
                       ▼
               Identify Weak Areas

🏗️ System Architecture
┌───────────────────────────────────────┐
│              FRONTEND                 │
│          React + Vite                 │
└──────────────────┬────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────┐
│               BACKEND                 │
│        Node.js + Express.js            │
│              REST APIs                 │
└───────────────┬───────────────┬───────┘
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
                            │ / AI API    │
                            └─────────────┘
🛠️ Technology Stack
Frontend
React
Vite
JavaScript
CSS
Responsive UI
Backend
Node.js
Express.js
REST API
Mongoose
AI Service
Python
FastAPI
Google GenAI API
Database
MongoDB
MongoDB Atlas
PDF Processing
PyMuPDF
PDF text extraction
AI document analysis
Development Tools
Git
GitHub
VS Code
Postman
📁 Project Structure
StudySphere-AI/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── src/
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
                       │
                       ▼
              Recommend Next Step
                       │
                       ▼
             Continuous Learning
