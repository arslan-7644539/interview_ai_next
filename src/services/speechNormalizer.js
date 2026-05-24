/**
 * Speech Normalizer — fixes common voice-to-text transcription errors
 * for technical terms. Speech recognition often breaks camelCase,
 * acronyms, and framework names.
 */

const techTerms = {
  // JavaScript
  'use effect': 'useEffect', 'use state': 'useState', 'use ref': 'useRef',
  'use memo': 'useMemo', 'use callback': 'useCallback', 'use reducer': 'useReducer',
  'use context': 'useContext', 'use layout effect': 'useLayoutEffect', 'use id': 'useId',
  'forward ref': 'forwardRef', 'forward dot ref': 'forwardRef',
  'use imperative handle': 'useImperativeHandle',
  'current dot value': 'current value', 'ref dot current': 'ref.current',
  'set timeout': 'setTimeout', 'set interval': 'setInterval',
  'event loop': 'event loop', 'call back': 'callback', 'call backs': 'callbacks',
  'promise dot all': 'Promise.all', 'promise dot race': 'Promise.race',
  'async await': 'async/await', 'a sync a wait': 'async/await',
  'arrow function': 'arrow function', 'arrow functions': 'arrow functions',
  'var let const': 'var/let/const', 'iife': 'IIFE', 'i i f e': 'IIFE',
  'json': 'JSON', 'j son': 'JSON', 'ajax': 'AJAX',
  'dom': 'DOM', 'd o m': 'DOM', 'virtual dom': 'Virtual DOM',

  // React
  'react js': 'React.js', 'react dot js': 'React.js',
  'next js': 'Next.js', 'next dot js': 'Next.js',
  'jsx': 'JSX', 'j s x': 'JSX', 'tsx': 'TSX',
  'react memo': 'React.memo', 'react dot memo': 'React.memo',
  'react lazy': 'React.lazy', 'react dot lazy': 'React.lazy',
  'create context': 'createContext', 'context api': 'Context API',
  'prop drilling': 'prop drilling', 'props': 'props',
  'state management': 'state management',
  'server side rendering': 'server-side rendering', 'ssr': 'SSR',
  'client side rendering': 'client-side rendering', 'csr': 'CSR',
  'hydration': 'hydration', 'reconciliation': 'reconciliation',
  'fiber': 'Fiber', 'react fiber': 'React Fiber',

  // Node
  'node js': 'Node.js', 'node dot js': 'Node.js',
  'express js': 'Express.js', 'express dot js': 'Express.js',
  'middleware': 'middleware', 'middle ware': 'middleware',
  'npm': 'npm', 'n p m': 'npm',
  'api': 'API', 'a p i': 'API', 'apis': 'APIs',
  'rest api': 'REST API', 'restful': 'RESTful',
  'graphql': 'GraphQL', 'graph q l': 'GraphQL',
  'web socket': 'WebSocket', 'web sockets': 'WebSockets',

  // General CS
  'o of n': 'O(n)', 'big o': 'Big O', 'big o notation': 'Big O notation',
  'o of one': 'O(1)', 'o of n squared': 'O(n²)', 'o of log n': 'O(log n)',
  'linked list': 'linked list', 'hash map': 'HashMap', 'hash table': 'hash table',
  'binary tree': 'binary tree', 'binary search tree': 'BST',
  'b s t': 'BST', 'bfs': 'BFS', 'b f s': 'BFS', 'dfs': 'DFS', 'd f s': 'DFS',
  'dynamic programming': 'dynamic programming', 'dp': 'DP', 'd p': 'DP',
  'sql': 'SQL', 's q l': 'SQL', 'no sql': 'NoSQL',
  'crud': 'CRUD', 'c r u d': 'CRUD',
  'oop': 'OOP', 'o o p': 'OOP',
  'solid': 'SOLID', 'solid principles': 'SOLID principles',
  'dry': 'DRY', 'kiss': 'KISS',
  'ci cd': 'CI/CD', 'c i c d': 'CI/CD',
  'docker': 'Docker', 'kubernetes': 'Kubernetes', 'k8s': 'K8s',
  'aws': 'AWS', 'a w s': 'AWS', 'gcp': 'GCP',
  'jwt': 'JWT', 'j w t': 'JWT', 'oauth': 'OAuth',
  'http': 'HTTP', 'https': 'HTTPS', 'cors': 'CORS',
  'html': 'HTML', 'h t m l': 'HTML', 'css': 'CSS', 'c s s': 'CSS',
  'typescript': 'TypeScript', 'type script': 'TypeScript',

  // Python
  'pip': 'pip', 'p i p': 'pip',
  'django': 'Django', 'flask': 'Flask', 'fast api': 'FastAPI',
  'pandas': 'pandas', 'numpy': 'NumPy', 'num py': 'NumPy',
  'py torch': 'PyTorch', 'tensor flow': 'TensorFlow',
  'gil': 'GIL', 'g i l': 'GIL',
  'dunder': 'dunder', 'dunder methods': 'dunder methods',
  'list comprehension': 'list comprehension',

  // Java
  'jvm': 'JVM', 'j v m': 'JVM', 'jdk': 'JDK',
  'spring boot': 'Spring Boot', 'spring framework': 'Spring Framework',
  'garbage collection': 'garbage collection', 'gc': 'GC',

  // Pakistan & Category Specific
  'b s c s': 'BSCS', 'bscs': 'BSCS',
  'f y p': 'FYP', 'fyp': 'FYP',
  'p m s': 'PMS', 'pms': 'PMS',
  'c s s': 'CSS', 'css': 'CSS',
  'h b l': 'HBL', 'hbl': 'HBL',
  'u b l': 'UBL', 'ubl': 'UBL',
  'meezan': 'Meezan Bank', 'meezan bank': 'Meezan Bank', 'mizan': 'Meezan Bank',
  'bank alfalah': 'Bank Alfalah', 'alfalah': 'Bank Alfalah',
  'quaid e azam': 'Quaid-e-Azam', 'quaid-e-azam': 'Quaid-e-Azam', 'quaid i azam': 'Quaid-e-Azam',
  'c g p a': 'CGPA', 'cgpa': 'CGPA',
  'final year project': 'Final Year Project',
  'current account': 'current account', 'savings account': 'savings account',
  'saving account': 'savings account', 'interest rate': 'interest rate',
  'bureaucracy': 'bureaucracy', 'democracy': 'democracy', 'dictatorship': 'dictatorship',
  'inflation': 'inflation', 'call center': 'call center', 'bpo': 'BPO', 'b p o': 'BPO',

  // Common Google STT misrecognitions
  'reacts': 'React\'s', 'react hooks': 'React Hooks',
  'note js': 'Node.js', 'know js': 'Node.js', 'no js': 'Node.js',
  'post grass': 'Postgres', 'post gress': 'Postgres', 'post gres q l': 'PostgreSQL',
  'my sequel': 'MySQL', 'my sql': 'MySQL',
  'mongo db': 'MongoDB', 'mongo d b': 'MongoDB',
  'redis': 'Redis', 'read is': 'Redis',
  'get hub': 'GitHub', 'git hub': 'GitHub',
  'micro services': 'microservices', 'micro service': 'microservice',
  'type script': 'TypeScript', 'java script': 'JavaScript',
  'linter': 'linter', 'es lint': 'ESLint',
  'webpack': 'Webpack', 'web pack': 'Webpack',
  'babel': 'Babel', 'babble': 'Babel',
  'tailwind': 'Tailwind', 'tail wind': 'Tailwind',
  'bootstrap': 'Bootstrap', 'boot strap': 'Bootstrap',
  'sequel': 'SQL', 'see quill': 'SQL',

  // Common accent misrecognitions (South Asian English → en-US)
  'vari able': 'variable', 'ware able': 'wearable',
  'para meter': 'parameter', 'para meters': 'parameters',
  'in hair it ance': 'inheritance', 'in heritage': 'inheritance',
  'poly morph ism': 'polymorphism', 'poly more fizz um': 'polymorphism',
  'en capsule ation': 'encapsulation', 'in capsulation': 'encapsulation',
  'ab straction': 'abstraction',
  'al gore ith um': 'algorithm', 'al go rhythm': 'algorithm',
  'data base': 'database', 'date a base': 'database',
  'frame work': 'framework', 'frame works': 'frameworks',
  'front and': 'frontend', 'front end': 'frontend',
  'back and': 'backend', 'back end': 'backend',
  'full stack': 'full-stack', 'full stag': 'full-stack',
  'deploy meant': 'deployment', 'deploy ment': 'deployment',
  'scaler bility': 'scalability', 'scale ability': 'scalability',
};

