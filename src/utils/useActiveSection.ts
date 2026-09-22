import { useState, useEffect } from 'react';

const SECTION_IDS = ['hero', 'ai-sandbox', 'experience', 'skills', 'projects', 'education', 'contact'];

export function useActiveSection(): string {
  const [activeSection, setActiveSection] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashId = window.location.hash.replace('#', '');
      if (SECTION_IDS.includes(hashId)) return hashId;
    }
    return 'hero';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hashId = window.location.hash.replace('#', '');
      if (SECTION_IDS.includes(hashId)) {
        setActiveSection(hashId);
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    const observers: IntersectionObserver[] = [];

    SECTION_IDS.forEach((id) => {
      const element = document.getElementById(id);
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        { threshold: 0.25, rootMargin: '-60px 0px -40% 0px' }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  return activeSection;
}

