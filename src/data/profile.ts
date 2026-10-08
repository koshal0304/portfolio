// Single source of truth for profile content: rendered by the section components
// and indexed by the in-browser retrieval engine (src/data/knowledge.ts).

export interface RoleData {
  title: string;
  company: string;
  location: string;
  duration: string;
  subtitle?: string;
  summary: string;
  projects: { name: string; description: string }[];
  tags: string[];
  allTags: string[];
}

export const roles: RoleData[] = [
  {
    title: 'AI Engineer',
    company: 'Alphabetum Technology',
    location: 'Bengaluru, India',
    duration: '04/2026 – Present',
    subtitle: 'AI-Powered HRMS Platform | Multi-Agent System (LangGraph, FastAPI, PostgreSQL)',
    summary:
      'Built a multi-agent AI platform from scratch to automate core HR workflows — recruitment, compensation analytics, employee co-pilot, and workforce simulation — designed to replace manual HR processes end-to-end.',
    projects: [
      {
        name: 'State-Machine-Driven Multi-Agent System',
        description:
          'Architected a multi-agent system using LangGraph, modeling 4 HR workflows as DAGs with conditional routing logic for dynamic decision-making.',
      },
      {
        name: 'Schema-Aware NL-to-SQL Pipeline',
        description:
          'Engineered a pipeline converting natural language into optimized, read-only PostgreSQL queries with automatic multi-tenant data isolation.',
      },
      {
        name: 'RBAC Security & Prompt Injection Defense',
        description:
          'Implemented RBAC-based access control and prompt-injection detection to secure sensitive PII and compensation data at the agent layer.',
      },
      {
        name: 'Predictive Attrition-Risk Model',
        description:
          'Developed an attrition-risk model using weighted behavioral signals (leave patterns, overtime, salary stagnation) to generate real-time HR alerts.',
      },
      {
        name: 'Sentiment Analysis & Document Generation',
        description:
          'Integrated DistilBERT-based sentiment analysis with LRU caching, plus an automated document-generation engine for offer letters, appraisals, and certificates (PDF/DOCX).',
      },
    ],
    tags: ['LangGraph', 'FastAPI', 'PostgreSQL', 'Multi-Agent DAGs', 'NL-to-SQL', 'DistilBERT'],
    allTags: [
      'LangGraph',
      'FastAPI',
      'PostgreSQL',
      'Multi-Agent DAGs',
      'NL-to-SQL',
      'DistilBERT',
      'Python',
      'RBAC',
      'Prompt-Injection Defense',
      'LRU Cache',
      'PDF/DOCX Automation',
      'Predictive Modeling',
    ],
  },
  {
    title: 'AI Product Engineer',
    company: 'Renan',
    location: 'Bengaluru, India',
    duration: '05/2025 – 03/2026',
    subtitle: "Renan's Analytics Platform (LangChain, Azure OpenAI, RAG, LangGraph)",
    summary:
      'Owned the AI feature roadmap solo — end to end, from architecture to production — across a stack that shifted per project between LLMs, vector search, SQL engines, and cloud infrastructure.',
    projects: [
      {
        name: 'Clarification Agent (Project Friday)',
        description:
          'Built with LangChain and Azure OpenAI to detect vague user queries and respond with contextual summaries, SQL explanations, and smart follow-ups. Added session-based caching to cut redundant API calls and standardized output schemas.',
      },
      {
        name: 'SQL Validation Pipeline (Project Friday)',
        description:
          'Designed a 4-stage validation engine (syntax → semantic → intent → execution) combining LLMs, SQLGlot, and Metabase to catch bad queries before production. Context-aware auto-correction with separate PostgreSQL/MongoDB rule sets and destructive operation guardrails.',
      },
      {
        name: 'RAG Metadata Enrichment (0.48 → 0.81 Recall)',
        description:
          'Solved a critical retrieval bottleneck — column recall was stuck at 0.48, causing wrong-column matches and poor answers. Built an LLM-driven auto-labeling pipeline to generate rich column metadata (business context, keyword patterns, analytical intent) with zero manual annotation, improving recall to 0.81 (69% gain).',
      },
      {
        name: 'Document Q&A Agent (Project Friday)',
        description:
          'Built end-to-end — PDFs, Excel, and Word docs parsed into per-page/sheet markdown, stored in S3, and tagged using Gemini-generated metadata. LangGraph agent filters by metadata per query to ground answers in the correct source only, minimizing hallucinations and token cost. Integrated Python backend with Node.js API layer.',
      },
    ],
    tags: ['LangChain', 'Azure OpenAI', 'LangGraph', 'RAG', 'SQLGlot', 'PostgreSQL'],
    allTags: [
      'LangChain',
      'Azure OpenAI',
      'LangGraph',
      'RAG',
      'SQLGlot',
      'PostgreSQL',
      'Metabase',
      'MongoDB',
      'Gemini API',
      'AWS S3',
      'Node.js',
      'Python',
    ],
  },
  {
    title: 'ML/Backend Intern — Production Systems',
    company: 'Ripik.ai',
    location: 'Noida, India',
    duration: '01/2025 – 04/2025',
    subtitle: 'Production Systems (PyTorch, AWS, Gemini API)',
    summary: 'Three months, three shipped production systems.',
    projects: [
      {
        name: 'Parallelized S3 Compression Pipeline (60% Cost Reduction)',
        description:
          'Built a parallelized Boto3 + PIL compression pipeline (150 workers) that processed 10K+ files and cut S3 storage costs by 60%, with full audit logging.',
      },
      {
        name: 'ResNet18 Kiln Classifier (98% Validation Accuracy)',
        description:
          'Fine-tuned ResNet18 on a custom kiln-image dataset (3 classes) — hit 98% validation accuracy — and shipped automated sorting plus a confusion-matrix view for the team.',
      },
      {
        name: 'Gemini API Image Analysis Pipeline (80% Time Reduction)',
        description:
          'Built a Gemini API image-analysis pipeline (150-thread concurrency) processing 100+ images/day into structured JSON reports, cutting manual review time by 80%.',
      },
    ],
    tags: ['PyTorch', 'AWS S3', 'Boto3', 'ResNet18', 'Gemini API', 'PIL'],
    allTags: ['PyTorch', 'AWS S3', 'Boto3', 'ResNet18', 'Gemini API', 'PIL', 'Concurrency', 'Computer Vision'],
  },
];

