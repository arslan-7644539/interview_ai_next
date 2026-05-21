/**
 * Interview Knowledge Base — RAG Context
 * 
 * Provides domain-specific context to the AI model for generating
 * high-quality, topic-relevant interview questions and evaluations.
 */

const knowledgeBase = {
  'software engineer / bscs': {
    context: `Software Engineer / BSCS entry-level interviews in Pakistan.
Focus ONLY on very basic questions about the candidate, their studies, and core programming fundamentals.
Ask simple questions such as:
- Tell me about yourself.
- Tell me about your studies and your Final Year Project (FYP).
- What is the difference between Object-Oriented Programming (OOP) and Procedural Programming?
- What is an API and why is it used?
- Explain the basic difference between a DBMS and a File System.
- What is inheritance in OOP?
- What is the difference between a stack and a queue?
- Why should we hire you?
- What are your strengths and weaknesses?
Do NOT ask complex coding puzzles, tricky algorithms, system design, or advanced system scenarios. Keep it very simple and friendly.`,
    questionTypes: ['introduction', 'academic', 'basic-oop', 'basic-dbms', 'basic-dsa', 'behavioral'],
  },
  'css / pms / government': {
    context: `CSS / PMS / Government Job interviews in Pakistan.
Focus ONLY on basic personal introduction, basic current affairs, and common knowledge about Pakistan.
Ask simple questions such as:
- Introduce yourself.
- Why do you want to join the civil service of Pakistan?
- What are the major problems of Pakistan today?
- How would you explain inflation in simple terms?
- What were the key leadership qualities of Quaid-e-Azam Muhammad Ali Jinnah?
- What is bureaucracy in simple words?
- What is the basic difference between democracy and dictatorship?
- Share your view on recent simple current affairs of Pakistan.
Do NOT ask complex administrative case studies or deep international law topics. Keep it basic, general, and conversational.`,
    questionTypes: ['introduction', 'motivation', 'pakistan-problems', 'basic-economics', 'leadership', 'basic-governance'],
  },
  'banking job': {
    context: `Banking job interviews in Pakistan (e.g. Meezan Bank, HBL, Bank Alfalah, UBL, etc.).
Focus ONLY on basic banking concepts, motivation, customer handling, and simple teamwork.
Ask simple questions such as:
- Why do you want to join the banking sector?
- What is an interest rate in simple words?
- What is the difference between a current account and a savings account?
- How will you handle an angry customer at the bank branch?
- What is teamwork and why is it important in a bank?
- Why should we hire you?
Do NOT ask complex finance math, investment banking valuation models, or advanced risk regulations. Keep it highly practical, basic, and conversational.`,
    questionTypes: ['motivation', 'basic-banking', 'customer-handling', 'teamwork', 'suitability'],
  },
  'hr interview': {
    context: `HR (Human Resources) interview category.
Focus ONLY on basic personal behavioral and self-reflection questions.
Ask simple questions such as:
- Tell me about yourself.
- Why do you want this job?
- Where do you see yourself in 5 years?
- Describe a simple challenge you faced and how you solved it.
- Why did you leave your previous job (or why are you looking for a change)?
- What are your weaknesses?
- How do you handle pressure and tight deadlines?
Do NOT ask complex stress-test scenarios or advanced HR policy frameworks. Keep it friendly and standard.`,
    questionTypes: ['introduction', 'motivation', 'career-goals', 'behavioral-scenario', 'self-awareness', 'stress-handling'],
  },
  'call center / support': {
    context: `Call Center and Customer Support interviews in Pakistan.
Focus ONLY on basic communication skills, dealing with rude customers, and basic customer satisfaction metrics.
Ask simple questions such as:
- Can you comfortably communicate in English? (Introduce yourself in English).
- How will you deal with a customer who is being rude or shouting at you?
- Why should we select you for this call center role?
- Sell me this pen (basic persuasive/sales exercise).
- What is customer satisfaction in your own words?
Do NOT ask complex technical support troubleshooting, SLA contracts, or advanced CRM systems. Keep it very conversational and test basic communication.`,
    questionTypes: ['english-check', 'de-escalation', 'sales-pitch', 'satisfaction-concept', 'motivation'],
  },
  'teacher / lecturer': {
    context: `Teacher or Lecturer interviews in Pakistan.
Focus ONLY on basic teaching passion, methodology, classroom management, and simple concepts.
Ask simple questions such as:
- Why do you want to become a teacher/lecturer?
- What is your basic teaching methodology?
- How do you manage weak or slow students in your class?
- What is the difference between education and learning?
Do NOT ask complex educational policy structures, advanced educational research methodology, or deep curriculum design theory. Keep it simple and focused on classroom basics.`,
    questionTypes: ['motivation', 'methodology', 'classroom-basics', 'education-philosophy'],
  },
  'fresh graduate / intern': {
    context: `Fresh Graduate or Internship interviews in Pakistan.
Focus ONLY on basic academic achievements, Final Year Project (FYP), technologies known, and career goals.
Ask simple questions such as:
- Tell me about yourself.
- Explain your Final Year Project (FYP) in simple words.
- What programming technologies or tools do you know?
- Why should we select you as an intern?
- What are your career goals?
Do NOT ask advanced enterprise software architecture, lead-level tradeoffs, or deep system design. Keep it basic and encouraging.`,
    questionTypes: ['introduction', 'fyp', 'skills', 'motivation', 'career-goals'],
  },
};

export const getRelevantContext = (topic) => {
  const topicLower = topic.toLowerCase();

  // Keyword mapping for broader discovery
  const mapping = {
    'software engineer / bscs': ['software', 'bscs', 'coding', 'oop', 'computer science', 'it job'],
    'css / pms / government': ['css', 'pms', 'government', 'civil service', 'bureaucracy', 'dictatorship'],
    'banking job': ['banking', 'bank', 'meezan', 'hbl', 'alfalah', 'ubl', 'current account'],
    'hr interview': ['hr', 'behavioral', 'strengths', 'weaknesses', 'human resources'],
    'call center / support': ['call center', 'customer support', 'customer satisfaction', 'support', 'rude customer'],
    'teacher / lecturer': ['teacher', 'lecturer', 'teaching', 'pedagogy', 'education'],
    'fresh graduate / intern': ['fresh graduate', 'internship', 'intern', 'fyp'],
  };

  for (const [key, aliases] of Object.entries(mapping)) {
    if (topicLower.includes(key) || aliases.some(a => topicLower.includes(a))) {
      return knowledgeBase[key];
    }
  }

  // Universal Handler: Tells AI to generate its own RAG-like context from internal memory
  return {
    context: `UNIVERSAL AUDITOR MODE: The topic is "${topic}".
1. Focus ONLY on very basic questions about the candidate, their motivation, and simple fundamentals of "${topic}".
2. Ask direct, straightforward, and non-tricky questions.
3. Start with simple introductions and then basic concepts.`,
    questionTypes: ['field-specific', 'basic-concepts', 'introduction'],
  };
};

