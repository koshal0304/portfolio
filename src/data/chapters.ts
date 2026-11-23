// The page is a journey in eight chapters. Section ids, the swarm's formations, the chapter rail and
// the guided tour all follow this order.
export const CHAPTERS = [
  { id: 'hero', n: '01', label: 'Hello' },
  { id: 'ai-sandbox', n: '02', label: 'Live lab' },
  { id: 'experience', n: '03', label: 'Career' },
  { id: 'skills', n: '04', label: 'Stack' },
  { id: 'projects', n: '05', label: 'Work' },
  { id: 'achievements', n: '06', label: 'Impact' },
  { id: 'education', n: '07', label: 'Foundations' },
  { id: 'contact', n: '08', label: 'Contact' },
] as const;

export const CHAPTER_IDS: string[] = CHAPTERS.map((c) => c.id);
