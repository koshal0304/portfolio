/**
 * Utility functions for handling scroll animations
 */

// Initialize scroll animations by setting up IntersectionObserver
export const initScrollAnimations = () => {
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  
  if (!animatedElements.length) return;
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          
          // If the element has a data-once attribute set to "true", unobserve it
          if (entry.target.getAttribute('data-once') === 'true') {
            observer.unobserve(entry.target);
          }
        } else {
          // If the element doesn't have data-once="true", remove the visible class
          if (entry.target.getAttribute('data-once') !== 'true') {
            entry.target.classList.remove('visible');
          }
        }
      });
    },
    {
      threshold: 0.1, // Trigger when at least 10% of the element is visible
      rootMargin: '0px 0px -100px 0px' // Negative bottom margin to trigger earlier
    }
  );
  
  animatedElements.forEach((element) => {
    observer.observe(element);
  });
};

// Initialize parallax effects
export const initParallaxEffects = () => {
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  
  if (!parallaxElements.length) return;
  
  const handleScroll = () => {
    const scrollY = window.scrollY;
    
    parallaxElements.forEach((element) => {
      const speed = parseFloat(element.getAttribute('data-parallax-speed') || '0.1');
      const direction = element.getAttribute('data-parallax-direction') || 'up';
      
      let yOffset = 0;
      let xOffset = 0;
      
      if (direction === 'up') yOffset = scrollY * speed;
      if (direction === 'down') yOffset = -scrollY * speed;
      if (direction === 'left') xOffset = scrollY * speed;
      if (direction === 'right') xOffset = -scrollY * speed;
      
      (element as HTMLElement).style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
    });
  };
  
  window.addEventListener('scroll', handleScroll);
  
  // Initial calculation
  handleScroll();
};

// Initialize all animations
export const initAllAnimations = () => {
  // Wait for DOM to be fully loaded
  if (document.readyState === 'complete') {
    initScrollAnimations();
    initParallaxEffects();
  } else {
    window.addEventListener('load', () => {
      initScrollAnimations();
      initParallaxEffects();
    });
  }
};
