/* ════════════════════════════════════════════════════════════
   MAIN.JS — Application Entry Point
   
   Orchestrates all modules after DOM content loads:
   1. Loader dismiss
   2. Navigation (scroll-aware, mobile toggle, active section)
   3. Custom cursor
   4. Scroll progress bar
   5. Canvas backgrounds init
   6. Animations init
   7. Project card interaction + Modal
   8. Contact form handling
   9. Card glow (mouse-follow) effect
   
   No external dependencies — pure vanilla JS.
   ════════════════════════════════════════════════════════════ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ─── 1. LOADER ────────────────────────────────────────── */
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (loader) loader.classList.add('hidden');
    }, 1200); // matches circle draw animation duration
  });
  // Fallback: hide loader after 3s no matter what
  setTimeout(() => {
    if (loader) loader.classList.add('hidden');
  }, 3000);


  /* ─── 2. NAVIGATION ───────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  const navLinks = document.getElementById('nav-links');
  const navToggle = document.getElementById('nav-toggle');
  const allNavLinks = document.querySelectorAll('.nav-link');

  // Scroll-aware: add .scrolled when past hero
  function handleNavScroll() {
    if (!navbar) return;
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  // Mobile toggle
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close mobile menu when a link is clicked
    allNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Active section highlighting via IntersectionObserver
  const sections = document.querySelectorAll('section[id]');
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          allNavLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-section') === id);
          });
        }
      });
    },
    { threshold: 0.3, rootMargin: '-80px 0px -40% 0px' }
  );
  sections.forEach(s => navObserver.observe(s));


  /* ─── 3. CUSTOM CURSOR ─────────────────────────────────── */
  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');

  if (cursorDot && cursorRing && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Dot follows instantly
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top = mouseY + 'px';
    });

    // Ring follows with smooth lag
    function animateRing() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover detection — grow cursor on interactive elements
    const interactives = document.querySelectorAll(
      'a, button, .project-card, .nav-toggle, input, textarea, .diagram-node'
    );
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }


  /* ─── 4. SCROLL PROGRESS BAR ───────────────────────────── */
  const scrollProgress = document.getElementById('scroll-progress');
  function updateScrollProgress() {
    if (!scrollProgress) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = progress + '%';
  }
  window.addEventListener('scroll', updateScrollProgress, { passive: true });


  /* ─── 5. CANVAS BACKGROUNDS ────────────────────────────── */
  // Hero blueprint canvas
  if (window.HeroCanvas) {
    new HeroCanvas('hero-canvas');
  }

  // System visualization canvas
  if (window.SystemViz) {
    new SystemViz('system-canvas', {
      active: 'hud-active',
      connections: 'hud-connections',
      load: 'hud-load',
    });
  }


  /* ─── 6. ANIMATIONS ────────────────────────────────────── */
  if (window.Animations) {
    // Typing effect — cycles through roles/descriptors
    Animations.initTypingEffect('typed-text', [
      'Systems Thinker.',
      'Problem Solver.',
      'Web Developer.',
      'Future Engineer.',
      'Code Architect.',
    ]);

    // Skill bars fill on scroll
    Animations.initSkillBars();

    // Skill diagram node graph
    Animations.initSkillDiagram('skill-diagram');

    // Scroll reveal for all marked elements
    Animations.initScrollReveal();
  }


  /* ─── 7. PROJECT CARDS + MODAL ─────────────────────────── */
  const modal = document.getElementById('project-modal');
  const modalOverlay = modal ? modal.querySelector('.modal-overlay') : null;
  const modalClose = modal ? modal.querySelector('.modal-close') : null;

  // Project data — matches data-project attributes on cards
  const projectDetails = {
    1: {
      icon: '⚙️',
      title: 'Smart Campus Navigator',
      desc: 'A pathfinding system using Dijkstra\'s algorithm to find optimal routes across campus buildings. The application visualizes graph traversal in real-time, showing how the algorithm explores nodes and edges before finding the shortest path. Built with Python and Matplotlib for visualization, it demonstrates understanding of graph theory and algorithm optimization.',
      tags: ['Python', 'Algorithms', 'Graph Theory', 'Matplotlib'],
      github: '#',
      demo: '#',
    },
    2: {
      icon: '📊',
      title: 'Data Pipeline Monitor',
      desc: 'A real-time dashboard for monitoring data flow through a multi-stage processing pipeline. Features include throughput analytics, bottleneck detection, and interactive flow visualization built entirely with the Canvas API. The system simulates data packets moving through processing stages and highlights congestion points.',
      tags: ['JavaScript', 'Canvas API', 'Systems Design', 'Real-time'],
      github: '#',
      demo: '#',
    },
    3: {
      icon: '🔌',
      title: 'IoT Sensor Network',
      desc: 'An embedded sensor network simulator that models data aggregation from distributed IoT sensors. Features include automatic fault detection, data deduplication, and a web-based control interface for remote monitoring and configuration. Demonstrates understanding of distributed systems and embedded programming.',
      tags: ['C++', 'IoT', 'Embedded Systems', 'WebSockets'],
      github: '#',
      demo: '#',
    },
    4: {
      icon: '🧠',
      title: 'Neural Net Visualizer',
      desc: 'An interactive visualization tool for understanding neural network forward and backward propagation. Users can adjust weights, biases, and activation functions in real time and watch how changes propagate through the network layers. A powerful educational tool for understanding the fundamentals of machine learning.',
      tags: ['JavaScript', 'Machine Learning', 'Visualization', 'Education'],
      github: '#',
      demo: '#',
    },
  };

  // Open modal on card click
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't trigger if clicking card external links
      if (e.target.closest('.card-link')) return;

      const projectId = card.getAttribute('data-project');
      const data = projectDetails[projectId];
      if (!data || !modal) return;

      document.getElementById('modal-icon').textContent = data.icon;
      document.getElementById('modal-title').textContent = data.title;
      document.getElementById('modal-desc').textContent = data.desc;

      const tagsContainer = document.getElementById('modal-tags');
      tagsContainer.innerHTML = data.tags.map(t => `<span class="tag">${t}</span>`).join('');

      document.getElementById('modal-github').href = data.github;
      document.getElementById('modal-demo').href = data.demo;

      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  // Close modal
  function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
  if (modalClose) modalClose.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });


  /* ─── 8. CONTACT FORM ──────────────────────────────────── */
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = contactForm.name.value.trim();
      const email = contactForm.email.value.trim();
      const message = contactForm.message.value.trim();

      // Basic validation
      if (!name || !email || !message) {
        showFormStatus('Please fill in all fields.', 'error');
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFormStatus('Please enter a valid email address.', 'error');
        return;
      }

      // Simulate sending (frontend only — no backend)
      showFormStatus('Transmitting…', '');
      setTimeout(() => {
        showFormStatus('✓ Message received! I\'ll get back to you soon.', 'success');
        contactForm.reset();
      }, 1500);
    });
  }

  function showFormStatus(msg, type) {
    if (!formStatus) return;
    formStatus.textContent = msg;
    formStatus.className = 'form-status' + (type ? ' ' + type : '');
    // Auto-clear after 5s
    if (type) {
      setTimeout(() => {
        formStatus.textContent = '';
        formStatus.className = 'form-status';
      }, 5000);
    }
  }


  /* ─── 9. CARD GLOW EFFECT ──────────────────────────────── */
  // Makes the radial-gradient glow follow the mouse on project cards
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', x + '%');
      card.style.setProperty('--mouse-y', y + '%');
    });
  });

});
