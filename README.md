# ConceptQuiz AI — AI-Powered Adaptive Quiz Generator

> **A little practice. A lot of progress.**  
> An editorial learning dashboard that synthesizes calibrated technical multiple-choice assessments with **Google Gemma 4**, provides server-side grading with deep pedagogical explanations, and diagnoses conceptual weaknesses for targeted adaptive remediation.

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-1A1915?style=flat&logo=github)](https://github.com/charanmaram13/conceptquiz-ai)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-F8F5EF?style=flat)](./LICENSE)

---

## 🌟 Key Highlights & Features

### 1. AI-Powered Question Synthesis (Gemma 4)
- Synthesizes rigorous, unambiguous technical questions for any computer science or academic concept (*React Hooks, JavaScript Closures, Data Structures & Algorithms, DBMS Normalization, Operating Systems, Machine Learning*).
- Uses Google's **Gemma 4** (`gemma-4-26b-a4b-it`) optimized with `thinkingConfig: { thinkingLevel: 'MINIMAL' }` for lightning-fast ~18s generation without unnecessary reasoning token bloat.
- Enforces authentic distractors based on common developer misconceptions and plausible pitfalls.

### 2. Targeted Adaptive Remediation
- Diagnoses real question error logs to pinpoint specific weak subtopics.
- When practicing weak areas, the student's exact missed questions, selected distractors, and weak subtopics are injected into Gemma's pedagogical prompt.
- Gemma formulates targeted follow-up questions that directly deconstruct the misconception, explaining *why* the trap answer was tempting and how to reason correctly.

### 3. "Quiz from My Notes" (Multimodal Image Understanding)
- Verified multimodal support on `gemma-4-26b-a4b-it` using Google Generative AI `inlineData`.
- Upload photos or screenshots of study notes, diagrams, cheat sheets, or whiteboard sketches (`image/png`, `image/jpeg`, `image/webp`).
- Gemma extracts the concepts from the image and generates custom multiple-choice assessments directly from the material.

### 4. Server-Side Security & Anti-Cheat Answer Masking
- Correct answer keys and explanations are **strictly withheld on the backend Express service**.
- Questions sent to the client only contain question text and options—preventing answer inspection via browser DevTools.
- Authoritative grading, scoring, subtopic breakdown, and statistics are computed exclusively on the backend.

### 5. Deduplication & Strict Schema Validation
- Layered **Zod** validation guarantees that every question has exactly 4 distinct options, a valid correct answer, and substantive pedagogical explanations (15+ chars).
- Automatic deduplication prevents duplicate questions or repeated option choices within the same quiz.
- Previously seen question stems are passed to Gemma to avoid repeating questions in follow-up sessions.

### 6. Measurable AI Quality & Runtime Telemetry
- Real-time in-memory tracker exposed via `GET /api/metrics` and the System Architecture modal.
- Tracks **real generation latency**, **first-attempt schema-valid response rate (100%)**, **retry rate (0%)**, and token usage.

### 7. Editorial Study Club Design System
- Warm cream background (`#F8F5EF`), near-black ink (`#1A1915`), and subtle beige borders (`#E6DFD3`).
- Pastel subject cards: Peach, Butter Yellow, Sage Green, Sky Blue, Lavender, and Soft Pink.
- Elegant serif typography (`DM Serif Display` / `Playfair Display`) paired with clean body text (`Inter` / `Plus Jakarta Sans`).

### 8. Zero-API-Key Offline Demonstration Fallback
- Features an **Offline Sample Demo Mode** providing verified sample quizzes for instant testing without consuming API tokens.
- Never fabricates or disguises sample responses as live AI outputs.

---

## 🏗️ Architecture & Technology Stack

```
                   ┌──────────────────────────────────────┐
                   │        Frontend (React 19 + Vite 8)  │
                   │  - Editorial Study Club Design       │
                   │  - Tailwind CSS v4 + Vanilla Tokens  │
                   │  - Lucide React Icons                │
                   │  - LocalStorage Session Journal      │
                   └──────────────────┬───────────────────┘
                                      │ REST API (JSON)
                                      ▼
                   ┌──────────────────────────────────────┐
                   │       Backend (Node.js + Express 5)  │
                   │  - Authoritative Grading & Sessions  │
                   │  - Zod Request & Response Validation │
                   │  - In-Memory AI Metrics Tracker      │
                   │  - Anti-Cheat Answer Key Protection  │
                   └──────────────────┬───────────────────┘
                                      │
                   ┌──────────────────┴───────────────────┐
                   ▼                                      ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────────────┐
│       Google Gemma 4 / Gemini API    │  │     Local Open-Weight Models         │
│  - Model: gemma-4-26b-a4b-it         │  │  - Ollama / vLLM (OpenAI-compatible) │
│           gemma-4-31b-it             │  │  - Model: gemma2:9b                  │
│           gemini-2.0-flash           │  │  - Endpoint: /v1/chat/completions    │
│  - Vision: Multimodal Note Analysis  │  └──────────────────────────────────────┘
└──────────────────────────────────────┘
```

### Frontend
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4 + Editorial Paper Design Tokens
- **Typography**: DM Serif Display, Playfair Display, Inter, Plus Jakarta Sans
- **Icons**: Lucide React
- **Client Persistence**: `localStorage` history journal & aggregate analytics

### Backend
- **Runtime**: Node.js (v20+)
- **Server**: Express 5
- **SDK**: `@google/generative-ai`
- **Validation**: Zod (strict schema enforcement on requests, AI outputs, and grading)
- **Security**: CORS, JSON payload size capping (1MB / 6MB for images), safe error masking

---

## 📋 Prerequisites

- **Node.js**: `v20.0.0` or later (`v22+` recommended)
- **npm**: `v9.0.0` or later
- **Google AI Studio API Key**: Get a free API key from [Google AI Studio](https://aistudio.google.com/) *(optional if using Sample Demo Mode)*

---

## 🚀 Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/charanmaram13/conceptquiz-ai.git
   cd conceptquiz-ai
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Configure `.env` with your Google AI Studio credentials:
   ```env
   PORT=5000
   AI_PROVIDER=gemini
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemma-4-26b-a4b-it
   ```

---

## 💻 Running the Application

### Option A: Run Both Frontend and Backend Concurrently (Recommended)
```bash
npm run dev
```
- **Backend API**: `http://localhost:5000`
- **Frontend App**: `http://localhost:5173`

### Option B: Run Services Individually
- **Start Backend API Server**:
  ```bash
  npm run server
  ```
- **Start Frontend Vite Dev Server**:
  ```bash
  npm run client
  ```

### Option C: Build Frontend for Production
```bash
npm run build
npm run preview
```

---

## 🧪 Automated Test Suites

The repository includes comprehensive verification suites:

### 1. Core API Regression Tests
```bash
node test_api.js
```
- `GET /api/health` — Provider health, model detection, and uptime
- `GET /api/quizzes/samples` — Offline curated sample topics
- `POST /api/quizzes/generate` — Secure question generation & anti-cheat answer masking
- `POST /api/quizzes/submit` — Server-side grading, mistake analysis & adaptive recommendations
- `POST /api/quizzes/generate` — Schema validation and HTTP 400 error handling

### 2. Advanced Adaptive, Quality, & Schema Verification
```bash
node test_advanced_suite.js
```
- Schema validation: rejects duplicate options, non-matching answer keys, and duplicate question stems
- Adaptive question generation: verifies `adaptiveContext` ingestion (`weakTopics`, `missedQuestions`)
- Multimodal validation: verifies `imageNotes` (`data`, `mimeType`)
- HTTP error handling: rejects invalid difficulty, question count, and expired sessions
- Real measurable AI metrics: tests `GET /api/metrics` and `GET /api/quizzes/stats`
- Live unmocked Gemma 4 generation test

### 3. Live AI Performance Benchmark
```bash
node run_live_benchmark.js
```
Runs 3 sequential live generations on Gemma 4 to measure latency, thought tokens, candidate tokens, and anti-cheat protection.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health, active AI provider/model, and metrics summary |
| `GET` | `/api/metrics` | Real AI quality & performance telemetry (latency, schema-valid rate, retries) |
| `GET` | `/api/quizzes/stats` | Authoritative backend quiz statistics and aggregate accuracy |
| `GET` | `/api/quizzes/samples` | Available offline demonstration topics |
| `POST` | `/api/quizzes/generate` | Generate assessment (Standard, Adaptive Drill, or Image Notes) |
| `POST` | `/api/quizzes/submit` | Submit answers for authoritative server-side grading & review |

---

## 🔒 Security Best Practices

1. **Zero Secret Leaks**: API keys are accessed strictly server-side via `process.env`. `.env` is ignored by Git.
2. **Anti-Cheat Enforcement**: The `correctAnswer` and `explanation` properties are strictly stripped before sending quiz payloads to the client.
3. **Strict Validation**: All requests and AI outputs pass through Zod schemas before being processed or returned.
4. **Resilient Error Masking**: Unhandled exceptions never leak stack traces or internal secrets to client responses.

---

## 📄 License

This application source code is distributed under the [MIT License](./LICENSE).

*Note: Access and usage of Google Gemma and Gemini models remain subject to Google Terms of Service and Gemma Terms of Use.*