export interface Project {
  id: string;
  name: string;
  subtitle?: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveDemoUrl?: string;
  featured?: boolean;
  /** Data-flow stages, rendered as an animated architecture strip. */
  pipeline: string[];
}

export const featuredProject: Project = {
  id: 'image-retrieval',
  name: 'AI-Powered Image Retrieval System',
  subtitle: 'Semantic Image Search App | CLIP, FAISS, Flask, React',
  description:
    'Full-stack semantic image search app using CLIP embeddings and FAISS for fast similarity search across 1000+ images, with a Flask REST API delivering sub-second query times. Features K-means clustering, hybrid text-image search with weighted scoring, real-time upload with auto-embedding, and an interactive Material-UI frontend (drag-and-drop, infinite scroll, favorites, confidence scores).',
  techStack: ['CLIP', 'FAISS', 'Flask', 'React', 'Material-UI', 'Python', 'K-Means'],
  pipeline: ['Image upload', 'CLIP encoder', 'FAISS index', 'K-means clusters', 'Flask API', 'React UI'],
  featured: true,
};

export const additionalProjects: Project[] = [
  {
    id: 'knowledge-assistant',
    name: 'Personal Knowledge Assistant',
    subtitle: 'RAG Chatbot | Gemini, LangChain, Pinecone',
    description:
      'RAG-based chatbot using Google Gemini, LangChain, and Streamlit, with a document pipeline using BGE embeddings and Pinecone for semantic search and retrieval. Modular architecture with configurable chunking, retrieval, and prompt engineering.',
    techStack: ['Gemini API', 'LangChain', 'Pinecone', 'BGE Embeddings', 'Streamlit', 'Python'],
    pipeline: ['Documents', 'Chunker', 'BGE embeddings', 'Pinecone', 'Gemini + LangChain', 'Chat UI'],
    githubUrl: 'https://github.com/koshal0304/personal-knowledge-assistant',
    liveDemoUrl: 'https://personal-knowledge-assistant-g.streamlit.app/',
  },
  {
    id: 'object-detection',
    name: 'Real-Time Object Detection & Monitoring',
    subtitle: 'Vision Pipeline | OpenCV, PyTorch, Gemini API',
    description:
      'Phone-usage detection app with RTSP video stream via OpenCV. Concurrent GPU inference via ThreadPoolExecutor with tenacity retries and live Matplotlib/Seaborn dashboard.',
    techStack: ['Streamlit', 'Gemini API', 'OpenCV', 'PyTorch', 'ThreadPoolExecutor'],
    pipeline: ['RTSP stream', 'OpenCV frames', 'Threaded GPU inference', 'Gemini API', 'Live dashboard'],
  },
  {
    id: 'yolo-detector',
    name: 'Webcam YOLO Object Detector',
    subtitle: 'Real-Time Vision | YOLO, OpenCV, Streamlit',
    description:
      'Real-time object detection application using YOLO algorithm to identify objects through webcam feed with high accuracy and low latency.',
    techStack: ['Python', 'Streamlit', 'OpenCV', 'YOLO', 'Computer Vision'],
    pipeline: ['Webcam', 'OpenCV capture', 'YOLO detector', 'Bounding boxes', 'Streamlit'],
    githubUrl: 'https://github.com/koshal0304/webcamyolodetector',
    liveDemoUrl: 'https://webcamyolodetector-l.streamlit.app/',
  },
  {
    id: 'talent-scout',
    name: 'Talent Scout AI Hiring Assistant',
    subtitle: 'AI Talent Screening | NLP & Document Parsing',
    description:
      'AI-powered application that helps recruiters identify top candidates based on semantic resume analysis and job descriptions, streamlining technical screening.',
    techStack: ['Python', 'Streamlit', 'NLP', 'Machine Learning', 'Document Processing'],
    pipeline: ['Resume + JD', 'Document parser', 'NLP features', 'Semantic match', 'Ranked shortlist'],
    githubUrl: 'https://github.com/koshal0304/talent-scout-ai',
    liveDemoUrl: 'https://talentscoutaihiringassistant.streamlit.app/',
  },
];

