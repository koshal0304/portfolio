import { useState, useEffect } from 'react';

const SECTION_IDS = ['hero', 'ai-sandbox', 'experience', 'skills', 'projects', 'education', 'contact'];

/**
 * Active section = the last section (in DOM order) whose top has crossed 40% of the viewport.
 * Elements are looked up on every check, so lazily-mounted sections are tracked correctly.
 */
export function useActiveSection(ids: string[] = SECTION_IDS): string {
  const [activeSection, setActiveSection] = useState<string>(() => {
    const hashId = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '';
    return ids.includes(hashId) ? hashId : ids[0];
  });

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      setActiveSection(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [ids]);

  return activeSection;
}
