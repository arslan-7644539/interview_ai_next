# AI-Powered Mock Interview Portal — Final Year Project (FYP)

**Project Name:** Prep Portal — AI Mock Interview Hub  
**Student Name:** Arslan  
**Technology:** Next.js, React, Tailwind CSS, LangChain, Google Gemini AI  

---

## 📌 Project Ka Idea Kya Hai? (What is this project?)

Ye ek **AI-based Mock Interview Web Application** hai jo students aur job seekers ko **interview ki practice** karne mein madad karti hai.

**Simple words mein:**  
> User apna field/topic select karta hai (jaise Software Engineering, Banking, CSS/PMS, Teaching etc.), phir AI real interviewer ki tarah **sawalaat generate** karta hai, user apna **jawab bol kar (voice) ya likh kar (text)** deta hai, aur AI **turant score aur feedback** deta hai. End mein ek **full performance report card** bhi milta hai.

---

## ❓ Problem Statement — Ye Project Kyun Banaya?

Pakistan mein bohat se students aur fresh graduates ko interviews mein **confidence ki kami** hoti hai kyunke unhe **practice ka mauka nahi milta**. Actual interviews mein jaane se pehle koi platform nahi tha jahan wo apne field ke sawalaat ke sath **real-time practice** kar sakein aur apni **galtiyan jan sakein**.

**Humne ye solve kiya:**
- AI se realistic interview questions generate hoti hain
- User apna jawab **microphone se bol kar** de sakta hai (voice interview)
- Har jawab ka **turant score (0–10)** aur **feedback** milta hai
- End mein ek detailed **Report Card** milta hai jismein Grade, Score, Strengths, Weaknesses, aur Study Recommendations hoti hain

---

## 🎯 Project Ke Objectives (Goals)

1. **AI se interview questions generate karna** — har topic ke liye customized sawalaat
2. **Voice-based answering system banana** — user microphone se apna jawab de sake
3. **Real-time answer evaluation** — AI turant bata de ke jawab sahi hai ya nahi aur kya improve karein
4. **Performance Report Card** — interview ke baad ek detailed report jisme Grade (A+ to F), Score %, Strengths, aur Weaknesses hon
5. **Multiple domains support** — Software Engineering, Banking, CSS/PMS, HR, Call Center, Teaching, Fresh Graduate etc.

---

## 🛠️ Technologies Used (Tech Stack)

| Technology | Kaam (Purpose) |
|---|---|
| **Next.js 16** | Main framework — frontend + backend dono is mein hain (App Router) |
| **React 19** | UI components banane ke liye (buttons, pages, forms) |
| **Tailwind CSS v4** | Website ka design aur styling (dark theme, animations) |
| **Google Gemini AI** (`gemini-2.0-flash`) | AI model jo questions generate karta hai, answers evaluate karta hai, aur reports banata hai |
| **LangChain** | AI model ke sath structured communication ke liye (prompts, messages) |
| **Web Speech API** | Browser ki built-in speech recognition (voice se text banana) aur text-to-speech (AI ka bolna) |
| **Redux Toolkit** | Theme (Dark/Light mode) ka state management |
| **Axios** | API calls karne ke liye (frontend se backend ko data bhejna) |
| **React Hot Toast** | Notifications dikhane ke liye (success/error messages) |
| **Netlify** | Deployment platform (website ko live karne ke liye) |

---

## 📂 Project Ka Structure (Folder Organization)