export interface SkillData {
  name: string;
  category: string;
}

export const ALL_SKILLS: SkillData[] = [
  // LLM & Agents
  { name: 'LangGraph', category: 'LLM & Agents' },
  { name: 'LangChain', category: 'LLM & Agents' },
  { name: 'Multi-Agent Systems', category: 'LLM & Agents' },
  { name: 'RAG Pipelines', category: 'LLM & Agents' },
  { name: 'Agentic RAG', category: 'LLM & Agents' },
  { name: 'NL-to-SQL Engines', category: 'LLM & Agents' },
  { name: 'Prompt Engineering', category: 'LLM & Agents' },
  { name: 'Evaluation Harnesses', category: 'LLM & Agents' },
  { name: 'Model Context Protocol (MCP)', category: 'LLM & Agents' },
  { name: 'Semantic Routing', category: 'LLM & Agents' },
  { name: 'LLM Fine-Tuning', category: 'LLM & Agents' },

  // Model APIs & Retrieval
  { name: 'OpenAI API', category: 'Model APIs & Retrieval' },
  { name: 'Azure OpenAI', category: 'Model APIs & Retrieval' },
  { name: 'Google Gemini API', category: 'Model APIs & Retrieval' },
  { name: 'Hugging Face', category: 'Model APIs & Retrieval' },
  { name: 'Vector Search', category: 'Model APIs & Retrieval' },
  { name: 'Hybrid Search', category: 'Model APIs & Retrieval' },
  { name: 'Embeddings (BGE/CLIP)', category: 'Model APIs & Retrieval' },
  { name: 'Pinecone', category: 'Model APIs & Retrieval' },
  { name: 'FAISS', category: 'Model APIs & Retrieval' },
  { name: 'ChromaDB', category: 'Model APIs & Retrieval' },
  { name: 'LlamaIndex', category: 'Model APIs & Retrieval' },

  // Backend & APIs
  { name: 'Python', category: 'Backend & APIs' },
  { name: 'FastAPI', category: 'Backend & APIs' },
  { name: 'Node.js', category: 'Backend & APIs' },
  { name: 'TypeScript', category: 'Backend & APIs' },
  { name: 'Django', category: 'Backend & APIs' },
  { name: 'Async SQLAlchemy', category: 'Backend & APIs' },
  { name: 'REST API Design', category: 'Backend & APIs' },
  { name: 'JWT / OAuth2', category: 'Backend & APIs' },
  { name: 'Redis', category: 'Backend & APIs' },
  { name: 'Celery', category: 'Backend & APIs' },
  { name: 'WebSockets', category: 'Backend & APIs' },
  { name: 'Prisma ORM', category: 'Backend & APIs' },
  { name: 'Microsoft Graph API', category: 'Backend & APIs' },

  // Cloud & Infra
  { name: 'AWS (S3, EC2, Lambda)', category: 'Cloud & Infra' },
  { name: 'Boto3', category: 'Cloud & Infra' },
  { name: 'Docker', category: 'Cloud & Infra' },
  { name: 'Azure DevOps', category: 'Cloud & Infra' },
  { name: 'GitHub Actions', category: 'Cloud & Infra' },
  { name: 'Microservices', category: 'Cloud & Infra' },
  { name: 'Rate-Limiting Middleware', category: 'Cloud & Infra' },
  { name: 'Structured Logging', category: 'Cloud & Infra' },

  // Data & ML
  { name: 'PyTorch', category: 'Data & ML' },
  { name: 'TensorFlow', category: 'Data & ML' },
  { name: 'scikit-learn', category: 'Data & ML' },
  { name: 'ResNet18', category: 'Data & ML' },
  { name: 'DistilBERT', category: 'Data & ML' },
  { name: 'YOLO', category: 'Data & ML' },
  { name: 'Computer Vision', category: 'Data & ML' },
  { name: 'OpenCV', category: 'Data & ML' },
  { name: 'Sentence Transformers', category: 'Data & ML' },
  { name: 'SQLGlot', category: 'Data & ML' },
  { name: 'Pandas', category: 'Data & ML' },
  { name: 'NumPy', category: 'Data & ML' },
  { name: 'MLflow', category: 'Data & ML' },
  { name: 'Weights & Biases', category: 'Data & ML' },

  // Databases
  { name: 'PostgreSQL', category: 'Databases' },
  { name: 'MongoDB', category: 'Databases' },
  { name: 'MySQL', category: 'Databases' },
  { name: 'Redis (Cache/Queue)', category: 'Databases' },
  { name: 'Pinecone (Vector DB)', category: 'Databases' },
];
