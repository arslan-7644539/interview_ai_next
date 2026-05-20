# AI-Powered Mock Interview Hub (Prep Portal)

An interactive, voice-enabled web application built with **Next.js (App Router)**, **Tailwind CSS v4.0**, and **LangChain + Google Gemini API**. This portal allows candidates to practice mock interviews in real-time, speak answers naturally via their microphone, receive instant AI feedback per question, and get a comprehensive scorecard/report upon completion.

---

## 🚀 Features

- **Multi-Domain Practice Panels:** Pre-configured boards for Software Engineering (JavaScript, React, Node.js, Python, Java, SQL, System Design, DSA), Medicine, Military, CSS, Behavioral/HR, and a Universal Handler for custom topics.
- **RAG-Enhanced Question Generator:** Utilizes an in-memory domain knowledge injection system to craft relevant, realistic questions adjusted for difficulty (Entry Level, Mid-Level, Senior/Lead).
- **Voice-Enabled Interview Experience:**
  - **Speech-to-Text (STT):** Dictate responses naturally using standard Web Speech API integration.
  - **Text-to-Speech (TTS):** The AI interviewer reads questions and feedback aloud to simulate a real conversation.
- **Technical Speech Normalizer:** Automatically corrects phonetic transcription errors common in voice recognizers (e.g., mapping "use effect" to `useEffect`, "promise dot all" to `Promise.all`).
- **Real-Time Assessment:** Generates immediate feedback scores (out of 10) with constructive analysis for each response.
- **Comprehensive Grade Reports:** Provides overall grades (A+ to F), scoring percentages, domain accuracy metrics, key strengths, areas for improvement, actionable study recommendations, and a detailed question-by-question response log.

---

## 🛠️ Technology Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, React 19)
- **Styling:** [Tailwind CSS v4.0](https://tailwindcss.com/) & Vanilla CSS ([src/app/globals.css](file:///c:/Users/Arslan/Desktop/interview_ai_next/src/app/globals.css))
- **AI Orchestration:** [LangChain](https://js.langchain.com/) (`@langchain/google-genai` & `@langchain/core`)
- **Model:** `gemini-2.0-flash`
- **UI Icons:** `react-icons`
- **Notifications:** `react-hot-toast`
- **HTTP Client:** `axios`

---

## 📂 Project Architecture

```text
interview_ai_next/
├── src/
│   ├── app/                      # Next.js App Router Pages & API Routes
│   │   ├── api/
│   │   │   └── interview/
│   │   │       ├── evaluate/     # POST: Individual response evaluator
│   │   │       ├── generate/     # POST: Tailored question generator
│   │   │       └── report/       # POST: Final coaching report compiler
│   │   ├── interview/            # Interactive voice assessment page
│   │   │   └── page.js
│   │   ├── report/               # Final scorecard and log page
│   │   │   └── page.js
│   │   ├── globals.css           # Styling rules & custom classes
│   │   ├── layout.js             # Root application wrapper
│   │   └── page.js               # Mock Interview Hub Landing Page
│   └── services/
│       ├── aiService.js          # LangChain orchestrator (Gemini APIs & fallbacks)
│       ├── knowledgeBase.js      # Topic/Domain mapping & contextual keywords
│       └── speechNormalizer.js   # Phonetic dictionary for speech-to-text corrections
├── .env                          # Local environment settings & API keys
├── package.json                  # Script definitions and package configurations
└── README.md                     # Documentation
```

- **Landing Page:** [src/app/page.js](file:///c:/Users/Arslan/Desktop/interview_ai_next/src/app/page.js)
- **Interview Simulator:** [src/app/interview/page.js](file:///c:/Users/Arslan/Desktop/interview_ai_next/src/app/interview/page.js)
- **Evaluation Report:** [src/app/report/page.js](file:///c:/Users/Arslan/Desktop/interview_ai_next/src/app/report/page.js)
- **AI Service:** [src/services/aiService.js](file:///c:/Users/Arslan/Desktop/interview_ai_next/src/services/aiService.js)
- **Knowledge Base:** [src/services/knowledgeBase.js](file:///c:/Users/Arslan/Desktop/interview_ai_next/src/services/knowledgeBase.js)
- **Speech Normalizer:** [src/services/speechNormalizer.js](file:///c:/Users/Arslan/Desktop/interview_ai_next/src/services/speechNormalizer.js)

---

## ⚙️ Installation & Configuration

### Prerequisites
- **Node.js** (v18.x or higher recommended)
- **Gemini API Key:** Obtain an API key from [Google AI Studio](https://aistudio.google.com/).

### 1. Clone & Install
```bash
# Navigate to project directory
cd interview_ai_next

# Install dependencies
npm install
```

### 2. Configure Environment Variables
Create or edit the `.env` file in the root directory and add your Gemini API Key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🧩 How It Works Under the Hood

### 1. Dynamic Question Generation ([aiService.js](file:///c:/Users/Arslan/Desktop/interview_ai_next/src/services/aiService.js))
When an interview is initiated, the application calls `generateQuestions()`. If a Gemini API Key is configured, it retrieves domain context and terms from [knowledgeBase.js](file:///c:/Users/Arslan/Desktop/interview_ai_next/src/services/knowledgeBase.js), binds it into the System prompt, and requests a JSON-formatted list of questions from `gemini-2.0-flash`. If the API key is not available, it selects randomly from pre-defined mock question templates.

### 2. Live Evaluation ([aiService.js](file:///c:/Users/Arslan/Desktop/interview_ai_next/src/services/aiService.js))
As each answer is submitted:
1. The transcript is passed through `normalizeTranscript()` (in [speechNormalizer.js](file:///c:/Users/Arslan/Desktop/interview_ai_next/src/services/speechNormalizer.js)) to correct common audio transcription mistakes (such as converting technical terminology to standard casing/format).
2. The corrected answer is sent to `evaluateAnswer()`, which prompts Gemini to score the answer (0-10) and provide constructive feedback.
3. If the candidate explicitly expresses a lack of knowledge/understanding (e.g., "I don't know", "skip this", "please repeat"), the system assigns a `0` score with helpful study pointers instead of trying to evaluate it as a partial response.

### 3. Coaching Report Generation ([aiService.js](file:///c:/Users/Arslan/Desktop/interview_ai_next/src/services/aiService.js))
After all questions are answered, `generateReport()` evaluates the list of responses. It compiles statistics (grades, scores, and accuracy percentages) and prompts Gemini to identify the candidate's core strengths, weaknesses, and actionable study advice.
