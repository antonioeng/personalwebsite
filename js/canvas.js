/* ════════════════════════════════════════════════════════════
   CANVAS.JS — Animated Blueprint Background
   
   Renders an animated grid + floating particles + connection
   lines on the hero-section canvas. Uses requestAnimationFrame
   for smooth 60fps rendering.
   
   Architecture:
   - HeroCanvas class encapsulates all canvas logic
   - Particle system with attraction/repulsion to mouse
   - Blueprint grid with subtle animated scan-lines
   - Auto-resizes with window
   ════════════════════════════════════════════════════════════ */

'use strict';

class HeroCanvas {
  /**
   * @param {string} canvasId — ID of the <canvas> element
   */
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: -1000, y: -1000 };    // off-screen by default
    this.animId = null;
    this.time = 0;

    // Design tokens (matches CSS vars)
    this.colors = {
      grid:       'rgba(0, 212, 255, 0.04)',
      gridStrong: 'rgba(0, 212, 255, 0.08)',
      particle:   'rgba(0, 212, 255, 0.6)',
      line:       'rgba(0, 212, 255, 0.12)',
      scanLine:   'rgba(0, 212, 255, 0.03)',
    };

    // Config
    this.PARTICLE_COUNT = 60;
    this.CONNECTION_DIST = 150;
    this.MOUSE_RADIUS = 180;
    this.GRID_SIZE = 40;

    this._init();
  }

  /** Initialise canvas sizing, particles, and event listeners */
  _init() {
    this._resize();
    this._createParticles();

    // Event listeners
    window.addEventListener('resize', () => this._resize());

    // Track mouse for interactive particle repulsion
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });
    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
    });

    // Start render loop
    this._animate();
  }

  /** Keep canvas pixel-perfect on resize */
  _resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);

    // Regenerate particles for new dimensions
    if (this.particles.length) this._createParticles();
  }

  /** Populate particle array */
  _createParticles() {
    this.particles = [];
    // Fewer particles on mobile for performance
    const count = window.innerWidth < 768
      ? Math.floor(this.PARTICLE_COUNT * 0.4)
      : this.PARTICLE_COUNT;

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }
  }

  /** Main render loop */
  _animate() {
    this.time += 0.005;
    this.ctx.clearRect(0, 0, this.width, this.height);

    this._drawGrid();
    this._drawScanLine();
    this._updateParticles();
    this._drawConnections();
    this._drawParticles();

    this.animId = requestAnimationFrame(() => this._animate());
  }

  /** Draw blueprint-style grid */
  _drawGrid() {
    const ctx = this.ctx;
    const gs = this.GRID_SIZE;

    ctx.strokeStyle = this.colors.grid;
    ctx.lineWidth = 0.5;
    ctx.beginPath();

    // Vertical lines
    for (let x = 0; x <= this.width; x += gs) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
    }
    // Horizontal lines
    for (let y = 0; y <= this.height; y += gs) {
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
    }
    ctx.stroke();

    // Stronger lines every 4th cell (blueprint style)
    ctx.strokeStyle = this.colors.gridStrong;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (let x = 0; x <= this.width; x += gs * 4) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
    }
    for (let y = 0; y <= this.height; y += gs * 4) {
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
    }
    ctx.stroke();
  }

  /** Animated scan-line sweeping down — adds life to the grid */
  _drawScanLine() {
    const y = (this.time * 80) % (this.height + 100) - 50;
    const gradient = this.ctx.createLinearGradient(0, y - 40, 0, y + 40);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.5, this.colors.scanLine);
    gradient.addColorStop(1, 'transparent');

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, y - 40, this.width, 80);
  }

  /** Update particle positions, apply mouse interaction */
  _updateParticles() {
    for (const p of this.particles) {
      // Mouse repulsion
      const dx = p.x - this.mouse.x;
      const dy = p.y - this.mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.MOUSE_RADIUS && dist > 0) {
        const force = (this.MOUSE_RADIUS - dist) / this.MOUSE_RADIUS;
        p.vx += (dx / dist) * force * 0.3;
        p.vy += (dy / dist) * force * 0.3;
      }

      // Apply velocity with damping
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      p.vy *= 0.98;

      // Wrap around edges
      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;
    }
  }

  /** Draw lines between close particles */
  _drawConnections() {
    const ctx = this.ctx;
    const particles = this.particles;
    const maxDist = this.CONNECTION_DIST;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.15;
          ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  /** Draw particles as glowing dots */
  _drawParticles() {
    const ctx = this.ctx;

    for (const p of this.particles) {
      // Glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 212, 255, ${p.opacity * 0.1})`;
      ctx.fill();

      // Core dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 212, 255, ${p.opacity})`;
      ctx.fill();
    }
  }

  /** Clean up on destroy */
  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
  }
}

// Expose globally — main.js will instantiate after DOM ready
window.HeroCanvas = HeroCanvas;
