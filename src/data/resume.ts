/**
 * resume.ts — the single source of truth.
 *
 * This file IS the grounding context. The agent at the bottom of the page is given
 * (a serialized form of) exactly this data and is told it may only speak to what's here.
 * The portfolio sections at the top of the page also render from this data, so the
 * "résumé you read" and the "résumé the agent knows" are provably identical.
 *
 * If something isn't in here, the agent should refuse rather than fabricate.
 */

export interface Highlight {
  /** Big number / headline metric. */
  metric: string;
  /** One-line claim. */
  claim: string;
  /** Which role this is anchored to (id from `experience`). Powers "scroll to source". */
  sourceId: string;
  /** Persona weighting — higher = lead with this for that persona. */
  weight: { recruiter: number; engineer: number; curious: number };
}

export interface Role {
  id: string;
  title: string;
  org: string;
  location: string;
  start: string;
  end: string;
  /** Short one-liner describing the mandate of the role. */
  summary: string;
  /** Bullet achievements, lifted faithfully from the résumé. */
  bullets: string[];
  tags: string[];
}

export interface Project {
  id: string;
  name: string;
  stack: string[];
  bullets: string[];
}

export interface SkillGroup {
  group: string;
  skills: string[];
}

export interface EducationItem {
  degree: string;
  school: string;
  location: string;
  gpa: string;
  start: string;
  end: string;
}

export const profile = {
  name: "Chaitanya Surabattuni",
  title: "ML/AI Engineer",
  subtitle: "GenAI & Agentic AI Evaluation",
  location: "Bay Area, CA",
  tagline: "I build AI agents — and the systems that prove they actually work.",
  yearsExperience: "3+",
  email: "chaitanyasurabattuni@gmail.com",
  phone: "+1 (945) 268-4534",
  links: {
    linkedin: "https://www.linkedin.com/in/chaitanyasurabattuni/",
    github: "https://github.com/chaitanyasurabattuni",
  },
  summary:
    "AI/ML Engineer with 3+ years of experience building and evaluating GenAI and Agentic AI systems across healthcare and enterprise AI. Currently building LLM evaluation infrastructure for an AI health coaching agent at PrimeHealth Technologies — designing ground-truth datasets, per-field accuracy metrics, LLM-as-judge frameworks, and CI-integrated regression suites. Prior production experience spans LangGraph agentic workflows, RAG pipelines, and ML systems at scale. AWS Certified Solutions Architect; MS in Artificial Intelligence (GPA 3.8), University of North Texas.",
  // Notes for the agent about what is NOT known (avoid fabrication on common asks).
  notKnown: [
    "Exact current compensation or salary expectations",
    "Visa / work-authorization specifics beyond what is stated",
  ],
} as const;

/**
 * "Beyond the résumé" — friendly, human facts the agent IS allowed to speak to
 * (interests, hobbies, what drives me, what's next). This is the ONLY personal
 * knowledge the agent has; if a personal question isn't covered here, it should
 * still refuse rather than invent.
 *
 * ⚠️ FILL THESE IN with real facts. Empty entries are skipped from the grounding,
 * so the agent won't claim anything you haven't written here.
 */
export interface PersonalFact {
  /** Short topic label, e.g. "Hobbies", "What I'm reading", "Why AI". */
  topic: string;
  /** First-person detail the agent can say. Leave "" to skip this entry. */
  detail: string;
}

export const personal: PersonalFact[] = [
  {
    topic: "Hobbies & interests",
    detail:
      "I watch movies like crazy and I'm pretty much always listening to music — both a bit obsessively. Working out is a big part of my routine too.",
  },
  {
    topic: "What I do outside work",
    detail:
      "Most of my time outside work goes to the gym, movies, and music. I recently started hiking and I'm already hooked. I'm also a people person — I love meeting new people and spending time with them.",
  },
  {
    topic: "What got me into AI",
    detail:
      "Engineering projects first pulled me in — I got fascinated by how AI actually works under the hood. My data science work then gave me a solid, practical understanding of it, and I've been all-in since.",
  },
  {
    topic: "What I'm learning / curious about lately",
    detail:
      "A lot, but evaluation is the big one right now — it's also what I do day to day — plus whatever's pushing the field forward.",
  },
  {
    topic: "What's next for me",
    detail: "I'm working toward breaking into big tech.",
  },
  {
    topic: "A fun fact about me",
    detail: "I seem to do my best work after exactly one shot of whiskey. 🥃",
  },
];

