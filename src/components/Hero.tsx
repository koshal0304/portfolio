import React, { useEffect, useRef, useState } from 'react';
import { Github as GitHub, Linkedin, Mail, Phone, ChevronDown, Code, Database, Server, Cpu, Globe, Layers } from 'lucide-react';
import ParallaxEffect from './ParallaxEffect';
import AnimatedProfileFrame from './AnimatedProfileFrame';
import TechCard from './TechCard';
// Import your profile picture - replace this with your actual image path
// import profileImage from '../assets/profile.jpg';
// Temporary placeholder until you add your image
const profileImage = '/src/assets/img1.png';

const Hero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    const handleScroll = () => {
      if (!heroRef.current || !textRef.current) return;

      const scrollPosition = window.scrollY;
      const opacity = 1 - Math.min(1, scrollPosition / 700);
      const yValue = scrollPosition * 0.5;

      textRef.current.style.opacity = `${opacity}`;
      textRef.current.style.transform = `translateY(${yValue}px)`;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Remove unused state

  return (
    <div
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-transparent"
    >
      {/* Enhanced space-themed background elements */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-900/10 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black via-blue-950/20 to-black/80"></div>

      {/* Additional moving stars for Hero section */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 80 }).map((_, i) => {
          // Calculate animation properties for continuous movement
          const animationDuration = Math.random() * 80 + 40; // Between 40-120s for slow drift
          const animationDelay = Math.random() * -80; // Negative delay for immediate start at different positions
          const isLargeStar = Math.random() < 0.2; // 20% chance of being a larger star

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
                width: `${isLargeStar ? Math.random() * 3 + 2 : Math.random() * 2 + 1}px`,
                height: `${isLargeStar ? Math.random() * 3 + 2 : Math.random() * 2 + 1}px`,
                opacity: Math.random() * 0.9 + 0.1,
                backgroundColor: isLargeStar ? '#f0f9ff' : '#ffffff',
                boxShadow: isLargeStar ? '0 0 8px rgba(255, 255, 255, 0.8)' : '0 0 4px rgba(255, 255, 255, 0.8)',
                animation: `${randomMovement} ${animationDuration}s linear infinite ${animationDelay}s, pulse ${Math.random() * 4 + 1}s ease-in-out infinite`
              }}
            />
          );
        })}
      </div>

      {/* Enhanced floating space elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Distant planets/nebulae */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-3/4 left-2/3 w-72 h-72 bg-indigo-500/10 rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 right-1/2 w-80 h-80 bg-cyan-500/5 rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

        {/* Enhanced floating tech icons with different animation speeds */}
        <div className="absolute top-1/3 right-1/3" data-parallax="true" data-parallax-speed="0.08" data-parallax-direction="left">
          <Code size={40} className="text-blue-300/70 animate-float-fast hover-rotate hover-glow"
            style={{
              animationDelay: '0.5s',
              filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))',
              '--glow-rgb': '59, 130, 246'
            } as React.CSSProperties}
          />
        </div>
        <div className="absolute bottom-1/4 left-1/3" data-parallax="true" data-parallax-speed="0.12" data-parallax-direction="right">
          <Database size={32} className="text-blue-300/70 animate-float hover-rotate hover-glow"
            style={{
              animationDelay: '1.5s',
              filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))',
              '--glow-rgb': '59, 130, 246'
            } as React.CSSProperties}
          />
        </div>
        <div className="absolute top-2/3 right-1/4" data-parallax="true" data-parallax-speed="0.1" data-parallax-direction="up">
          <Server size={36} className="text-blue-300/70 animate-float-slow hover-rotate hover-glow"
            style={{
              animationDelay: '2.5s',
              filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))',
              '--glow-rgb': '59, 130, 246'
            } as React.CSSProperties}
          />
        </div>
        <div className="absolute top-1/4 left-1/2" data-parallax="true" data-parallax-speed="0.09" data-parallax-direction="down">
          <Globe size={38} className="text-cyan-300/70 animate-float-slow hover-rotate hover-glow"
            style={{
              animationDelay: '3s',
              filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.5))',
              '--glow-rgb': '6, 182, 212'
            } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Main content with enhanced animations - Split layout */}
      <div
        ref={textRef}
        className={`container mx-auto px-4 z-10 transition-all duration-500 ease-out ${isVisible ? 'opacity-100' : 'opacity-0 translate-y-10'}`}
        data-parallax="true"
        data-parallax-speed="0.05"
        data-parallax-direction="up"
      >
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          {/* Left side - Profile image with animated frame */}
          <div className="w-full lg:w-5/12 flex justify-center lg:justify-end order-2 lg:order-1 mt-12 lg:mt-0">
            <div className="relative w-64 h-64 md:w-80 md:h-80">
              {/* Orbital rings */}
              <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-spin-slow"
                style={{
                  borderRadius: '100%',
                  transform: 'rotateX(70deg) rotateY(0deg)',
                  animationDuration: '20s'
                }}
              ></div>
              <div className="absolute inset-0 rounded-full border border-purple-500/10 animate-spin-slow"
                style={{
                  borderRadius: '100%',
                  transform: 'rotateX(60deg) rotateZ(60deg)',
                  animationDuration: '25s',
                  animationDirection: 'reverse'
                }}
              ></div>

              {/* Animated profile frame */}
              <AnimatedProfileFrame
                imageSrc={profileImage}
                altText="Koshal Kumar"
                className="w-full h-full"
              />

              {/* Tech badges floating around profile */}
              <div className="absolute -top-4 -right-4 bg-blue-500/20 backdrop-blur-sm p-2 rounded-full border border-blue-500/30 animate-float-slow">
                <Code size={20} className="text-blue-300" />
              </div>
              <div className="absolute -bottom-2 -left-4 bg-purple-500/20 backdrop-blur-sm p-2 rounded-full border border-purple-500/30 animate-float"
                style={{ animationDelay: '1s' }}
              >
                <Database size={20} className="text-purple-300" />
              </div>
              <div className="absolute top-1/2 -right-6 bg-cyan-500/20 backdrop-blur-sm p-2 rounded-full border border-cyan-500/30 animate-float-fast"
                style={{ animationDelay: '1.5s' }}
              >
                <Cpu size={20} className="text-cyan-300" />
              </div>
            </div>
          </div>

          {/* Right side - Text content */}
          <div className="w-full lg:w-7/12 text-center lg:text-left order-1 lg:order-2">
            <div className="inline-block mb-6">
              <div className="px-4 py-1 rounded-full bg-blue-600/20 backdrop-blur-sm text-blue-200 text-sm font-medium animate-fade-in">
                <span className="animate-pulse inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Available for work
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
              <div
                className="block text-white font-extrabold relative"
                style={{
                  textShadow: '0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)'
                }}
              >
                {/* Glow effect behind text */}
                <div className="absolute inset-0 blur-xl opacity-30 bg-blue-500 rounded-full -z-10"></div>

                {['K', 'o', 's', 'h', 'a', 'l', ' ', 'K', 'u', 'm', 'a', 'r'].map((letter, index) => (
                  <span
                    key={index}
                    className="inline-block hover:animate-bounce transition-all duration-300"
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      transform: `translateY(${Math.sin(index) * 2}px)`,
                      textShadow: letter !== ' ' ? '0 0 8px rgba(59, 130, 246, 0.8), 0 0 12px rgba(59, 130, 246, 0.4)' : 'none',
                      color: letter !== ' ' ? (index % 2 === 0 ? '#ffffff' : '#f0f9ff') : 'transparent'
                    }}
                  >
                    {letter}
                  </span>
                ))}
              </div>
              <span
                className="text-3xl md:text-4xl font-light text-blue-100 mt-2 block animate-fade-in relative"
                style={{
                  animationDelay: '0.4s',
                  textShadow: '0 0 8px rgba(59, 130, 246, 0.4)'
                }}
              >
                {/* Animated gradient underline */}
                <span className="absolute -bottom-2 left-0 right-0 lg:left-0 lg:right-3/4 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-70 animate-pulse"></span>

                {/* Animated text with typewriter effect */}
                <span className="inline-block overflow-hidden whitespace-nowrap border-r-2 border-blue-400 pr-1 animate-typing" style={{ animationDuration: '3.5s', animationDelay: '1s', animationIterationCount: 1 }}>
                  Developer & AI Developer
                </span>
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-blue-200 mb-8 max-w-3xl animate-fade-in" style={{ animationDelay: '0.6s' }}>
              Passionate AI/ML Developer with expertise in designing and deploying scalable machine learning solutions, hands-
              on experience in computer vision, natural language processing, LLM and end-to-end ML deployment.
            </p>

            {/* Tech cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-fade-in" style={{ animationDelay: '0.7s' }}>
              <TechCard
                icon={<Code size={24} />}
                title="Web Development"
                description="Building modern, responsive web applications with cutting-edge technologies."
                color="blue"
                delay={0.1}
              />
              <TechCard
                icon={<Database size={24} />}
                title="Data Science"
                description="Extracting insights and building models from complex datasets."
                color="purple"
                delay={0.2}
              />
              <TechCard
                icon={<Layers size={24} />}
                title="AI & ML"
                description="Creating intelligent solutions with machine learning algorithms."
                color="cyan"
                delay={0.3}
              />
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8 animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <a
                href="#projects"
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 transform hover:scale-105"
              >
                View My Work
              </a>
              <a
                href="#contact"
                className="px-8 py-3 bg-transparent border-2 border-blue-500 text-blue-300 hover:text-white hover:bg-blue-600/30 rounded-lg font-medium transition-all duration-300 hover:shadow-lg transform hover:scale-105"
              >
                Get In Touch
              </a>
            </div>

            <div className="flex justify-center lg:justify-start space-x-6 animate-fade-in" style={{ animationDelay: '1s' }}>
              <a
                href="mailto:koshalkumar0304@gmail.com"
                className="p-3 text-blue-200 hover:text-white transition-all duration-300 transform hover:scale-110 hover:bg-blue-600/20 rounded-full"
                aria-label="Email"
              >
                <Mail size={22} />
              </a>
              <a
                href="tel:+918218806349"
                className="p-3 text-blue-200 hover:text-white transition-all duration-300 transform hover:scale-110 hover:bg-blue-600/20 rounded-full"
                aria-label="Phone"
              >
                <Phone size={22} />
              </a>
              <a
                href="https://github.com/koshal0304"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 text-blue-200 hover:text-white transition-all duration-300 transform hover:scale-110 hover:bg-blue-600/20 rounded-full"
                aria-label="GitHub"
              >
                <GitHub size={22} />
              </a>
              <a
                href="https://linkedin.com/in/koshal-kumar-970233240"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 text-blue-200 hover:text-white transition-all duration-300 transform hover:scale-110 hover:bg-blue-600/20 rounded-full"
                aria-label="LinkedIn"
              >
                <Linkedin size={22} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced scroll indicator with parallax effect */}
      <ParallaxEffect direction="up" factor={0.08} speed="fast">
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-slow">
          <a href="#experience" className="flex flex-col items-center text-blue-200 hover:text-white transition-colors duration-300">
            <span className="text-sm font-medium mb-2 opacity-80 hover-glow" style={{ '--glow-rgb': '59, 130, 246' } as React.CSSProperties}>Explore More</span>
            <div className="w-8 h-12 border-2 border-blue-500/50 rounded-full flex justify-center pt-1 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 hover-glow glass-effect"
              style={{ '--glow-rgb': '59, 130, 246' } as React.CSSProperties}>
              <ChevronDown size={20} className="animate-bounce" />
            </div>
          </a>
        </div>
      </ParallaxEffect>
    </div>
  );
};

export default Hero;