```
interview_ai_next/
├── src/
│   ├── app/                          ← Next.js Pages & API Routes
│   │   ├── page.js                   ← Landing Page (Home — topic select karo)
│   │   ├── interview/page.js         ← Interview Page (sawalaat aur mic se jawab do)
│   │   ├── report/page.js            ← Report Card Page (grade aur feedback dekho)
│   │   ├── globals.css               ← Styling (dark theme, animations)
│   │   ├── layout.js                 ← Root layout wrapper
│   │   └── api/interview/
│   │       ├── generate/route.js     ← API: Questions generate karo
│   │       ├── evaluate/route.js     ← API: Jawab evaluate karo
│   │       └── report/route.js       ← API: Final report banao
│   ├── services/
│   │   ├── aiService.js              ← Main AI logic (Gemini se baat karna)
│   │   ├── knowledgeBase.js          ← Domain knowledge (har field ka context)
│   │   └── speechNormalizer.js       ← Voice errors fix karna ("use effect" → "useEffect")
│   ├── components/
│   │   └── ThemeToggle.js            ← Dark/Light mode toggle button
│   └── store/
│       ├── index.js                  ← Redux store setup
│       ├── themeSlice.js             ← Theme state management
│       └── provider.js               ← Redux provider wrapper
├── .env                              ← API Key (GEMINI_API_KEY)
├── package.json                      ← Dependencies & scripts
├── netlify.toml                      ← Deployment settings
└── README.md                         ← Documentation
```

---

## 🔄 Project Kaise Kaam Karta Hai? (How It Works — Step by Step)

### Step 1: Landing Page — Topic Selection
- User website kholata hai → **Landing Page** aata hai
- User apna **field/topic select** karta hai (jaise "Software Engineer / BSCS")
- **Question count** choose karta hai (3, 5, 8, ya 10)
- **Difficulty level** set karta hai (Entry Level, Mid-Level, Senior)
- **"Start Practice Session"** button press karta hai

### Step 2: AI Questions Generate
- Frontend se API call jaati hai → `POST /api/interview/generate`
- Backend mein `aiService.js` ka function `generateQuestions()` chalta hai
- Ye `knowledgeBase.js` se topic ka **domain context** lata hai (jaise OOP, DBMS ke concepts)
- Phir **Google Gemini AI** ko ye context aur instructions bhejta hai
- Gemini AI **relevant interview questions JSON** mein wapas bhejta hai
- Agar API key na ho, toh **fallback questions** (pre-defined) use hoti hain

### Step 3: Voice Interview — User Ka Jawab
- Har question ek ek karke screen par aata hai
- **AI question ko bolata bhi hai** (Text-to-Speech) — jaise asli interviewer
- User **2 tareekon** se jawab de sakta hai:
  - **🎤 Voice Mode:** Mic button dabao, bolna shuru karo, AI transcribe karta hai
  - **⌨️ Text Mode:** Direct type karke likh do
- Voice mode mein **Speech-to-Text (Web Speech API)** use hota hai
- `speechNormalizer.js` voice ke errors fix karta hai (jaise "react dot js" → "React.js")

### Step 4: Real-Time Answer Evaluation
- User "Submit Response" dabata hai → API call: `POST /api/interview/evaluate`
- `aiService.js` ka `evaluateAnswer()` chalta hai
- Pehle answer ko `normalizeTranscript()` se clean karta hai
- Phir Gemini AI ko bhejta hai → AI **score (0–10)** aur **feedback** deta hai
- Agar user "I don't know" bole → AI score 0 deta hai aur politely agla question suggest karta hai
- Feedback **screen par dikhta hai** aur **AI bolata bhi hai** (TTS)

### Step 5: Final Report Card
- Sab questions answer hone ke baad user "Finish Interview" dabata hai
- API call: `POST /api/interview/report`
- `aiService.js` ka `generateReport()` sab results compile karta hai
- Gemini AI **overall assessment** karta hai aur ye cheezein deta hai:
  - **Overall Grade** (A+, A, B+, B, C+, C, D, F)
  - **Score Percentage** (e.g., 72%)
  - **Topic Accuracy** (kitne answers correct thay)
  - **Speech Input Accuracy** (voice recognition confidence)
  - **Key Strengths** (kya acha kiya)
  - **Areas of Improvement** (kahan kamzori hai)
  - **Study Recommendations** (kya padho aur improve karo)
  - **Question-by-Question Log** (har sawal ka detail — answer, score, feedback)

---

