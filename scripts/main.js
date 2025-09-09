class ElementalDuoApp {
  constructor() {
    this.init();
  }

  init() {
    this.setupSmoothScrolling();
    this.setupIntersectionObserver();
    this.setupParallaxEffects();
    this.updateGameStats();
  }

  setupSmoothScrolling() {
    window.scrollToSection = (sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    };
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('section').forEach(section => {
      observer.observe(section);
    });
  }

  setupParallaxEffects() {
    let ticking = false;

    const updateParallax = () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.5;

      const orbs = document.querySelectorAll('.gradient-orb');
      orbs.forEach((orb, index) => {
        const speed = 0.2 + (index * 0.1);
        orb.style.transform = `translateY(${scrolled * speed}px)`;
      });

      ticking = false;
    };

    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    window.addEventListener('scroll', requestTick);
  }


  updateGameStats() {
    window.updateGameUI = (stats) => {
      const levelElement = document.getElementById('current-level');
      const scoreElement = document.getElementById('current-score');
      
      if (levelElement && stats.level) {
        this.animateNumber(levelElement, parseInt(levelElement.textContent), stats.level);
      }
      
      if (scoreElement && stats.score) {
        this.animateNumber(scoreElement, parseInt(scoreElement.textContent), stats.score);
      }
    };
  }

  animateNumber(element, start, end, duration = 1000) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        current = end;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current);
    }, 16);
  }

  createParticleEffect(x, y, color = '#ffffff') {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: 4px;
      height: 4px;
      background: ${color};
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      animation: particle-burst 0.6s ease-out forwards;
    `;
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
      particle.remove();
    }, 600);
  }
}

const style = document.createElement('style');
style.textContent = `
  @keyframes particle-burst {
    0% {
      transform: scale(1) translate(0, 0);
      opacity: 1;
    }
    100% {
      transform: scale(0) translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
  new ElementalDuoApp();
});

document.addEventListener('click', (e) => {
  if (e.target.matches('button, .cta-button, .nav-btn')) {
    const rect = e.target.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: scale(0);
      animation: ripple 0.6s linear;
      left: ${e.offsetX}px;
      top: ${e.offsetY}px;
      width: 20px;
      height: 20px;
      margin-left: -10px;
      margin-top: -10px;
      pointer-events: none;
    `;
    
    e.target.style.position = 'relative';
    e.target.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }
});

const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(rippleStyle);