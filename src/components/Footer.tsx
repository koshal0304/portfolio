import React from 'react';
import { Github as GitHub, Linkedin, Mail, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white py-12 border-t border-blue-900/30">
      <div className="container mx-auto px-4">
        {/* Moving stars background for footer */}
        <div className="absolute inset-x-0 bottom-0 h-64 overflow-hidden -z-10 opacity-30 pointer-events-none">
          {Array.from({ length: 40 }).map((_, i) => {
            // Calculate animation properties for continuous movement
            const animationDuration = Math.random() * 60 + 30; // Between 30-90s for slow drift
            const animationDelay = Math.random() * -60; // Negative delay for immediate start at different positions
            const isLargeStar = Math.random() < 0.15; // 15% chance of being a larger star

            // Choose a random movement direction for each star
            const movementTypes = ['moveStar', 'moveStarRight', 'moveStarLeft', 'moveStarDiagonal'];
            const randomMovement = movementTypes[Math.floor(Math.random() * movementTypes.length)];

            return (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${isLargeStar ? Math.random() * 2.5 + 1.5 : Math.random() * 2 + 1}px`,
                  height: `${isLargeStar ? Math.random() * 2.5 + 1.5 : Math.random() * 2 + 1}px`,
                  opacity: Math.random() * 0.7 + 0.3,
                  backgroundColor: isLargeStar ? '#f0f9ff' : '#ffffff',
                  boxShadow: isLargeStar ? '0 0 6px rgba(255, 255, 255, 0.7)' : '0 0 3px rgba(255, 255, 255, 0.6)',
                  animation: `${randomMovement} ${animationDuration}s linear infinite ${animationDelay}s, pulse ${Math.random() * 3 + 1}s ease-in-out infinite`
                }}
              />
            );
          })}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-bold">Koshal<span className="text-blue-500">Kumar</span></h2>
            <p className="text-blue-200/70 mt-1">Developer & Data Scientist</p>
          </div>

          <div className="flex space-x-6 mb-6 md:mb-0">
            <a
              href="mailto:koshalkumar0304@gmail.com"
              className="text-blue-200/70 hover:text-blue-400 transition-colors"
              aria-label="Email"
            >
              <Mail size={20} />
            </a>
            <a
              href="tel:+918218806349"
              className="text-blue-200/70 hover:text-blue-400 transition-colors"
              aria-label="Phone"
            >
              <Phone size={20} />
            </a>
            <a
              href="https://github.com/koshal0304"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-200/70 hover:text-blue-400 transition-colors"
              aria-label="GitHub"
            >
              <GitHub size={20} />
            </a>
            <a
              href="https://linkedin.com/in/koshal-kumar-970233240"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-200/70 hover:text-blue-400 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin size={20} />
            </a>
          </div>
        </div>

        <div className="border-t border-blue-900/30 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-blue-200/70 text-sm">
            &copy; {currentYear} Koshal Kumar. All rights reserved.
          </p>

          <nav className="mt-4 md:mt-0">
            <ul className="flex space-x-6">
              <li>
                <a href="#" className="text-blue-200/70 hover:text-blue-400 text-sm transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#projects" className="text-blue-200/70 hover:text-blue-400 text-sm transition-colors">
                  Projects
                </a>
              </li>
              <li>
                <a href="#skills" className="text-blue-200/70 hover:text-blue-400 text-sm transition-colors">
                  Skills
                </a>
              </li>
              <li>
                <a href="#contact" className="text-blue-200/70 hover:text-blue-400 text-sm transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;