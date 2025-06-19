import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export class AnimationController {
  private static instance: AnimationController;
  private initialized = false;

  static getInstance(): AnimationController {
    if (!AnimationController.instance) {
      AnimationController.instance = new AnimationController();
    }
    return AnimationController.instance;
  }

  init() {
    if (this.initialized) return;
    
    this.createStarField();
    this.initScrollProgress();
    this.initSectionReveals();
    this.initParallaxEffects();
    this.initTextAnimations();
    
    this.initialized = true;
  }

  private createStarField() {
    const starField = document.querySelector('.star-field');
    if (!starField) return;

    const numStars = 200;
    
    for (let i = 0; i < numStars; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.width = Math.random() * 3 + 1 + 'px';
      star.style.height = star.style.width;
      star.style.animationDelay = Math.random() * 3 + 's';
      starField.appendChild(star);
    }
  }

  private initScrollProgress() {
    const progressBar = document.querySelector('.scroll-indicator');
    if (!progressBar) return;

    gsap.to(progressBar, {
      scaleY: 1,
      transformOrigin: "top",
      ease: "none",
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: true,
      },
    });
  }

  private initSectionReveals() {
    gsap.utils.toArray('.section-reveal').forEach((section: any) => {
      gsap.fromTo(
        section,
        {
          opacity: 0,
          y: 50,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });
  }

  private initParallaxEffects() {
    gsap.utils.toArray('.cosmic-gradient').forEach((element: any) => {
      gsap.to(element, {
        yPercent: -50,
        ease: "none",
        scrollTrigger: {
          trigger: element,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });
  }

  private initTextAnimations() {
    gsap.utils.toArray('.text-gradient').forEach((text: any) => {
      gsap.fromTo(
        text,
        {
          backgroundPosition: "0% 50%",
        },
        {
          backgroundPosition: "100% 50%",
          duration: 3,
          ease: "none",
          repeat: -1,
          yoyo: true,
        }
      );
    });
  }

  createFloatingElements(container: HTMLElement, count = 50) {
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.width = Math.random() * 4 + 1 + 'px';
      particle.style.height = particle.style.width;
      particle.style.animationDelay = Math.random() * 6 + 's';
      particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
      container.appendChild(particle);
    }
  }

  animateOnHover(element: HTMLElement, scale = 1.05) {
    element.addEventListener('mouseenter', () => {
      gsap.to(element, {
        scale,
        duration: 0.3,
        ease: "power2.out",
      });
    });

    element.addEventListener('mouseleave', () => {
      gsap.to(element, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    });
  }

  cleanup() {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    this.initialized = false;
  }
}

export const animationController = AnimationController.getInstance();
