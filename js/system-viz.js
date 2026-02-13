/* ════════════════════════════════════════════════════════════
   SYSTEM-VIZ.JS — Interactive Node-Based System Visualization
   
   Renders a network of "subsystem" nodes on a canvas.
   Users can click nodes to activate them; connections light up
   when both connected nodes are active. Simulates a control
   panel / system architecture diagram.
   
   Architecture:
   - SystemViz class handles all rendering & interaction
   - Nodes represent engineering subsystems
   - Edges connect related subsystems
   - Physics-lite: nodes have subtle floating motion
   - Click to toggle activation; HUD updates in real-time
   ════════════════════════════════════════════════════════════ */

'use strict';

class SystemViz {
  /**
   * @param {string} canvasId  — Canvas element ID
   * @param {object} hudIds    — IDs for HUD display elements
   */
  constructor(canvasId, hudIds) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.hudIds = hudIds;
    this.mouse = { x: -1000, y: -1000 };
    this.hoveredNode = null;
    this.animId = null;
    this.time = 0;

    // Define subsystem nodes
    this.nodesData = [
      { id: 'core',      label: 'Sistema Central',   group: 'core' },
      { id: 'frontend',  label: 'Frontend',           group: 'software' },
      { id: 'backend',   label: 'Backend',            group: 'software' },
      { id: 'database',  label: 'Base de Datos',      group: 'software' },
      { id: 'network',   label: 'Capa de Red',        group: 'infra' },
      { id: 'security',  label: 'Seguridad',          group: 'infra' },
      { id: 'ml',        label: 'Pipeline ML',        group: 'data' },
      { id: 'analytics', label: 'Análisis',            group: 'data' },
      { id: 'iot',       label: 'Sensores IoT',       group: 'hardware' },
      { id: 'control',   label: 'Unidad Control',     group: 'hardware' },
      { id: 'monitoring',label: 'Monitoreo',          group: 'ops' },
      { id: 'deploy',    label: 'Despliegue',         group: 'ops' },
    ];

    // Define connections between subsystems
    this.edgesData = [
      ['core', 'frontend'], ['core', 'backend'], ['core', 'network'],
      ['core', 'security'], ['core', 'monitoring'],
      ['frontend', 'backend'], ['backend', 'database'],
      ['backend', 'ml'], ['ml', 'analytics'],
      ['network', 'security'], ['network', 'iot'],
      ['iot', 'control'], ['control', 'monitoring'],
      ['monitoring', 'deploy'], ['deploy', 'backend'],
      ['analytics', 'monitoring'], ['database', 'analytics'],
    ];

    // Group colors for visual distinction
    this.groupColors = {
      core:     { r: 0,   g: 255, b: 65  },  // matrix green
      software: { r: 50,  g: 220, b: 100 },  // soft green
      infra:    { r: 0,   g: 200, b: 80  },  // emerald
      data:     { r: 100, g: 255, b: 50  },  // lime
      hardware: { r: 0,   g: 180, b: 60  },  // dark green
      ops:      { r: 80,  g: 255, b: 120 },  // mint
    };

    this.nodes = [];
    this.edges = [];