export const highlights: Highlight[] = [
  {
    metric: "71% → 93%",
    claim:
      "Lifted domain routing accuracy for a multi-channel AI health agent by building ground-truth eval datasets and per-field accuracy metrics.",
    sourceId: "primehealth",
    weight: { recruiter: 5, engineer: 5, curious: 3 },
  },
  {
    metric: "15×",
    claim:
      "Throughput of manual annotation, via an LLM-as-judge framework scoring health recommendations on a structured 0–100 rubric across 128 synthesized personas.",
    sourceId: "primehealth",
    weight: { recruiter: 4, engineer: 5, curious: 4 },
  },
  {
    metric: "silent regression",
    claim:
      "Caught a critical bug where every classifier assertion was passing vacuously — restoring meaningful CI signal and preventing undetected model drift.",
    sourceId: "primehealth",
    weight: { recruiter: 3, engineer: 5, curious: 4 },
  },
  {
    metric: "up to 90%",
    claim:
      "Reduction in model-serving costs via hybrid local/cloud execution, Redis semantic caching, and async architectures.",
    sourceId: "lmes",
    weight: { recruiter: 5, engineer: 4, curious: 3 },
  },
  {
    metric: "60%",
    claim:
      "Faster CI pipelines by decoupling LLM-dependent regression tests from deterministic unit tests, with full coverage maintained.",
    sourceId: "primehealth",
    weight: { recruiter: 2, engineer: 4, curious: 2 },
  },
];

export const experience: Role[] = [
  {
    id: "primehealth",
    title: "Jr. Agent Evaluation Engineer",
    org: "PrimeHealth Technologies",
    location: "Bay Area, CA",
    start: "Apr 2026",
    end: "Present",
    summary:
      "Building the LLM evaluation infrastructure behind a multi-channel AI health coaching agent (chat, WhatsApp, voice).",
    bullets: [
      "Built ground-truth evaluation datasets of 60+ labeled examples across 21 health intent domains and adversarial edge cases to benchmark a multi-channel AI health coaching agent (chat, WhatsApp, voice); established per-field accuracy metrics across 5 classification dimensions, driving domain routing accuracy from 71% to 93%.",
      "Designed and deployed an LLM-as-judge evaluation framework synthesizing 128 user personas and scoring AI-generated health recommendations on a structured 0–100 rubric, enabling scalable qualitative benchmarking at 15× the throughput of manual annotation.",
      "Identified and resolved a critical silent regression in the automated test suite where all classifier assertions passed vacuously, restoring meaningful CI signal and preventing undetected model drift across future model updates.",
      "Decoupled LLM-dependent regression tests from deterministic unit tests in CI, reducing average pipeline runtime by 60% while maintaining full coverage on non-LLM components.",
      "Defined KPIs and confusion-matrix reporting for a 6-field structured-output classifier; iterated on prompt design and output schema with the model team to close failure-mode gaps identified during evaluation.",
    ],
    tags: ["LLM-as-judge", "Eval datasets", "CI regression", "Structured output", "Healthcare"],
  },
  {
    id: "lmes",
    title: "Gen-AI Engineer — LLM Systems & Intelligent Automation",
    org: "LMES",
    location: "Dallas, TX",
    start: "Jul 2025",
    end: "Apr 2026",
    summary:
      "Shipped production LLM voice & chat agents and RAG pipelines, with a focus on cost and reliability.",
    bullets: [
      "Designed and deployed production LLM-powered voice and chat agents using Python and LangGraph; applied advanced prompt engineering to maintain brand consistency and eliminate hallucinations across customer-facing channels.",
      "Built RAG-based information-retrieval pipelines integrating structured (SQL/DynamoDB) and unstructured data sources, enabling automated resolution of complex member queries across 10+ microservices.",
      "Achieved up to 90% reduction in model-serving costs via hybrid local/cloud execution, Redis-based semantic caching, and async architectures; implemented CI/CD via GitHub Actions and Docker enabling rollback-ready releases.",
      "Conducted continuous QA on AI agent conversations — analyzing logs, identifying failure modes, and iterating on prompts and decision logic to improve resolution rates and interaction quality.",
      "Implemented TDD and unit-testing frameworks for AI microservices, improving reliability and enabling safe iterative model updates across concurrent AI workloads.",
    ],
    tags: ["LangGraph", "RAG", "Cost optimization", "Semantic caching", "CI/CD"],
  },
  {
    id: "gdresearch",
    title: "Data Scientist — Analytics & ML Modeling",
    org: "GD Research Pvt Ltd",
    location: "India",
    start: "May 2022",
    end: "Jul 2023",
    summary: "Built predictive models and data pipelines for enterprise decision-making.",
    bullets: [
      "Developed and deployed predictive ML models to support enterprise decision-making; improved downstream analytics accuracy by 35% across multiple business data streams through feature engineering and model optimization.",
      "Built NLP-based entity-extraction and text-classification pipelines to transform unstructured data into structured insights across large enterprise knowledge bases.",
      "Designed and automated end-to-end data ingestion and processing workflows using Apache Kafka and vector embeddings; enabled semantic search and faster data discovery for analytics teams.",
      "Collaborated with engineering teams to productionize data pipelines and models; established coding best practices and mentored junior analysts.",
    ],
    tags: ["Predictive ML", "NLP", "Kafka", "Vector embeddings"],
  },
  {
    id: "edgate",
    title: "Machine Learning Intern",
    org: "EdGate Technology",
    location: "Bengaluru, India",
    start: "Aug 2020",
    end: "Dec 2020",
    summary: "First production ML role — conversational AI and computer vision.",
    bullets: [
      "Architected a production NLP conversational AI chatbot (Python, TensorFlow, NLTK) with intent classification and entity extraction, improving automated query resolution by 30%.",
      "Built a computer-vision pipeline using CNNs achieving 95% image-recognition accuracy; executed the full ML lifecycle from data cleaning through production model integration.",
    ],
    tags: ["Conversational AI", "Computer vision", "TensorFlow"],
  },
];