## ✨ Key Features Summary

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Multi-Domain Support** | 7+ job categories — Software, Banking, CSS/PMS, HR, Call Center, Teaching, Fresh Graduate |
| 2 | **AI Question Generation** | Google Gemini AI se dynamic, topic-relevant questions |
| 3 | **Voice Interview Mode** | Mic se bolo, AI transcribe kare — real interview feel |
| 4 | **Text Input Mode** | Type karke bhi jawab de sakte ho |
| 5 | **Real-Time AI Feedback** | Har jawab ka turant score aur feedback |
| 6 | **Speech Normalizer** | Voice recognition errors automatically fix hoti hain |
| 7 | **Performance Report Card** | Detailed grade, score, strengths, weaknesses, study tips |
| 8 | **Text-to-Speech (TTS)** | AI interviewer sawalaat aur feedback bolata hai |
| 9 | **Dark/Light Theme** | User apna pasandida theme choose kar sakta hai |
| 10 | **Knowledge Base (RAG)** | Har domain ka specific context AI ko milta hai for better questions |
| 11 | **Fallback System** | Agar AI API fail ho jaye toh pre-defined questions aur local evaluation use hoti hain |
| 12 | **Responsive Design** | Mobile aur Desktop dono par kaam karta hai |

---

## 🧠 AI Concept Explained — RAG (Retrieval-Augmented Generation)

Hum ne is project mein **RAG ka simplified version** use kiya hai:

1. **Knowledge Base (`knowledgeBase.js`)** mein har domain ka context store hai — jaise Software Engineering ke liye OOP, API, DBMS ke concepts
2. Jab user koi topic select karta hai, hum **relevant context retrieve** karte hain
3. Ye context Gemini AI ko **System Prompt** mein bhejte hain — taake AI ko pata ho ke kis field ke questions banana hain
4. AI apne knowledge + hamara context mila kar **better, relevant questions** generate karta hai

**Simple analogy:**  
> Jaise aap ek teacher ko bolte ho "CSS exam ke questions banao" aur sath mein ek page dete ho jismein syllabus likha hai — teacher uss syllabus ke hisaab se questions banata hai. Wohi RAG hai — AI ko context dena.

---

## 🔑 Important Code Files — Kya Kaam Karti Hain?

### 1. `aiService.js` — AI Ka Dimagh (Brain)
- **3 main functions** hain:
  - `generateQuestions()` — topic ke hisab se interview questions AI se generate karta hai
  - `evaluateAnswer()` — user ka jawab check karta hai aur score + feedback deta hai
  - `generateReport()` — final report card compile karta hai (grade, strengths, weaknesses)
- Agar API key na ho → **fallback functions** use hoti hain (local evaluation)

### 2. `knowledgeBase.js` — Domain Knowledge
- Har field ka **context aur sample question types** store hain
- 7 domains cover hain: Software, CSS/PMS, Banking, HR, Call Center, Teaching, Fresh Graduate
- Agar koi unknown topic aaye → **Universal Handler** chalta hai jo AI ko general instructions deta hai

### 3. `speechNormalizer.js` — Voice Error Fixer
- Voice recognition kabhi kabhi technical words galat sunti hai
- Ye file ek **dictionary** rakhti hai jaise:
  - "use effect" → `useEffect`
  - "promise dot all" → `Promise.all`
  - "react dot js" → `React.js`
- Automatically transcription clean ho jaati hai

### 4. `page.js` (Landing) — Home Page
- User yahan se topic, question count, aur difficulty select karta hai
- 7 pre-configured topic cards dikhte hain with icons aur descriptions
- "Start Practice Session" button interview page par le jaata hai

### 5. `interview/page.js` — Interview Page
- Sabse bada aur important page — main interview yahan hota hai
- Voice recording (mic button), text-to-speech, answer evaluation — sab yahan hota hai
- Question sidebar, progress bar, voice waveform animation — sab dikhta hai

### 6. `report/page.js` — Report Card Page
- Interview ke baad yahan final results dikhte hain
- Grade card, circular progress charts, strengths/weaknesses, question-by-question log

---

## 🌐 Deployment

- Project **Netlify** par deploy hota hai
- `netlify.toml` file mein deployment configuration hai
- `GEMINI_API_KEY` environment variable Netlify dashboard mein set hota hai

