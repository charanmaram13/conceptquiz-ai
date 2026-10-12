# ConceptQuiz AI

## Team / attendee
- Name: Charan Maram
- GitHub: [@charanmaram13](https://github.com/charanmaram13)

## Challenge
- Category: Best Use of Gemma 4

## Project links
- Repository: [https://github.com/charanmaram13/conceptquiz-ai](https://github.com/charanmaram13/conceptquiz-ai)
- Live demo: [https://conceptquiz-ai.vercel.app](https://conceptquiz-ai.vercel.app/)
- License: [https://github.com/charanmaram13/conceptquiz-ai/blob/main/LICENSE](https://github.com/charanmaram13/conceptquiz-ai/blob/main/LICENSE)

## Problem and solution
Passive reading and traditional flashcards often create an illusion of competence, leaving students unaware of subtle conceptual gaps until high-stakes exams. Standard automated multiple-choice generators frequently produce superficial recall questions with obvious distractors, failing to test actual comprehension or explain why misconceptions fail.

ConceptQuiz AI solves this by transforming any topic, subject, or handwritten study notes into targeted diagnostic quizzes powered by Gemma 4 (`gemma-4-26b-a4b-it`). Instead of generic trivia, the system generates plausible, misconception-based distractors, enforces authoritative server-side grading with anti-cheat protection, isolates weak subtopics, and dynamically creates targeted adaptive follow-up assessments with comprehensive pedagogical explanations.

## Approach and technologies
- **Frontend**: React 19, Vite 8, Tailwind CSS, Lucide React, and Canvas Confetti. Built with an Editorial Study Club design system featuring a warm cream palette (`#F8F5EF`), serif headings (`DM Serif Display`), and accessible responsive controls.
- **Backend**: Node.js and Express 5 REST API with CORS and structured environment configuration.
- **AI Integration**: Google Generative AI SDK (`@google/generative-ai`) calling `gemma-4-26b-a4b-it` with temperature tuning (`0.15`), strict JSON output enforcement (`application/json`), and minimal thinking latency (`thinkingLevel: 'MINIMAL'`).
- **Validation & Anti-Cheat**: Zod schema validation rigorously verifies all generated question options for uniqueness, schema compliance, and answer consistency. To prevent client inspection cheating, correct answers and explanations are held securely on the Express backend session store (with a 2-hour TTL) and revealed only after authoritative grading upon submission.
- **Observability**: Authoritative backend quiz analytics and real-time AI metrics tracking latency, schema compliance rates, and retries.

## Challenge evidence

### Best Use of Gemma 4
- Model used: `gemma-4-26b-a4b-it` via Google Generative AI SDK (`@google/generative-ai`) / Gemini API
- Integration code: [https://github.com/charanmaram13/conceptquiz-ai/blob/main/server/services/aiProvider.js#L277-L446](https://github.com/charanmaram13/conceptquiz-ai/blob/main/server/services/aiProvider.js#L277-L446)
- Why Gemma 4:
  - **Structured Diagnostic Reasoning**: Gemma 4 (`gemma-4-26b-a4b-it`) excels at adhering to strict JSON output structures with minimal reasoning latency (~18–23s for 5 comprehensive questions), generating realistic distractor options that reflect authentic student misconceptions rather than trivial falsehoods.
  - **Multimodal Visual Learning**: Gemma 4 natively parses handwritten study notes and architecture diagrams via inline base64 image data (`image/png`, `image/jpeg`, `image/webp`), allowing learners to upload visual notebook snapshots and immediately receive diagnostic questions extracted from their own diagrams.
  - **Targeted Adaptive Practice**: Gemma 4 takes context from previous assessment mistakes—specifically the student's selected wrong option and weak subtopic tags—to generate non-repetitive follow-up questions specifically crafted to remediate the diagnosed misunderstanding with detailed pedagogical feedback.

## Current status
- What works:
  - Live AI Quiz Generation using verified `gemma-4-26b-a4b-it` for custom concepts across Beginner, Intermediate, and Advanced difficulties.
  - Multimodal "Quiz from My Notes" diagram and handwritten notes ingestion via Gemma 4 vision.
  - Authoritative server-side grading and anti-cheat mechanism (correct answers and explanations are completely withheld from client payloads during quiz taking).
  - Diagnostic results breakdown displaying score, strong topics, identified weak areas, and question-by-question pedagogical explanations.
  - One-click targeted adaptive practice targeting weak areas and past mistakes.
  - Offline Sample Demo Mode with curated pre-computed quizzes for instant testing without an API key.
  - Real-time AI performance monitoring (`GET /api/metrics`) tracking generation duration, retry rates, and schema validity.
  - LocalStorage quiz history and dashboard statistics (quizzes completed, average score, concepts mastered, study streak).
  - Passing automated test suites (5 backend API tests, 15 advanced verification tests).
- Limitations:
  - Active quiz sessions are maintained in an in-memory server Map with automatic 2-hour TTL cleanup rather than an external database, which is optimal for hackathon deployment but clears upon server restarts.
  - Generation latency averages ~20–23 seconds per 5 questions due to structured pedagogical output generation.
  - Image upload currently accepts single-image notes up to 4MB.
- What's next:
  - Spaced repetition scheduling based on the SM-2 algorithm for long-term retention.
  - Persistent user accounts and progress analytics backed by PostgreSQL and Prisma.
  - Multi-image note batch processing and PDF syllabus ingestion.
  - Peer quiz sharing and collaborative study challenges.

## Submission checklist
Replace the placeholders above. Do NOT include markdown checkboxes in your file.
- Submitted before the event deadline
- Built during the 2-hour hack day window
- Public repository with an open-source license
- Correct category selected
- Gemma 4 integration code linked (if entering Gemma 4 challenge)
- Live demo accessible (if applicable)
