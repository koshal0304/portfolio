import { useEffect, useState } from 'react';

const ScrollProgressIndicator: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;
      setScrollProgress(Math.min(scrollPercentage, 100));
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const circumference = 2 * Math.PI * 18; // radius is 18
  const offset = circumference - (scrollProgress / 100) * circumference;

  return (
    <div className="fixed bottom-24 right-8 z-40 hidden md:block">
      <div className="relative w-14 h-14 group cursor-pointer"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="28"
            cy="28"
            r="18"
            stroke="rgba(59, 130, 246, 0.2)"
            strokeWidth="3"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="28"
            cy="28"
            r="18"
            stroke="url(#progressGradient)"
            strokeWidth="3"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-300"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))'
            }}
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-7 h-7 rounded-full bg-blue-600/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-blue-600/40 transition-all duration-300 border border-blue-400/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-blue-300 group-hover:text-blue-200 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </div>
        </div>

        {/* Percentage tooltip */}
        <div className="absolute -left-16 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="glass-morph px-3 py-1.5 rounded-lg border border-blue-500/30">
            <span className="text-xs font-medium text-blue-200">
              {Math.round(scrollProgress)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollProgressIndicator;
