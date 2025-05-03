import { useCallback, useState, useEffect } from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import type { Engine } from 'tsparticles-engine';

const ParticlesBackground = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  // Space-themed particles configuration with continuous movement
  const particlesConfig = {
    particles: {
      number: {
        value: 400,  // Large number of stars
        density: {
          enable: true,
          value_area: 1200
        }
      },
      color: {
        value: ["#ffffff", "#f8f8ff", "#e0e0ff", "#d0d0ff", "#a0a0ff", "#ffffff"]
      },
      shape: {
        type: "circle"
      },
      opacity: {
        value: 1,
        random: true,
        anim: {
          enable: true,
          speed: 0.3,
          opacity_min: 0.4,
          sync: false
        }
      },
      size: {
        value: 3,
        random: true,
        anim: {
          enable: true,
          speed: 0.5,
          size_min: 0.5,
          sync: false
        }
      },
      line_linked: {
        enable: false
      },
      move: {
        enable: true,
        speed: 0.5,  // Increased speed for more noticeable movement
        direction: "top",  // Stars move upward like drifting through space
        random: true,
        straight: false,  // Not straight lines
        out_mode: "out",  // Stars disappear at the edges
        bounce: false,
        attract: {
          enable: false,
          rotateX: 600,
          rotateY: 1200
        }
      },
      twinkle: {
        particles: {
          enable: true,
          frequency: 0.1,
          opacity: 1
        },
        lines: {
          enable: false,
          frequency: 0.05,
          opacity: 1
        }
      }
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: {
          enable: true,
          mode: "connect"  // Changed to connect mode for a constellation effect
        },
        onclick: {
          enable: true,
          mode: "push"  // Changed to push to add more stars on click
        },
        resize: true
      },
      modes: {
        connect: {
          distance: 150,
          links: {
            opacity: 0.3
          },
          radius: 120
        },
        bubble: {
          distance: 150,
          size: 6,  // Increased size
          duration: 2,
          opacity: 0.8,
          speed: 3
        },
        push: {
          quantity: 5  // Add 5 particles on click
        },
        repulse: {
          distance: 200,
          duration: 0.4
        }
      }
    },
    retina_detect: true,
    fullScreen: {
      enable: false
    },
    background: {
      color: "#000000",
      image: "linear-gradient(to bottom, #000000, #050520)",
      position: "50% 50%",
      repeat: "no-repeat",
      size: "cover"
    },
    backgroundMask: {
      enable: false
    },
    particles_nb: 200
  };

  // Enhanced shooting stars effect with continuous movement
  const shootingStarConfig = {
    particles: {
      number: {
        value: 20,  // More shooting stars
        density: {
          enable: true,
          value_area: 1800  // Decreased area for more density
        }
      },
      color: {
        value: ["#ffffff", "#f8faff", "#e0f0ff", "#d0e0ff"]  // Multiple colors for variety
      },
      shape: {
        type: "circle"
      },
      opacity: {
        value: 1,
        random: true,
        anim: {
          enable: true,
          speed: 1,
          opacity_min: 0.4,
          sync: false
        }
      },
      size: {
        value: 3,
        random: true,
        anim: {
          enable: true,
          speed: 4,
          size_min: 1,
          sync: false
        }
      },
      line_linked: {
        enable: false
      },
      move: {
        enable: true,
        speed: 25,  // Even faster speed
        direction: "bottom-right",  // Diagonal movement
        random: false,  // More consistent direction
        straight: true,  // Straight lines for shooting star effect
        out_mode: "out",
        bounce: false,
        attract: {
          enable: false,
          rotateX: 600,
          rotateY: 1200
        }
      },
      trail: {
        enable: true,
        length: 30,  // Longer trail
        fillColor: "#ffffff"
      }
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: {
          enable: false
        },
        onclick: {
          enable: false
        },
        resize: true
      }
    },
    retina_detect: true,
    fullScreen: {
      enable: false
    },
    background: {
      color: "transparent"
    }
  };

  if (!mounted) return null;

  return (
    <>
      <div className="fixed inset-0 -z-10 pointer-events-none bg-black">
        {/* Moving stars background - for immediate visibility */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 200 }).map((_, i) => {
            // Determine if this should be a larger, brighter star (about 10% of stars)
            const isLargeStar = Math.random() < 0.1;
            const starSize = isLargeStar ? Math.random() * 3 + 2 : Math.random() * 2 + 1;
            const starOpacity = isLargeStar ? Math.random() * 0.3 + 0.7 : Math.random() * 0.6 + 0.4;
            const glowSize = isLargeStar ? '0 0 8px' : '0 0 3px';
            const glowColor = isLargeStar
              ? `rgba(${Math.floor(Math.random() * 50) + 200}, ${Math.floor(Math.random() * 50) + 200}, ${Math.floor(Math.random() * 55) + 200}, ${starOpacity})`
              : 'rgba(255, 255, 255, 0.8)';

            // Calculate animation properties for continuous movement
            const animationDuration = Math.random() * 100 + 50; // Between 50-150s for slow drift
            const animationDelay = Math.random() * -100; // Negative delay for immediate start at different positions

            // Choose a random movement direction for each star
            const movementTypes = ['moveStar', 'moveStarRight', 'moveStarLeft', 'moveStarDiagonal'];
            const randomMovement = movementTypes[Math.floor(Math.random() * movementTypes.length)];

            return (
              <div
                key={i}
                className={`absolute rounded-full ${isLargeStar ? 'animate-pulse-slow' : 'animate-pulse'}`}
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${starSize}px`,
                  height: `${starSize}px`,
                  opacity: starOpacity,
                  backgroundColor: isLargeStar ? '#f0f9ff' : '#ffffff',
                  animationDuration: `${Math.random() * 4 + 1}s`,
                  animationDelay: `${Math.random() * 2}s`,
                  boxShadow: `${glowSize} ${glowColor}`,
                  animation: `${randomMovement} ${animationDuration}s linear infinite ${animationDelay}s, pulse ${Math.random() * 4 + 1}s ease-in-out infinite`
                }}
              />
            );
          })}
        </div>

        {/* Main stars background */}
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={particlesConfig}
          className="w-full h-full"
        />

        {/* Shooting stars layer */}
        <Particles
          id="shooting-stars"
          init={particlesInit}
          options={shootingStarConfig}
          className="w-full h-full"
        />

        {/* Additional space effects */}
        <div className="absolute inset-0 bg-gradient-radial from-blue-900/10 via-transparent to-transparent opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-purple-900/20"></div>

        {/* Distant nebulae/galaxies */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-2/3 left-1/2 w-80 h-80 bg-indigo-500/5 rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>
    </>
  );
};

export default ParticlesBackground;
