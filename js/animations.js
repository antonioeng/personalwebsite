/* ════════════════════════════════════════════════════════════
   ANIMATIONS.JS — Animation Controllers
   
   Handles all JS-driven animations:
   1. Typing effect for hero headline
   2. Skill bar fill animation
   3. Mini skill-diagram (SVG-like node graph)
   4. IntersectionObserver for scroll reveals
   
   All functions are exported on window.Animations for use
   by main.js after DOM is ready.
   ════════════════════════════════════════════════════════════ */

'use strict';

const Animations = (() => {

  /* ─── TYPING EFFECT ──────────────────────────────────────
     Cycles through an array of strings with a typing and
     deleting animation. Pure JS, no libraries.
  ──────────────────────────────────────────────────────── */
  function initTypingEffect(elementId, strings, typeSpeed = 80, deleteSpeed = 50, pauseTime = 2000) {
    const el = document.getElementById(elementId);
    if (!el) return;

    let stringIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timeout = null;

    function tick() {
      const current = strings[stringIndex];

      if (isDeleting) {
        charIndex--;
        el.textContent = current.substring(0, charIndex);
      } else {
        charIndex++;
        el.textContent = current.substring(0, charIndex);
      }

      let delay = isDeleting ? deleteSpeed : typeSpeed;

      // Just finished typing the full string
      if (!isDeleting && charIndex === current.length) {
        delay = pauseTime;
        isDeleting = true;
      }

      // Just finished deleting
      if (isDeleting && charIndex === 0) {
        isDeleting = false;
        stringIndex = (stringIndex + 1) % strings.length;
        delay = 400;
      }

      timeout = setTimeout(tick, delay);
    }

    // Start after a brief delay so hero fade-in completes
    setTimeout(tick, 1200);

    // Return cleanup function
    return () => clearTimeout(timeout);
  }


  /* ─── SKILL BAR ANIMATION ────────────────────────────────
     Fills skill bars to their data-level percentage
     when the about section scrolls into view.
  ──────────────────────────────────────────────────────── */
  function initSkillBars() {
    const bars = document.querySelectorAll('.skill-bar');
    if (!bars.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const bar = entry.target;
            const level = bar.getAttribute('data-level');
            const fill = bar.querySelector('.skill-fill');
            if (fill) {
              // Delay slightly for stagger effect
              const index = Array.from(bars).indexOf(bar);
              setTimeout(() => {
                fill.style.width = level + '%';
              }, index * 120);
            }
            observer.unobserve(bar);
          }
        });
      },
      { threshold: 0.3 }
    );

    bars.forEach(bar => observer.observe(bar));
  }


  /* ─── SKILL DIAGRAM (Mini Node Graph) ────────────────────
     Draws a small interactive diagram of interconnected
     skills inside the #skill-diagram container using
     absolutely-positioned div nodes + SVG lines.
  ──────────────────────────────────────────────────────── */
  function initSkillDiagram(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Node definitions with relative positions (% of container)
    const diagramNodes = [
      { id: 'html',    label: 'HTML/CSS',          x: 18, y: 30 },
      { id: 'js',      label: 'JavaScript',        x: 50, y: 15 },
      { id: 'python',  label: 'Python',            x: 82, y: 30 },
      { id: 'algo',    label: 'Algorithms',        x: 30, y: 70 },
      { id: 'systems', label: 'Systems\nThinking', x: 50, y: 50 },
      { id: 'solve',   label: 'Problem\nSolving',  x: 70, y: 70 },
    ];

    const diagramEdges = [
      ['html', 'js'], ['js', 'python'],
      ['html', 'systems'], ['js', 'systems'], ['python', 'systems'],
      ['algo', 'systems'], ['solve', 'systems'],
      ['algo', 'solve'], ['html', 'algo'], ['python', 'solve'],
    ];

    // Create SVG for lines
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.position = 'absolute';
    svg.style.inset = '0';
    svg.style.pointerEvents = 'none';
    container.appendChild(svg);

    // Create node elements
    const nodeEls = {};
    diagramNodes.forEach(n => {
      const node = document.createElement('div');
      node.className = 'diagram-node';
      node.textContent = n.label;
      node.style.cssText = `
        position: absolute;
        left: ${n.x}%;
        top: ${n.y}%;
        transform: translate(-50%, -50%);
        padding: 6px 12px;
        font-family: var(--font-mono);
        font-size: 10px;
        color: var(--accent);
        background: rgba(0, 212, 255, 0.06);
        border: 1px solid rgba(0, 212, 255, 0.2);
        border-radius: 6px;
        white-space: pre-line;
        text-align: center;
        cursor: default;
        transition: all 0.3s ease;
        z-index: 2;
        line-height: 1.3;
      `;

      // Hover glow
      node.addEventListener('mouseenter', () => {
        node.style.borderColor = 'rgba(0, 212, 255, 0.6)';
        node.style.background = 'rgba(0, 212, 255, 0.12)';
        node.style.boxShadow = '0 0 15px rgba(0, 212, 255, 0.2)';
      });
      node.addEventListener('mouseleave', () => {
        node.style.borderColor = 'rgba(0, 212, 255, 0.2)';
        node.style.background = 'rgba(0, 212, 255, 0.06)';
        node.style.boxShadow = 'none';
      });

      container.appendChild(node);
      nodeEls[n.id] = { el: node, data: n };
    });

    // Draw SVG lines
    function drawLines() {
      svg.innerHTML = '';
      const containerRect = container.getBoundingClientRect();

      diagramEdges.forEach(([fromId, toId]) => {
        const from = nodeEls[fromId];
        const to = nodeEls[toId];
        if (!from || !to) return;

        const fromRect = from.el.getBoundingClientRect();
        const toRect = to.el.getBoundingClientRect();

        const x1 = fromRect.left + fromRect.width / 2 - containerRect.left;
        const y1 = fromRect.top + fromRect.height / 2 - containerRect.top;
        const x2 = toRect.left + toRect.width / 2 - containerRect.left;
        const y2 = toRect.top + toRect.height / 2 - containerRect.top;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', 'rgba(0, 212, 255, 0.15)');
        line.setAttribute('stroke-width', '1');
        svg.appendChild(line);
      });
    }

    // Draw lines once layout settles
    requestAnimationFrame(() => {
      requestAnimationFrame(drawLines);
    });
    window.addEventListener('resize', drawLines);
  }


  /* ─── SCROLL REVEAL OBSERVER ─────────────────────────────
     Uses IntersectionObserver to add .visible class to
     elements with .reveal-up, .reveal-left, .reveal-right
  ──────────────────────────────────────────────────────── */
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    if (!reveals.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -60px 0px',
      }
    );

    reveals.forEach(el => observer.observe(el));
  }


  /* ─── PUBLIC API ─────────────────────────────────────── */
  return {
    initTypingEffect,
    initSkillBars,
    initSkillDiagram,
    initScrollReveal,
  };
})();

// Expose globally
window.Animations = Animations;
