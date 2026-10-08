import { roles, featuredProject } from '../../data/profile.ts';
import type { Gesture, Mood } from './signal';

export interface Beat {
  text: string;
  gesture: Gesture;
  mood?: Mood;
  /** Element the guide points at and highlights. */
  focus?: string;
  /** Offer a "Show me" jump. */
  href?: string;
  /** Answer to a visitor's own question (announced to screen readers). */
  reply?: boolean;
  /** Spoken sentences when they are not simply `text` split (answers quote KB sentences verbatim). */
  parts?: string[];
  /** Small print under the caption, shown but not spoken. */
  note?: string;
}

/** Fixed so they can be pre-rendered; details go in `note`. */
export const REPLIES = {
  blocked: "Nice try. My guardrail caught that as an injection attempt. Ask me about Koshal's work instead?",
  noEvidence: "I don't have evidence for that in Koshal's portfolio, and I don't make things up. Try asking about RAG, agents or computer vision.",
};

/** DOM order matters: the active section is the last one scrolled past. */
export const GUIDE_SECTIONS = ['hero', 'ai-sandbox', 'experience', 'skills', 'projects', 'achievements', 'education', 'contact'];

/** Which side the guide docks on (desktop), alternating so it travels as you scroll. */
export const DOCK: Record<string, 'left' | 'right'> = {
  hero: 'right',
  'ai-sandbox': 'left',
  experience: 'right',
  skills: 'left',
  projects: 'right',
  achievements: 'left',
  education: 'right',
  contact: 'left',
};

const current = roles[0];

export const SCRIPT: Record<string, Beat[]> = {
  hero: [
    {
      text: "Hi, I'm Koshal's digital twin. He's an AI engineer in Bengaluru who ships production LLM systems, and I'm your guide.",
      gesture: 'wave',
      mood: 'happy',
    },
    {
      text: 'These four numbers are measured results, not adjectives. Recall from 0.48 to 0.81 is my favourite.',
      gesture: 'point',
      focus: '[data-guide="proof"]',
    },
  ],
  'ai-sandbox': [
    {
      text: "This lab isn't a mock. Ask it anything and a real hybrid retriever ranks evidence from Koshal's work, right in your browser.",
      gesture: 'present',
      mood: 'excited',
      focus: '#rag-query',
    },
    {
      text: 'Feeling adventurous? Open the Defense Sandbox and try to break the guardrail.',
      gesture: 'point',
      mood: 'curious',
      focus: '[data-guide="defense-tab"]',
    },
  ],
  experience: [
    {
      text: `Right now he's ${current.title} at ${current.company}, building a LangGraph multi-agent HR platform from scratch.`,
      gesture: 'point',
      focus: '[data-guide="current-role"]',
    },
    {
      text: 'Before that, he owned the AI roadmap at Renan solo, and shipped three production systems in three months at Ripik.ai.',
      gesture: 'explain',
    },
  ],
  skills: [
    {
      text: 'Agents, retrieval, backend, cloud and ML. Drag the constellation to explore the whole stack.',
      gesture: 'think',
      mood: 'curious',
      focus: '[data-guide="skills-sphere"]',
    },
  ],
  projects: [
    {
      text: `Here's the featured build: ${featuredProject.name}. Watch data flow through every stage of the architecture.`,
      gesture: 'point',
      mood: 'excited',
      focus: '[data-guide="featured-project"]',
    },
  ],
  achievements: [
    {
      text: 'Sixty-nine percent better recall. Sixty percent lower storage cost. Ninety-eight percent accuracy. All from production.',
      gesture: 'celebrate',
      mood: 'excited',
      focus: '[data-guide="metrics"]',
    },
  ],
  education: [
    {
      text: 'A B.Tech in Automation and Robotics, so building a robot guide like me was always on the cards.',
      gesture: 'nod',
      mood: 'happy',
      focus: '[data-guide="education"]',
    },
  ],
  contact: [
    {
      text: "If you've come this far, let's talk. The form is right here, or press slash to search anything first.",
      gesture: 'present',
      mood: 'happy',
      focus: '[data-guide="contact-form"]',
    },
  ],
};

export const QUIPS: Beat[] = [
  { text: 'Hello again! Ask me anything about Koshal\'s work. I only answer from real evidence.', gesture: 'wave', mood: 'happy' },
  { text: "I'm rendered live with a custom hologram shader. No video, no pre-baked animation.", gesture: 'present', mood: 'curious' },
  { text: 'Every gesture you see is computed from where things are on the page, frame by frame.', gesture: 'explain' },
];
