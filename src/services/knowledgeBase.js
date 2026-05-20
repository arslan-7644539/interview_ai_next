/**
 * Interview Knowledge Base — RAG Context
 * 
 * Provides domain-specific context to the AI model for generating
 * high-quality, topic-relevant interview questions and evaluations.
 */

const knowledgeBase = {
  'javascript': {
    context: `JavaScript is a dynamic, interpreted programming language. Key interview topics include:
closures, prototypal inheritance, event loop, promises/async-await, hoisting, scope chain,
this keyword binding, arrow functions vs regular, ES6+ features (destructuring, spread, modules),
DOM manipulation, event delegation, debounce/throttle, Web APIs, memory leaks, garbage collection,
WeakMap/WeakSet, generators, iterators, Proxy/Reflect, module patterns, IIFE, currying, memoization.
Common coding patterns: factory functions, observer pattern, pub-sub, middleware pattern.`,
    questionTypes: ['conceptual', 'code-output', 'debugging', 'design-pattern', 'optimization'],
  },
  'react': {
    context: `React is a component-based UI library. Key interview topics include:
Virtual DOM reconciliation (diffing algorithm), hooks (useState, useEffect, useMemo, useCallback, useRef, useReducer, useId),
useRef for DOM access, referencing elements, and persisting values without re-renders, forwardRef for passing refs to children,
useImperativeHandle for customizing the instance value that is exposed to parent components when using ref,
component lifecycle in functional vs class components, controlled vs uncontrolled components,
React.memo and useMemo for performance optimization, Context API for global state vs prop drilling,
React fiber architecture, concurrent rendering features, suspense for data fetching, error boundaries, portals,
custom hooks patterns, state management (Redux Toolkit, Zustand, Jotai, Recoil), server components vs client components,
hydration process, code splitting (React.lazy, dynamic imports), key prop importance in lists, synthetic events system,
higher-order components (HOCs), render props pattern, compound components, controlled inputs vs uncontrolled inputs.`,
    questionTypes: ['conceptual', 'hooks', 'performance', 'architecture', 'state-management', 'patterns'],
  },
  'node': {
    context: `Node.js is a server-side JavaScript runtime. Key interview topics include:
event loop (libuv), non-blocking I/O, streams (readable, writable, transform, duplex),
cluster module, worker threads, child processes, Express middleware pipeline,
error handling patterns, authentication (JWT, OAuth), REST API design, GraphQL,
database integration (MongoDB/Mongoose, PostgreSQL/Sequelize), caching strategies (Redis),
rate limiting, security (CORS, helmet, input sanitization, SQL injection prevention),
microservices communication, message queues (RabbitMQ, Bull), PM2 process management,
environment variables, logging (Winston, Morgan), testing (Jest, Supertest).`,
    questionTypes: ['conceptual', 'architecture', 'security', 'performance', 'debugging'],
  },
  'python': {
    context: `Python is a versatile programming language. Key interview topics include:
GIL (Global Interpreter Lock), generators/iterators, decorators, context managers,
list comprehensions, duck typing, multiple inheritance (MRO), metaclasses,
asyncio/coroutines, data classes, type hints, slots, descriptors,
collections module (defaultdict, Counter, deque, OrderedDict),
popular frameworks (Django, Flask, FastAPI), testing (pytest, unittest),
OOP principles, design patterns, memory management, garbage collection,
web scraping (BeautifulSoup, Scrapy), data processing (pandas, numpy).`,
    questionTypes: ['conceptual', 'code-output', 'pythonic-patterns', 'libraries', 'optimization'],
  },
  'data structures': {
    context: `Data Structures & Algorithms topics for interviews include:
Arrays, Linked Lists (singly, doubly, circular), Stacks, Queues (priority, deque),
Trees (BST, AVL, Red-Black, B-Tree, Trie, Segment Tree), Heaps (min/max),
Graphs (BFS, DFS, Dijkstra, Bellman-Ford, Floyd-Warshall, topological sort),
Hash Tables (collision handling, load factor), Sorting (merge, quick, heap, radix),
Dynamic Programming (memoization, tabulation), Greedy algorithms,
Divide and Conquer, Backtracking, Sliding Window, Two Pointers,
Time/Space complexity analysis (Big O), amortized analysis.`,
    questionTypes: ['conceptual', 'problem-solving', 'complexity-analysis', 'algorithm-design', 'tradeoffs'],
  },
  'system design': {
    context: `System Design interview topics include:
Scalability (horizontal vs vertical), Load Balancing (L4/L7, algorithms),
Caching (CDN, Redis, Memcached, cache invalidation strategies),
Database design (SQL vs NoSQL, sharding, replication, partitioning, CAP theorem),
Message Queues (Kafka, RabbitMQ, SQS), Microservices vs Monolith,
API design (REST, GraphQL, gRPC, WebSockets), Rate Limiting,
Consistent Hashing, Bloom Filters, Event-Driven Architecture,
Real-world systems: URL shortener, chat system, social media feed,
notification system, payment system, video streaming, search engine.`,
    questionTypes: ['design', 'tradeoffs', 'scalability', 'estimation', 'component-deep-dive'],
  },
  'sql': {
    context: `SQL & Database interview topics include:
SELECT queries (JOINs, GROUP BY, HAVING, subqueries, CTEs, window functions),
Normalization (1NF-BCNF), Indexing (B-Tree, Hash, composite, covering),
Transactions (ACID properties), Isolation levels, Deadlocks,
Query optimization (EXPLAIN, query plans), Stored procedures, Views,
NoSQL concepts (document, key-value, column-family, graph databases),
Database replication, sharding strategies, connection pooling,
ORM patterns (Active Record, Data Mapper), migrations.`,
    questionTypes: ['query-writing', 'optimization', 'design', 'conceptual', 'troubleshooting'],
  },
  'java': {
    context: `Java interview topics include:
OOP principles (encapsulation, inheritance, polymorphism, abstraction),
JVM internals (class loading, garbage collection algorithms, memory model),
Collections framework (List, Set, Map, Queue implementations),
Generics, Annotations, Reflection, Streams API, Lambda expressions,
Concurrency (threads, synchronization, ExecutorService, CompletableFuture),
Design patterns (Singleton, Factory, Builder, Observer, Strategy),
Spring framework (IoC, DI, AOP, Spring Boot, Spring Security),
Exception handling best practices, Serialization, Memory leaks.`,
    questionTypes: ['conceptual', 'code-output', 'design-patterns', 'concurrency', 'jvm-internals'],
  },
  'law enforcement': {
    context: `Police/Law Enforcement exam and interview topics include:
Criminal law (Miranda rights, search and seizure, use of force protocols, probable cause),
Community policing strategies, conflict de-escalation techniques,
Crisis intervention, report writing accuracy, ethical decision-making,
Physical fitness standards, situational awareness, tactical reasoning,
Knowledge of local statutes, radio protocols, and chain of command.`,
    questionTypes: ['situational', 'legal-knowledge', 'ethical-dilemma', 'operational-protocol'],
  },
  'medical': {
    context: `Medical and Nursing interview topics include:
Clinical knowledge (pathophysiology, pharmacology, dosage calculations),
Patient care protocols, bedside manner, triage prioritization,
HIPAA and patient privacy, emergency response (ACLS/BLS),
Interdisciplinary communication, ethical scenarios (end-of-life care, informed consent),
Clinical reasoning and diagnostic processes.`,
    questionTypes: ['clinical-scenario', 'pharmacology', 'ethical', 'prioritization'],
  },
  'finance': {
    context: `Finance and Investment Banking interview topics include:
Financial modeling (DCF, LBO, comparable company analysis),
Accounting principles (3-statement linking, revenue recognition),
Valuation methodologies, market trends, M&A logic, capital structures,
Risk management, financial ratios (ROE, ROA, Debt/Equity),
Regulatory compliance (SEC, FINRA).`,
    questionTypes: ['quantitative', 'analytical', 'market-aware', 'valuation'],
  },
  'behavioral': {
    context: `Behavioral/HR interview topics assessed via STAR method:
Leadership (leading projects, mentoring, decision-making under pressure),
Teamwork (conflict resolution, collaboration, cross-functional work),
Problem-solving (debugging complex issues, creative solutions, learning from failure),
Communication (explaining technical concepts, stakeholder management),
Adaptability (handling changing requirements, learning new technologies),
Time management (prioritization, meeting deadlines, handling multiple projects),
Career goals, motivation, culture fit, handling feedback, work-life balance.`,
    questionTypes: ['scenario', 'experience-based', 'situational', 'self-reflection', 'culture-fit'],
  },
};

