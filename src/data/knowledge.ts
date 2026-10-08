import { roles, featuredProject, additionalProjects, ALL_SKILLS } from './profile.ts';
import { buildIndex, type Chunk, type Index } from '../lib/retrieval.ts';

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Facts that live only in presentational sections (hero, achievements, education, contact).
const PROFILE: Chunk[] = [
  {
    id: 'profile-summary',
    title: 'Who is Koshal Kumar',
    section: 'profile',
    href: '#hero',
    meta: 'AI Engineer · Bengaluru, India',
    text: 'Koshal Kumar is an AI Engineer in Bengaluru, India who designs and deploys production LLM systems. His focus is LangGraph multi-agent DAGs, schema-aware NL-to-SQL pipelines, hybrid vector search with FAISS and Pinecone, and AST-based security guardrails.',
  },
  {
    id: 'why-hire',
    title: 'Why hire Koshal',
    section: 'profile',
    href: '#ai-sandbox',
    text: 'Koshal has shipped 6+ production AI systems across Alphabetum Technology, Renan and Ripik.ai, including multi-agent platforms, enterprise RAG and computer vision pipelines. He delivers measurable gains, such as lifting RAG recall from 0.48 to 0.81 and cutting S3 storage cost by 60%. He works end to end across LangGraph, LangChain, PyTorch, FAISS, Pinecone, FastAPI and PostgreSQL, with enterprise security rigor: AST SQL validation, RBAC tenant isolation and prompt-injection defense.',
  },
  {
    id: 'impact-metrics',
    title: 'Measured production impact',
    section: 'impact',
    href: '#achievements',
    text: 'Improved RAG column recall by 69%, from 0.48 to 0.81. Reached 98% validation accuracy with a fine-tuned ResNet18 classifier. Cut AWS S3 storage cost by 60% with a parallelized compression pipeline. Eliminated 80% of manual image review time with a Gemini API pipeline.',
  },
  {
    id: 'education',
    title: 'Education & certifications',
    section: 'profile',
    href: '#education',
    meta: '2018 – 2022',
    text: 'B.Tech in Automation & Robotics Engineering from Gulzar Group of Institutes, Ludhiana (2018 – 2022). Certified in Machine Learning by Coding Ninjas and as a Data Scientist by AlmaBetter.',
  },
  {
    id: 'contact',
    title: 'Contact & hiring',
    section: 'profile',
    href: '#contact',
    text: 'Reach Koshal by email at koshalkumar0304@gmail.com, on LinkedIn, or on GitHub at github.com/koshal0304. He is based in Bengaluru, India.',
  },
];

export const KNOWLEDGE: Chunk[] = [
  ...PROFILE,
  ...roles.flatMap((r): Chunk[] => [
    {
      id: `role-${slug(r.company)}`,
      title: `${r.title} at ${r.company}`,
      section: 'experience',
      href: '#experience',
      meta: `${r.company} · ${r.duration}`,
      text: `${r.summary} ${r.subtitle ? `${r.subtitle}.` : ''} Stack: ${r.allTags.join(', ')}.`,
    },
    ...r.projects.map((p) => ({
      id: `role-${slug(r.company)}-${slug(p.name)}`,
      title: p.name,
      section: 'experience' as const,
      href: '#experience',
      meta: `${r.company} · ${r.duration}`,
      text: p.description,
    })),
  ]),
  ...[featuredProject, ...additionalProjects].map((p) => ({
    id: `project-${p.id}`,
    title: p.name,
    section: 'project' as const,
    href: '#projects',
    meta: p.subtitle,
    text: `${p.description} Architecture: ${p.pipeline.join(' → ')}. Built with ${p.techStack.join(', ')}.`,
  })),
  ...[...new Set(ALL_SKILLS.map((s) => s.category))].map((category) => ({
    id: `skills-${slug(category)}`,
    title: `${category} skills`,
    section: 'skills' as const,
    href: '#skills',
    text: `Skills in ${category}: ${ALL_SKILLS.filter((s) => s.category === category)
      .map((s) => s.name)
      .join(', ')}.`,
  })),
];

let index: Index | undefined;
/** Built lazily on first use (a few ms) and shared by the AI Lab and the command palette. */
export const getIndex = () => (index ??= buildIndex(KNOWLEDGE));
