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
  /** Buttons offered under the caption. */
  actions?: ('tour' | 'ask')[];
}

/** Fixed so they can be pre-rendered; details go in `note`. */
export const REPLIES = {
  blocked: "Nice try. My guardrail caught that as an injection attempt. Ask me about Koshal's work instead?",
  noEvidence: "I don't have evidence for that in Koshal's portfolio, and I don't make things up. Try asking about RAG, agents or computer vision.",
};

const HELLO = "I'm Koshal's digital twin. He's an AI engineer in Bengaluru who ships production LLM systems, and I'll be your guide.";
/** The first hello depends on the visitor's clock, and on whether they've been here before. */
export const GREETINGS = {
  morning: `Good morning! ${HELLO}`,
  afternoon: `Good afternoon! ${HELLO}`,
  evening: `Good evening! ${HELLO}`,
  returning: 'Welcome back! Good to see you again. Want the quick tour this time, or shall I answer a question?',
};

export function greeting(): Beat {
  let returning = false;
  try {
    returning = localStorage.getItem('twin:visited') === '1';
    localStorage.setItem('twin:visited', '1');
  } catch {
    // private mode: every visit is a first visit
  }
  const hour = new Date().getHours();
  const text = returning ? GREETINGS.returning : hour < 12 ? GREETINGS.morning : hour < 17 ? GREETINGS.afternoon : GREETINGS.evening;
  return { text, gesture: 'wave', mood: 'happy', actions: ['tour', 'ask'] };
}

/** Questions a recruiter tends to ask, one tap away (answered from the knowledge base). */
export const SUGGESTIONS = ['Why should we hire him?', 'How did he improve RAG recall?', "What's he building right now?", 'Computer vision experience?'];

export const NUDGE: Beat = {
  text: "Still exploring? I can give you the ninety-second tour whenever you're ready.",
  gesture: 'wave',
  mood: 'happy',
  actions: ['tour'],
};
export const SURPRISE: Beat = {
  text: 'Okay, okay, you found my ticklish spot! Now, shall we look at some real engineering?',
  gesture: 'celebrate',
  mood: 'excited',
  actions: ['tour'],
};
export const LISTEN_ERROR: Beat = {
  text: "Sorry, I didn't catch that. Could you try again, or type it instead?",
  gesture: 'shrug',
  mood: 'curious',
  reply: true,
};
export const THANKS: Beat = {
  text: "Your message is ready to go. He'll be really glad you reached out!",
  gesture: 'celebrate',
  mood: 'excited',
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
      text: 'A B.Tech in Automation and Robotics. So building a digital twin like me was always on the cards.',
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

/**
 * The guided tour: fly to each chapter while saying a short travel line (the way a person talks
 * while walking you somewhere), then that chapter's beats once you arrive.
 */
export const TOUR: { id: string; lead?: Beat; beats: Beat[] }[] = [
  {
    id: 'hero',
    beats: [
      {
        text: "Great, let's go. I'll walk you through the highlights in about ninety seconds. Pause me whenever you like.",
        gesture: 'present',
        mood: 'happy',
      },
      SCRIPT.hero[1],
    ],
  },
  { id: 'ai-sandbox', lead: { text: 'First stop, the lab.', gesture: 'point', mood: 'excited' }, beats: SCRIPT['ai-sandbox'] },
  { id: 'experience', lead: { text: "Now, where he's been shipping all this.", gesture: 'explain' }, beats: SCRIPT.experience },
  { id: 'skills', lead: { text: "Here's the stack behind it.", gesture: 'explain' }, beats: SCRIPT.skills },
  { id: 'projects', lead: { text: 'And now, the work itself.', gesture: 'present', mood: 'excited' }, beats: SCRIPT.projects },
  { id: 'achievements', lead: { text: 'So, what did it all add up to?', gesture: 'think', mood: 'curious' }, beats: SCRIPT.achievements },
  { id: 'education', lead: { text: 'Last stop, where it all started.', gesture: 'explain' }, beats: SCRIPT.education },
  {
    id: 'contact',
    beats: [
      {
        text: "And that's the tour! If he sounds like a fit for your team, the form is right here. Or ask me anything first. Thanks for stopping by.",
        gesture: 'wave',
        mood: 'happy',
        focus: '[data-guide="contact-form"]',
        actions: ['ask'],
      },
    ],
  },
];

export const QUIPS: Beat[] = [
  { text: 'Hello again! Ask me anything about Koshal\'s work. I only answer from real evidence.', gesture: 'wave', mood: 'happy' },
  { text: "I'm rendered live in your browser, no video. Every blink and glance is computed in real time.", gesture: 'present', mood: 'curious' },
  { text: 'Every gesture you see is computed from where things are on the page, frame by frame.', gesture: 'explain' },
];