export const getRelevantContext = (topic) => {
  const topicLower = topic.toLowerCase();

  // Keyword mapping for broader discovery
  const mapping = {
    'javascript': ['js', 'ecmascript', 'typescript', 'frontend web'],
    'react': ['react', 'redux', 'next.js', 'ui library'],
    'node': ['node', 'express', 'backend', 'server-side'],
    'python': ['python', 'django', 'flask', 'data science'],
    'data structures': ['dsa', 'algorithm', 'coding test'],
    'system design': ['architecture', 'scalability', 'distributed systems'],
    'sql': ['database', 'mysql', 'postgres', 'query'],
    'java': ['java', 'spring', 'jvm', 'android'],
    'law enforcement': ['police', 'army', 'military', 'security', 'enforcement', 'officer'],
    'medical': ['nursing', 'doctor', 'hospital', 'clinical', 'medicine'],
    'finance': ['accounting', 'bank', 'investment', 'stock', 'economic'],
    'behavioral': ['hr', 'soft skill', 'culture', 'management'],
  };

  for (const [key, aliases] of Object.entries(mapping)) {
    if (topicLower.includes(key) || aliases.some(a => topicLower.includes(a))) {
      return knowledgeBase[key];
    }
  }

  // Universal Handler: Tells AI to generate its own RAG-like context from internal memory
  return {
    context: `UNIVERSAL AUDITOR MODE: The topic is "${topic}".
1. Access your internal database for "${topic}" professional standards.
2. Identify the core competencies required for a professional in this field.
3. Use specialized terminology and high-stakes scenarios specific to "${topic}".
4. Evaluate based on the highest industry standards for "${topic}".`,
    questionTypes: ['field-specific', 'situational', 'technical-depth', 'operational-mastery'],
  };
};
