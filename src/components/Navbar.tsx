import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-black/80 backdrop-blur-md shadow-md text-white border-b border-blue-900/30'
          : 'bg-transparent text-white'
      }`}
    >
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-20">
          <a
            href="#"
            className="text-2xl font-bold tracking-tight"
            style={{ textShadow: isScrolled ? 'none' : '0 0 10px rgba(59, 130, 246, 0.5)' }}
          >
            Koshal<span className="text-blue-500">Kumar</span>
          </a>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex space-x-8">
            <li>
              <a
                href="#"
                className={`font-medium hover:text-blue-400 transition-colors ${
                  isScrolled ? '' : 'hover:text-blue-300'
                }`}
                style={{ textShadow: isScrolled ? 'none' : '0 0 8px rgba(59, 130, 246, 0.4)' }}
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#experience"
                className={`font-medium hover:text-blue-400 transition-colors ${
                  isScrolled ? '' : 'hover:text-blue-300'
                }`}
                style={{ textShadow: isScrolled ? 'none' : '0 0 8px rgba(59, 130, 246, 0.4)' }}
              >
                Experience
              </a>
            </li>
            <li>
              <a
                href="#projects"
                className={`font-medium hover:text-blue-400 transition-colors ${
                  isScrolled ? '' : 'hover:text-blue-300'
                }`}
                style={{ textShadow: isScrolled ? 'none' : '0 0 8px rgba(59, 130, 246, 0.4)' }}
              >
                Projects
              </a>
            </li>
            <li>
              <a
                href="#skills"
                className={`font-medium hover:text-blue-400 transition-colors ${
                  isScrolled ? '' : 'hover:text-blue-300'
                }`}
                style={{ textShadow: isScrolled ? 'none' : '0 0 8px rgba(59, 130, 246, 0.4)' }}
              >
                Skills
              </a>
            </li>
            <li>
              <a
                href="#contact"
                className={`font-medium hover:text-blue-400 transition-colors ${
                  isScrolled ? '' : 'hover:text-blue-300'
                }`}
                style={{ textShadow: isScrolled ? 'none' : '0 0 8px rgba(59, 130, 246, 0.4)' }}
              >
                Contact
              </a>
            </li>
          </ul>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-blue-300 hover:text-white transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </nav>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className={`px-4 pt-2 pb-4 space-y-1 bg-black/95 backdrop-blur-md shadow-lg border-t border-blue-900/30`}>
            <a
              href="#"
              className="block py-2 px-3 text-base font-medium text-white rounded-md hover:bg-blue-900/30 hover:text-blue-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </a>
            <a
              href="#experience"
              className="block py-2 px-3 text-base font-medium text-white rounded-md hover:bg-blue-900/30 hover:text-blue-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Experience
            </a>
            <a
              href="#projects"
              className="block py-2 px-3 text-base font-medium text-white rounded-md hover:bg-blue-900/30 hover:text-blue-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Projects
            </a>
            <a
              href="#skills"
              className="block py-2 px-3 text-base font-medium text-white rounded-md hover:bg-blue-900/30 hover:text-blue-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Skills
            </a>
            <a
              href="#contact"
              className="block py-2 px-3 text-base font-medium text-white rounded-md hover:bg-blue-900/30 hover:text-blue-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;