---

## 📊 Project Ka Flow Diagram

```
┌──────────────────┐
│   Landing Page   │
│ (Topic Selection)│
└────────┬─────────┘
         │ User selects topic + settings
         ▼
┌──────────────────┐
│  AI Generates    │ ← knowledgeBase.js (domain context)
│   Questions      │ ← Gemini AI (question creation)
└────────┬─────────┘
         │ Questions ready
         ▼
┌──────────────────┐
│  Interview Page  │
│ ┌──────────────┐ │
│ │ AI asks Q    │ │ ← Text-to-Speech
│ │ User answers │ │ ← Voice (Speech-to-Text) or Text
│ │ AI evaluates │ │ ← Gemini AI (scoring + feedback)
│ │ AI speaks FB │ │ ← Text-to-Speech
│ └──────────────┘ │
│  (Repeat for     │
│   each question) │
└────────┬─────────┘
         │ All questions done
         ▼
┌──────────────────┐
│  Report Card     │
│  - Grade (A-F)   │
│  - Score %       │
│  - Accuracy %    │
│  - Strengths     │
│  - Weaknesses    │
│  - Study Tips    │
│  - Q&A Log       │
└──────────────────┘
```

---

## 🎤 Viva / Presentation Tips

Agar teacher poochein toh ye key points yaad rakhein:

1. **"Ye project kya karta hai?"**  
   → "Ye ek AI-powered mock interview portal hai jismein user apna field select karta hai, AI interview questions generate karta hai, user voice ya text se jawab deta hai, aur AI real-time mein score aur feedback deta hai. End mein ek detailed performance report card milta hai."

2. **"Kaunsa AI model use kiya hai?"**  
   → "Google Gemini 2.0 Flash model use kiya hai through LangChain library."

3. **"RAG kya hai aur tumne kaise use kiya?"**  
   → "RAG ka matlab hai Retrieval-Augmented Generation. Humne har domain ke liye ek knowledge base banaya hai (knowledgeBase.js) jismein topic-specific context store hai. Jab user koi topic select karta hai, hum uss topic ka relevant context retrieve karke AI ko bhejte hain taake AI better aur relevant questions generate kare."

4. **"Voice feature kaise kaam karti hai?"**  
   → "Browser ki built-in Web Speech API use ki hai. Speech-to-Text user ki voice ko text mein convert karta hai, aur Text-to-Speech AI ke questions aur feedback ko bolata hai. Humne ek Speech Normalizer bhi banaya hai jo technical words ki pronunciation errors automatically fix karta hai."

5. **"Frontend aur Backend alag alag hain?"**  
   → "Nahi, Next.js use kiya hai jismein frontend (React pages) aur backend (API Routes) ek hi project mein hain. Frontend `/src/app/page.js` mein hai aur backend APIs `/src/app/api/interview/` folder mein hain."

6. **"Agar API key na ho toh kya hoga?"**  
   → "Project mein fallback system hai. Agar Gemini API key na ho ya API fail ho jaye, toh pre-defined questions use hoti hain aur local evaluation algorithm se answers check hote hain. Matlab project bina internet ke bhi partially kaam karta hai."

7. **"Deployment kahan ki hai?"**  
   → "Netlify par deploy ki hai. `netlify.toml` mein configuration hai aur GEMINI_API_KEY environment variable Netlify dashboard mein set hai."

---

## ✅ Conclusion

Is project mein humne **AI, Voice Recognition, aur Modern Web Technologies** ko combine karke ek **practical interview preparation tool** banaya hai jo:

- **Students ko interview confidence build** karne mein madad karta hai
- **AI se realistic practice** provide karta hai
- **Instant feedback** deta hai taake student apni galtiyan turant jaan sake
- **Multiple job domains** support karta hai — sirf IT nahi, balke Banking, Government, Teaching bhi
- **Accessible hai** — sirf ek browser chahiye, koi extra software install nahi karna

---

> **Note:** Is document ko apni presentation ya viva ke liye reference ki tarah use karein. Har section ko samajh kar apne words mein explain karein.