// Pre-compile regex patterns once for performance
const compiledTerms = Object.entries(techTerms)
  .sort((a, b) => b[0].length - a[0].length)  // longest first
  .map(([spoken, correct]) => ({
    regex: new RegExp(`\\b${spoken}\\b`, 'gi'),
    correct,
  }));

// Filler words/sounds that clutter transcripts
const fillerPattern = /\b(um+|uh+|hmm+|err+|ah+|like,?\s+like|you know,?\s*|basically,?\s*|actually,?\s*|so,?\s+so)\b/gi;

/**
 * Normalize voice transcript — fix tech terms that speech recognition mangles,
 * remove filler words, and clean up punctuation/spacing.
 */
export const normalizeTranscript = (text) => {
  if (!text) return text;
  let normalized = text;

  // 1. Apply tech term corrections
  for (const { regex, correct } of compiledTerms) {
    normalized = normalized.replace(regex, correct);
  }

  // 2. Remove filler words/sounds
  normalized = normalized.replace(fillerPattern, ' ');

  // 3. Clean up spacing artifacts
  normalized = normalized
    .replace(/\s+/g, ' ')             // collapse multiple spaces
    .replace(/\s([.,!?;:])/g, '$1')   // no space before punctuation
    .replace(/([.,!?;:])(\w)/g, '$1 $2')  // space after punctuation
    .trim();

  // 4. Capitalize first letter of sentences
  normalized = normalized.replace(/(^|[.!?]\s+)([a-z])/g, (_, pre, letter) => pre + letter.toUpperCase());

  return normalized;
};