    this._init();
  }

  /** Set up nodes, edges, event listeners, and start rendering */
  _init() {
    this._resize();
    this._layoutNodes();
    this._buildEdges();
    this._bindEvents();
    this._animate();
  }

  /** Resize canvas to match container */
  _resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  /** Position nodes in a circular/organic layout */
  _layoutNodes() {
    const cx = this.width / 2;
    const cy = this.height / 2 - 30; // offset for HUD bar
    const radius = Math.min(this.width, this.height) * 0.32;

    this.nodes = this.nodesData.map((data, i) => {
      const angle = (i / this.nodesData.length) * Math.PI * 2 - Math.PI / 2;
      const r = data.group === 'core' ? 0 : radius;
      const jitter = data.group === 'core' ? 0 : (Math.random() - 0.5) * 30;

      return {
        ...data,
        x: cx + Math.cos(angle) * (r + jitter),
        y: cy + Math.sin(angle) * (r + jitter),
        baseX: cx + Math.cos(angle) * (r + jitter),
        baseY: cy + Math.sin(angle) * (r + jitter),
        radius: data.group === 'core' ? 28 : 22,
        active: false,
        pulsePhase: Math.random() * Math.PI * 2,
        color: this.groupColors[data.group],
      };
    });
  }

  /** Create edge objects referencing node indices */
  _buildEdges() {
    const nodeMap = {};
    this.nodes.forEach((n, i) => { nodeMap[n.id] = i; });

    this.edges = this.edgesData.map(([fromId, toId]) => ({
      from: nodeMap[fromId],
      to:   nodeMap[toId],
    }));
  }

  /** Bind mouse/touch events for interaction */
  _bindEvents() {
    // Resize
    window.addEventListener('resize', () => {
      this._resize();
      this._layoutNodes();
      this._buildEdges();
    });

    // Mouse tracking
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      this._updateHover();
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
      this.hoveredNode = null;
      this.canvas.style.cursor = 'pointer';
    });

    // Click to toggle node
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      for (const node of this.nodes) {
        const dx = mx - node.x;
        const dy = my - node.y;
        if (Math.sqrt(dx * dx + dy * dy) < node.radius + 5) {
          node.active = !node.active;
          this._updateHUD();
          break;
        }
      }
    });

    // Touch support
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const mx = touch.clientX - rect.left;
      const my = touch.clientY - rect.top;

      for (const node of this.nodes) {
        const dx = mx - node.x;
        const dy = my - node.y;
        if (Math.sqrt(dx * dx + dy * dy) < node.radius + 10) {
          node.active = !node.active;
          this._updateHUD();
          break;
        }
      }
    }, { passive: false });

    // Activate All / Reset buttons
    const activateBtn = document.getElementById('activate-all');
    const resetBtn = document.getElementById('reset-all');

    if (activateBtn) {
      activateBtn.addEventListener('click', () => {
        this.nodes.forEach(n => { n.active = true; });
        this._updateHUD();
      });
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.nodes.forEach(n => { n.active = false; });
        this._updateHUD();
      });
    }

    this._updateHUD();
  }

  /** Check if mouse is hovering a node */
  _updateHover() {
    this.hoveredNode = null;
    for (const node of this.nodes) {
      const dx = this.mouse.x - node.x;
      const dy = this.mouse.y - node.y;
      if (Math.sqrt(dx * dx + dy * dy) < node.radius + 5) {
        this.hoveredNode = node;
        this.canvas.style.cursor = 'pointer';
        return;
      }
    }
    this.canvas.style.cursor = 'default';
  }

  /** Update HUD displays */
  _updateHUD() {
    const active = this.nodes.filter(n => n.active).length;
    const total = this.nodes.length;
    const activeEdges = this.edges.filter(e =>
      this.nodes[e.from].active && this.nodes[e.to].active
    ).length;
    const load = Math.round((active / total) * 100);

    const setEl = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    setEl(this.hudIds.active, `${active} / ${total}`);
    setEl(this.hudIds.connections, `${activeEdges}`);
    setEl(this.hudIds.load, `${load}%`);
  }

  /** Main render loop */
  _animate() {
    this.time += 0.015;
    this.ctx.clearRect(0, 0, this.width, this.height);

    this._drawEdges();
    this._drawNodes();

    this.animId = requestAnimationFrame(() => this._animate());
  }

  /** Draw connection lines between nodes */
  _drawEdges() {
    const ctx = this.ctx;

    for (const edge of this.edges) {
      const a = this.nodes[edge.from];
      const b = this.nodes[edge.to];
      const bothActive = a.active && b.active;
      const eitherActive = a.active || b.active;

      // Determine line style based on activation
      if (bothActive) {
        ctx.strokeStyle = `rgba(0, 255, 65, 0.5)`;
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(0, 255, 65, 0.3)';
        ctx.shadowBlur = 8;
      } else if (eitherActive) {
        ctx.strokeStyle = `rgba(0, 255, 65, 0.15)`;
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
      } else {
        ctx.strokeStyle = `rgba(148, 163, 184, 0.08)`;
        ctx.lineWidth = 0.8;
        ctx.shadowBlur = 0;
      }

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Animated data packet on active edges
      if (bothActive) {
        const t = (this.time * 0.5 + edge.from * 0.1) % 1;
        const px = a.x + (b.x - a.x) * t;
        const py = a.y + (b.y - a.y) * t;

        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 255, 65, 0.8)';
        ctx.fill();
      }
    }
  }

  /** Draw nodes with floating animation and glow */
  _drawNodes() {
    const ctx = this.ctx;

    for (const node of this.nodes) {
      // Subtle floating motion
      node.x = node.baseX + Math.sin(this.time + node.pulsePhase) * 3;
      node.y = node.baseY + Math.cos(this.time * 0.8 + node.pulsePhase) * 3;

      const isHovered = this.hoveredNode === node;
      const { r, g, b } = node.color;

      // Outer glow for active/hovered
      if (node.active || isHovered) {
        const glowSize = node.radius + 12 + Math.sin(this.time * 2 + node.pulsePhase) * 4;
        const gradient = ctx.createRadialGradient(
          node.x, node.y, node.radius * 0.5,
          node.x, node.y, glowSize
        );
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.2)`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.beginPath();
        ctx.arc(node.x, node.y, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);

      if (node.active) {
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.15)`;
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.8)`;
        ctx.lineWidth = 2;
      } else {
        ctx.fillStyle = 'rgba(15, 20, 35, 0.8)';
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
        ctx.lineWidth = 1.5;
      }
      ctx.fill();
      ctx.stroke();

      // Node label
      ctx.font = `${node.group === 'core' ? '11px' : '9px'} "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = node.active
        ? `rgba(${r}, ${g}, ${b}, 1)`
        : 'rgba(148, 163, 184, 0.6)';
      ctx.fillText(node.label, node.x, node.y);

      // Status indicator (small dot)
      const dotX = node.x + node.radius * 0.6;
      const dotY = node.y - node.radius * 0.6;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
      ctx.fillStyle = node.active
        ? 'rgba(0, 255, 65, 0.9)'
        : 'rgba(100, 116, 139, 0.5)';
      ctx.fill();
    }
  }

  /** Clean up */
  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
  }
}

// Expose globally
window.SystemViz = SystemViz;