export const projects: Project[] = [
  {
    id: "multiagent",
    name: "Multi-Agent AI Automation Platform",
    stack: ["LangGraph", "Python", "RAG", "SQLite", "Docker"],
    bullets: [
      "Architected a LangGraph-based agentic workflow orchestrating 3 specialized AI agents (Researcher / Coder / Reviewer) with human-in-the-loop checkpoints, iterative review cycles, and SQLite persistent session state; implemented TDD and modular OOP design enabling clean agent extension and unit testing.",
      "Implemented a RAG pipeline over structured and unstructured data with efficient retrieval and minimal resource overhead.",
    ],
  },
  {
    id: "triton",
    name: "High-Throughput ML Inference Microservice",
    stack: ["NVIDIA Triton", "Kubernetes", "Kafka", "Redis", "Prometheus/Grafana"],
    bullets: [
      "Engineered a production GPU inference service on Kubernetes using NVIDIA Triton with async batching via Kafka and Redis, achieving 40% P99 latency reduction.",
      "Deployed a Prometheus/Grafana observability stack with real-time SLA alerting; GPU/accelerator-optimized inference.",
    ],
  },
  {
    id: "churn",
    name: "Financial Churn & Risk Prediction System",
    stack: ["Python", "Scikit-learn", "Pandas", "MySQL", "SQL"],
    bullets: [
      "Designed a supervised ML pipeline predicting member churn and LTV using classification and regression models; built an evaluation framework tracking accuracy, precision/recall, and ROC-AUC with dashboards surfacing risk segments.",
    ],
  },
];

export const skills: SkillGroup[] = [
  {
    group: "ML & AI Frameworks",
    skills: ["PyTorch", "TensorFlow", "HuggingFace Transformers", "NVIDIA Triton", "TorchServe", "OpenCV", "Scikit-learn"],
  },
  {
    group: "GenAI / LLM / Agentic AI",
    skills: ["LangGraph", "LangChain", "Prompt Engineering", "RAG", "Vector DBs (Qdrant, Chroma)", "Multi-Agent Orchestration", "Tool Use / Function Calling"],
  },
  {
    group: "Agent Evaluation & QA",
    skills: ["LangSmith", "Benchmarking Pipelines", "KPI Design (F1/ROUGE/Hallucination Rate/Latency)", "Automated Test Harnesses", "Failure Mode Analysis", "TDD"],
  },
  {
    group: "NLP & Conversational AI",
    skills: ["HuggingFace", "NLTK", "Intent Classification", "Voice/Chat Agent Development"],
  },
  {
    group: "Inference Optimization",
    skills: ["NVIDIA Triton", "Async Batching", "Redis Semantic Caching", "Hybrid Local/Cloud Execution", "Kubernetes HPA"],
  },
  {
    group: "Cloud & MLOps",
    skills: ["AWS", "Docker", "Kubernetes", "GitHub Actions CI/CD"],
  },
];

export const education: EducationItem[] = [
  {
    degree: "MS — Artificial Intelligence",
    school: "University of North Texas",
    location: "Denton, TX",
    gpa: "3.8",
    start: "Aug 2023",
    end: "May 2025",
  },
  {
    degree: "BE — Electronics & Communication Engineering",
    school: "Visvesvaraya Technological University",
    location: "India",
    gpa: "3.7",
    start: "Aug 2018",
    end: "May 2022",
  },
];

export const certifications = ["AWS Certified Solutions Architect – Associate", "MLOps"];
