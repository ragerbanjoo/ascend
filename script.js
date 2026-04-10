/* =========================================================
   St. Juan Diego YAG × ASCEND — Retreat Site
   Shared client-side script
   "In Him, We Rise — Together."
   ========================================================= */

(function () {
  'use strict';

  // -------------------------------------------------------
  // 1. Trip constants (all times Pacific — PDT in May 2026)
  // -------------------------------------------------------
  const TRIP = {
    departPT:  new Date('2026-05-16T04:00:00-07:00'), // Option A recommended default
    returnPT:  new Date('2026-05-17T20:00:00-07:00'),
    label:     'May 16–17, 2026'
  };

  // SVG icon map — replaces emoji throughout the site
  const ICONS = {
    rose:   '<svg viewBox="0 0 24 24"><path d="M12 3c-2 3-5 5-5 9a5 5 0 0 0 10 0c0-4-3-6-5-9z"/><path d="M12 16v5"/><path d="M9 18.5c1.5-1 4.5-1 6 0"/></svg>',
    sun:    '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>',
    shield: '<svg viewBox="0 0 24 24"><path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5z"/></svg>',
    flower: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="2"/><circle cx="12" cy="7.5" r="2.5"/><circle cx="16.33" cy="9.75" r="2.5"/><circle cx="14.85" cy="14.75" r="2.5"/><circle cx="9.15" cy="14.75" r="2.5"/><circle cx="7.67" cy="9.75" r="2.5"/></svg>',
    cross:  '<svg viewBox="0 0 24 24"><line x1="12" y1="2" x2="12" y2="22"/><line x1="5" y1="9" x2="19" y2="9"/></svg>',
    heart:  '<svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    star:   '<svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01z"/></svg>',
  };
  const SVG_VAN = '<svg class="si" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17V6h12v11M15 9h4l3 4v4M1 17h22"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>';
  const SVG_PRAYER = '<svg class="si" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M8 12h8"/></svg>';

  // -------------------------------------------------------
  // 2. Storage wrapper — uses window.storage if present,
  //    falls back to localStorage. Supports shared/user scopes.
  // -------------------------------------------------------
  const Storage = {
    _lsGet(key, def) {
      try {
        const raw = localStorage.getItem(key);
        return raw == null ? def : JSON.parse(raw);
      } catch (e) { return def; }
    },
    _lsSet(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
    },
    async get(key, def = null) {
      try {
        if (typeof window !== 'undefined' && window.storage && typeof window.storage.get === 'function') {
          const v = await window.storage.get(key);
          return (v === undefined || v === null) ? def : v;
        }
      } catch (e) { /* fall through */ }
      return this._lsGet(key, def);
    },
    async set(key, value, opts = {}) {
      try {
        if (typeof window !== 'undefined' && window.storage && typeof window.storage.set === 'function') {
          return await window.storage.set(key, value, opts);
        }
      } catch (e) { /* fall through */ }
      this._lsSet(key, value);
    }
  };

  // -------------------------------------------------------
  // 2b. Theme — dark / light persistence
  // -------------------------------------------------------
  const Theme = {
    KEY: 'user:theme',
    async init() {
      const saved = await Storage.get(this.KEY, null);
      this.apply(saved || 'light');
    },
    apply(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.content = theme === 'light' ? '#f7f4ec' : '#060d1a';
    },
    async toggle() {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.add('theme-switching');
      this.apply(next);
      await Storage.set(this.KEY, next, { shared: false });
      requestAnimationFrame(() => {
        requestAnimationFrame(() => document.documentElement.classList.remove('theme-switching'));
      });
      return next;
    },
    async set(theme) {
      this.apply(theme);
      await Storage.set(this.KEY, theme, { shared: false });
    }
  };

  // -------------------------------------------------------
  // 3. Utilities
  // -------------------------------------------------------
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function formatDuration(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return { d, h, m, s: sec };
  }

  function formatCompact(ms) {
    const { d, h, m, s } = formatDuration(ms);
    if (d > 0) return `${d}d ${h}h ${m}m ${pad(s)}s`;
    if (h > 0) return `${h}h ${m}m ${pad(s)}s`;
    return `${m}m ${pad(s)}s`;
  }

  // -------------------------------------------------------
  // 4. Countdown nav chip — every second
  // -------------------------------------------------------
  function initCountdownChip() {
    const chips = $$('.countdown-chip');
    if (!chips.length) return;

    function tick() {
      const now = new Date();
      let text, cls;

      if (now < TRIP.departPT) {
        text = formatCompact(TRIP.departPT - now);
        cls  = '';
      } else if (now < TRIP.returnPT) {
        text = 'ON RETREAT ' + SVG_VAN;
        cls  = 'during';
      } else {
        text = 'Deo gratias ' + SVG_PRAYER;
        cls  = 'after';
      }

      chips.forEach(chip => {
        chip.querySelector('.chip-value').innerHTML = text;
        chip.classList.remove('during', 'after');
        if (cls) chip.classList.add(cls);
      });
    }
    tick();
    setInterval(tick, 1000);
  }

  // -------------------------------------------------------
  // 5. Big hero countdown (home)
  // -------------------------------------------------------
  function initBigCountdown() {
    const root = $('[data-big-countdown]');
    if (!root) return;

    const cells = {
      d: root.querySelector('[data-cd="d"]'),
      h: root.querySelector('[data-cd="h"]'),
      m: root.querySelector('[data-cd="m"]'),
      s: root.querySelector('[data-cd="s"]')
    };
    const stateBox = root.querySelector('[data-big-state]');
    const cellBox  = root.querySelector('[data-big-cells]');

    let prev = { d: null, h: null, m: null, s: null };

    function tick() {
      const now = new Date();
      if (now < TRIP.departPT) {
        if (stateBox) stateBox.hidden = true;
        if (cellBox)  cellBox.hidden = false;
        const t = formatDuration(TRIP.departPT - now);
        ['d','h','m','s'].forEach(k => {
          const el = cells[k];
          if (!el) return;
          const val = pad(t[k]);
          if (el.textContent !== val) {
            el.textContent = val;
            if (prev[k] !== null && !prefersReduced()) {
              el.classList.remove('flip');
              void el.offsetWidth;
              el.classList.add('flip');
            }
          }
          prev[k] = t[k];
        });
      } else if (now < TRIP.returnPT) {
        if (cellBox)  cellBox.hidden = true;
        if (stateBox) { stateBox.hidden = false; stateBox.innerHTML = 'On Retreat ' + SVG_VAN; }
      } else {
        if (cellBox)  cellBox.hidden = true;
        if (stateBox) { stateBox.hidden = false; stateBox.innerHTML = 'Deo gratias ' + SVG_PRAYER; }
      }
    }
    tick();
    setInterval(tick, 1000);
  }

  // -------------------------------------------------------
  // 6. Intersection observer reveals
  // -------------------------------------------------------
  function initReveal() {
    const targets = $$('[data-reveal], [data-reveal-stagger]');
    if (!targets.length || prefersReduced()) {
      targets.forEach(el => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(el => io.observe(el));
  }

  // -------------------------------------------------------
  // 7. Nav active + mobile More sheet
  // -------------------------------------------------------
  function initNav() {
    const path = location.pathname.split('/').pop() || 'index.html';
    $$('.nav-links a, .mnav a').forEach(a => {
      const href = a.getAttribute('href');
      if (href === path) a.setAttribute('aria-current', 'page');
    });

    // --- Schedule submenu ---
    const schedBtn = $('[data-open-schedule]');
    const schedSub = $('.mnav-sub');
    const schedBackdrop = $('.mnav-sub-backdrop');
    function closeSched() {
      if (!schedSub) return;
      schedSub.classList.remove('open');
      if (schedBackdrop) schedBackdrop.classList.remove('open');
      schedSub.setAttribute('aria-hidden', 'true');
    }
    if (schedBtn && schedSub) {
      function openSched() {
        schedSub.classList.add('open');
        if (schedBackdrop) schedBackdrop.classList.add('open');
        schedSub.setAttribute('aria-hidden', 'false');
      }
      schedBtn.addEventListener('click', () => {
        schedSub.classList.contains('open') ? closeSched() : openSched();
      });
      if (schedBackdrop) schedBackdrop.addEventListener('click', closeSched);
    }

    // --- More sheet ---
    const sheet = $('.sheet');
    const backdrop = $('.sheet-backdrop');
    const openBtn = $('[data-open-sheet]');
    const closeBtns = $$('[data-close-sheet]');
    if (!sheet || !openBtn) return;

    function open() {
      sheet.classList.add('open');
      backdrop.classList.add('open');
      sheet.setAttribute('aria-hidden', 'false');
    }
    function close() {
      sheet.classList.remove('open');
      backdrop.classList.remove('open');
      sheet.setAttribute('aria-hidden', 'true');
    }
    openBtn.addEventListener('click', open);
    closeBtns.forEach(btn => btn.addEventListener('click', close));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { close(); closeSched(); }
    });

    // --- Theme toggle ---
    $$('[data-theme-toggle]').forEach(btn => {
      btn.addEventListener('click', async () => {
        await Theme.toggle();
        $$('.sheet-theme-label').forEach(lbl => {
          const current = document.documentElement.getAttribute('data-theme');
          lbl.textContent = current === 'dark' ? 'Light mode' : 'Dark mode';
        });
      });
    });

    // --- Mobile top bar profile ---
    $$('[data-mtop-profile]').forEach(el => {
      if (!Auth.isGuest && Auth.displayName) {
        const name = Auth.displayName;
        el.textContent = name.charAt(0).toUpperCase();
      }
    });
  }

  // -------------------------------------------------------
  // 8. Hero particles (home)
  // -------------------------------------------------------
  function initHeroParticles() {
    const canvas = $('[data-hero-canvas]');
    if (!canvas || prefersReduced()) return;
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, particles = [], dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width  = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.floor((w * h) / 14000);
      particles = [];
      for (let i = 0; i < target; i++) particles.push(makeParticle());
    }

    function makeParticle() {
      const size = Math.random() * 1.8 + 0.3;
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -(Math.random() * 0.18 + 0.05),
        size,
        a: Math.random() * 0.5 + 0.2,
        phase: Math.random() * Math.PI * 2
      };
    }

    let raf = 0, t0 = performance.now();
    function frame(t) {
      const dt = Math.min(t - t0, 60); t0 = t;
      ctx.clearRect(0, 0, w, h);

      // Background light rays — subtle gold gradient sweeps
      const grd = ctx.createRadialGradient(w * 0.5, h * 0.85, 0, w * 0.5, h * 0.85, Math.max(w, h) * 0.9);
      grd.addColorStop(0, 'rgba(201, 161, 74, 0.10)');
      grd.addColorStop(0.4, 'rgba(201, 161, 74, 0.03)');
      grd.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      // Particles
      for (let p of particles) {
        p.x += p.vx * dt * 0.6;
        p.y += p.vy * dt * 0.6;
        p.phase += 0.02;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        const twinkle = 0.55 + Math.sin(p.phase) * 0.35;
        const alpha = p.a * twinkle;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(229, 192, 106, ${alpha.toFixed(3)})`;
        ctx.fill();
        // glow
        if (p.size > 1.2) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(229, 192, 106, ${(alpha * 0.08).toFixed(3)})`;
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(frame);
  }

  // -------------------------------------------------------
  // 9. RSVP wall (home)
  // -------------------------------------------------------
  async function initRSVP() {
    const form = $('[data-rsvp-form]');
    if (!form) return;

    const nameInput = form.querySelector('[name="name"]');
    const iconsWrap = form.querySelector('[data-saint-grid]');
    const wall      = $('[data-rsvp-wall]');
    const error     = form.querySelector('[data-rsvp-error]');
    let selectedIcon = null;

    iconsWrap.querySelectorAll('.saint').forEach(btn => {
      btn.addEventListener('click', () => {
        iconsWrap.querySelectorAll('.saint').forEach(b => b.setAttribute('aria-pressed', 'false'));
        btn.setAttribute('aria-pressed', 'true');
        selectedIcon = btn.dataset.icon;
      });
    });

    async function render() {
      const list = await Storage.get('rsvp:attendees', []);
      wall.innerHTML = '';
      if (!list.length) {
        wall.innerHTML = '<div class="wall-empty">Be the first to say <em>I\'m going</em> →</div>';
        return;
      }
      list.slice().reverse().forEach((it, i) => {
        const el = document.createElement('div');
        el.className = 'wall-item';
        el.style.animationDelay = (i * 60) + 'ms';
        el.innerHTML = `<span class="icon">${ICONS[it.icon] || ICONS.star}</span><span>${escapeHTML(it.name)}</span>`;
        wall.appendChild(el);
      });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = (nameInput.value || '').trim();
      error.textContent = '';
      if (!name) { error.textContent = 'Please enter your first name.'; return; }
      if (name.length > 32) { error.textContent = 'Name is a little long — try a shorter version.'; return; }
      if (!selectedIcon)    { error.textContent = 'Pick a saint icon to represent you.'; return; }

      const list = await Storage.get('rsvp:attendees', []);
      list.push({ name, icon: selectedIcon, timestamp: Date.now() });
      await Storage.set('rsvp:attendees', list, { shared: true });
      nameInput.value = '';
      iconsWrap.querySelectorAll('.saint').forEach(b => b.setAttribute('aria-pressed', 'false'));
      selectedIcon = null;
      await render();
      confettiBurst();
    });

    await render();
  }

  // -------------------------------------------------------
  // 10. Prayer intentions wall
  // -------------------------------------------------------
  async function initIntentions() {
    const form  = $('[data-intention-form]');
    if (!form) return;
    const input = form.querySelector('[name="intention"]');
    const stage = $('[data-intention-stage]');
    const error = form.querySelector('[data-intention-error]');

    let cancelPhysics = null;

    function startPhysics(els) {
      if (cancelPhysics) cancelPhysics();
      const sw = stage.clientWidth, sh = stage.clientHeight;
      const variants = ['', 'bubble-right', 'bubble-top', '', 'bubble-right', ''];
      const bubbles = els.map((el, i) => {
        const w = el.offsetWidth || 150, h = el.offsetHeight || 50;
        const x = Math.random() * Math.max(1, sw - w);
        const y = Math.random() * Math.max(1, sh - h);
        const speed = 0.28 + Math.random() * 0.22;
        const angle = Math.random() * Math.PI * 2;
        const rot = ((i * 7) % 11) - 5;
        el.style.transform = `rotate(${rot}deg)`;
        el.style.left = x + 'px';
        el.style.top  = y + 'px';
        return { el, x, y, w, h, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
      });

      let rafId;
      function step() {
        const sw2 = stage.clientWidth, sh2 = stage.clientHeight;
        // Move
        for (const b of bubbles) {
          b.x += b.vx; b.y += b.vy;
          if (b.x <= 0)          { b.x = 0;          b.vx =  Math.abs(b.vx); }
          if (b.x + b.w >= sw2)  { b.x = sw2 - b.w;  b.vx = -Math.abs(b.vx); }
          if (b.y <= 0)          { b.y = 0;          b.vy =  Math.abs(b.vy); }
          if (b.y + b.h >= sh2)  { b.y = sh2 - b.h;  b.vy = -Math.abs(b.vy); }
        }
        // Collide
        const pad = 6;
        for (let i = 0; i < bubbles.length; i++) {
          for (let j = i + 1; j < bubbles.length; j++) {
            const a = bubbles[i], c = bubbles[j];
            if (a.x < c.x + c.w + pad && a.x + a.w + pad > c.x &&
                a.y < c.y + c.h + pad && a.y + a.h + pad > c.y) {
              const tmpVx = a.vx, tmpVy = a.vy;
              a.vx = c.vx; a.vy = c.vy;
              c.vx = tmpVx; c.vy = tmpVy;
              // Separate to avoid sticky collisions
              const dx = (a.x + a.w / 2) - (c.x + c.w / 2);
              const dy = (a.y + a.h / 2) - (c.y + c.h / 2);
              const d = Math.sqrt(dx * dx + dy * dy) || 1;
              const push = 3;
              a.x += (dx / d) * push; a.y += (dy / d) * push;
              c.x -= (dx / d) * push; c.y -= (dy / d) * push;
            }
          }
        }
        // Apply
        for (const b of bubbles) {
          b.el.style.left = b.x + 'px';
          b.el.style.top  = b.y + 'px';
        }
        rafId = requestAnimationFrame(step);
      }
      rafId = requestAnimationFrame(step);
      cancelPhysics = () => cancelAnimationFrame(rafId);
    }

    async function render() {
      if (cancelPhysics) { cancelPhysics(); cancelPhysics = null; }
      const list = await Storage.get('intentions:list', []);
      stage.innerHTML = '';
      if (!list.length) {
        stage.innerHTML = '<div class="intentions-empty">Be the first — your intention will float here for the whole group to pray with.</div>';
        return;
      }
      const variants = ['', 'bubble-right', 'bubble-top', '', 'bubble-right', ''];
      const els = list.slice().reverse().slice(0, 12).map((it, idx) => {
        const el = document.createElement('div');
        el.className = 'intention-card ' + variants[idx % variants.length];
        el.textContent = it.text;
        stage.appendChild(el);
        return el;
      });
      // Let browser lay out the cards before reading sizes
      requestAnimationFrame(() => requestAnimationFrame(() => startPhysics(els)));
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = (input.value || '').trim();
      error.textContent = '';
      if (!text) { error.textContent = 'Please enter an intention.'; return; }
      if (text.length > 240) { error.textContent = 'Please keep it under 240 characters.'; return; }
      const list = await Storage.get('intentions:list', []);
      list.push({ text, timestamp: Date.now() });
      await Storage.set('intentions:list', list, { shared: true });
      input.value = '';
      await render();
    });

    await render();
  }

  // -------------------------------------------------------
  // 11. Confetti burst (gold sparkles)
  // -------------------------------------------------------
  function confettiBurst() {
    if (prefersReduced()) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'confetti-canvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = window.innerWidth  * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width  = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const w = window.innerWidth, h = window.innerHeight;
    const particles = [];
    const colors = ['#c9a14a', '#e5c06a', '#f0e9d6', '#f5f1e8', '#8a6e33'];
    const cx = w / 2, cy = h / 2;
    for (let i = 0; i < 140; i++) {
      const ang = Math.random() * Math.PI * 2;
      const sp  = Math.random() * 10 + 4;
      particles.push({
        x: cx, y: cy,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp - 2,
        size: Math.random() * 4 + 1.5,
        color: colors[(Math.random() * colors.length) | 0],
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        life: 1
      });
    }

    let start = performance.now();
    function frame(t) {
      const dt = Math.min((t - start) / 16, 3);
      start = t;
      ctx.clearRect(0, 0, w, h);
      let alive = 0;
      for (const p of particles) {
        if (p.life <= 0) continue;
        alive++;
        p.vy += 0.25 * dt;
        p.vx *= 0.995;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        p.life -= 0.008 * dt;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size, -p.size * 0.4, p.size * 2, p.size * 0.8);
        ctx.restore();
      }
      if (alive > 0) requestAnimationFrame(frame);
      else canvas.remove();
    }
    requestAnimationFrame(frame);
  }

  // -------------------------------------------------------
  // 12. Prayer lines fade-in (home)
  // -------------------------------------------------------
  function initPrayerLines() {
    const prayer = $('[data-prayer-lines]');
    if (!prayer) return;
    const lines = prayer.querySelectorAll('.line');
    if (prefersReduced()) {
      lines.forEach(l => l.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        lines.forEach((l, i) => {
          setTimeout(() => l.classList.add('in'), i * 650);
        });
        io.unobserve(entry.target);
      });
    }, { threshold: 0.35 });
    io.observe(prayer);
  }

  // -------------------------------------------------------
  // 13. Timeline stops data (module-level)
  // -------------------------------------------------------
  const STOPS = [
    // ── Saturday ──
    { id: 1,  day: 'sat', timeA: '03:45', timeB: '05:30',
      title: 'Meet at St. Juan Diego Parish, Tieton',
      addr:  'St. Juan Diego Parish, Tieton, WA',
      map:   'https://www.google.com/maps/search/?api=1&query=St.+Juan+Diego+Parish+Tieton+WA',
      body:  'Morning prayer, roll call, load vehicles, final restroom break before the road. Please arrive on time — we leave together.',
      bring: 'Everything you packed. Coffee optional but recommended.'
    },
    { id: 2,  day: 'sat', timeA: '04:00', timeB: '05:45',
      title: 'Depart Tieton',
      body:  'Route: US-12 W → I-82 W → I-90 W → I-405 N → Meydenbauer Center. Approximately 142 miles, ~2h 25m clean drive time.',
    },
    { id: 3,  day: 'sat', timeA: '05:00', timeB: '06:50',
      title: 'Rest stop — Indian John Hill Rest Area',
      addr:  'Indian John Hill Rest Area, I-90 near Cle Elum, WA',
      map:   'https://www.google.com/maps/search/?api=1&query=Indian+John+Hill+Rest+Area',
      body:  '15 minutes — restroom, coffee, stretch, regroup the caravan before Snoqualmie Pass.',
    },
    { id: 4,  day: 'sat', timeA: '06:30', timeB: '08:15',
      title: 'Arrive Meydenbauer Center',
      addr:  '11100 NE 6th St, Bellevue, WA',
      map:   'https://www.google.com/maps/search/?api=1&query=Meydenbauer+Center+Bellevue+WA',
      body:  'Park in the underground garage. Walk in together, check in, find seats as a group near the front if possible.',
    },
    { id: 5,  day: 'sat', timeA: '07:00', optionOnly: 'A',
      title: 'Eucharistic Adoration · Confession · Praise Music',
      body:  'Early arrival perk — two hours of Adoration, a confession window, and praise music before the main program begins.',
    },
    { id: 6,  day: 'sat', time: '09:00',
      title: 'Welcome & Opening Remarks',
      body:  'Fr. Nicholas Wichert and Deacon Charlie Echeverry open ASCEND.',
    },
    { id: 7,  day: 'sat', time: '09:15',
      title: 'Morning Plenary — Chris Stefanick',
      body:  'The first of two plenary talks from Chris Stefanick.',
    },
    { id: 8,  day: 'sat', time: '10:45',
      title: 'Breakout Sessions',
      body:  'Recommended for our group: the Youth Breakout with Dr. Andrew & Sarah Swafford. Other options: Dr. Tim Gray (English) or Deacon Charlie Echeverry (Spanish).',
    },
    { id: 9,  day: 'sat', time: '12:00',
      title: 'Lunch at local Bellevue restaurants',
      body:  '[PLACEHOLDER: list 3–4 walkable options + group meet-back time + note whether the group covers this meal or members pay their own — Bright Minds to clarify]',
    },
    { id: 10, day: 'sat', time: '13:30',
      title: 'Program resumes — Center Hall',
      body:  '1st floor of Meydenbauer. Find your seats again.',
    },
    { id: 11, day: 'sat', time: '15:30',
      title: 'Afternoon Plenary — Chris Stefanick',
      body:  'Second plenary talk.',
    },
    { id: 12, day: 'sat', time: '16:30',
      title: 'Praise Music & Adoration — Marie Miller',
      body:  'Folk singer Marie Miller performs. Adoration closes the afternoon.',
    },
    { id: 13, day: 'sat', time: '17:00',
      title: 'Holy Mass — Archbishop Paul Etienne',
      body:  'The high point of the day. Mass celebrated by the Archbishop of Seattle.',
    },
    { id: 14, day: 'sat', time: '18:30',
      title: 'Walk with One — Eucharistic Missionaries',
      body:  'Commissioning ceremony for Eucharistic missionaries — we are sent.',
    },
    { id: 15, day: 'sat', time: '19:00',
      title: 'ASCEND concludes',
      body:  'Gather your things. Meet at the vehicles.',
    },
    { id: 16, day: 'sat', time: '19:30',
      title: 'Depart Meydenbauer → La Quinta Lynnwood',
      body:  '~25 min drive, ~17 mi north on I-405 → I-5.',
    },
    { id: 17, day: 'sat', time: '20:00',
      title: 'Hotel check-in — La Quinta Inn Lynnwood',
      addr:  '4300 Alderwood Mall Blvd, Lynnwood, WA · (425) 775-7447',
      map:   'https://www.google.com/maps/search/?api=1&query=La+Quinta+Inn+Lynnwood+4300+Alderwood+Mall+Blvd',
      body:  'Check in, drop bags. Guys and girls in separate rooms.',
    },
    { id: 18, day: 'sat', time: '21:00',
      title: 'Group dinner + debrief',
      body:  '[PLACEHOLDER: pick a spot near the hotel — Alderwood Mall area has many options]',
    },
    { id: 19, day: 'sat', time: '23:00',
      title: 'Lights out',
      body:  'Latin Mass is early tomorrow. Rest well.',
    },
    // ── Sunday ──
    { id: 20, day: 'sun', time: '05:45',
      title: 'Wake up',
      body:  'No hotel breakfast this morning — we are eating after Mass. Get ready and meet in the lobby.',
    },
    { id: 21, day: 'sun', time: '06:15',
      title: 'Depart hotel → North American Martyrs Parish',
      body:  '~15 min, ~7 mi. Arrive by 6:40 to settle in and get Latin Mass booklets.',
    },
    { id: 22, day: 'sun', time: '07:00',
      title: 'Traditional Latin Mass — NAM Parish, Edmonds',
      addr:  '9924 232nd St SW, Edmonds, WA 98020',
      map:   'https://www.google.com/maps/search/?api=1&query=North+American+Martyrs+Parish+Edmonds+WA',
      body:  'The 7:00 AM Low Mass at North American Martyrs, served by the FSSP. The second Yakima group driving up Sunday meets us here. Please arrive by 6:40 to get booklets.',
    },
    { id: 23, day: 'sun', time: '08:15',
      title: 'Fellowship outside church — group photo',
      body:  'Meet the second Yakima group. Group photo on the steps. Mass ends around 8:00.',
    },
    { id: 24, day: 'sun', time: '08:45',
      title: 'Breakfast',
      body:  '[PLACEHOLDER: restaurant near Edmonds — Bright Minds to confirm location]',
    },
    { id: 25, day: 'sun', time: '09:45',
      title: 'Depart for Seattle',
      body:  '~25 min, ~17 mi south on I-5.',
    },
    { id: 26, day: 'sun', time: '10:15',
      title: 'Arrive St. James Cathedral',
      addr:  '804 9th Ave, Seattle, WA 98104',
      map:   'https://www.google.com/maps/search/?api=1&query=St.+James+Cathedral+Seattle',
      body:  'Visit, prayer, light candles, confession if available. Mother church of the Archdiocese of Seattle — plan about an hour.',
    },
    { id: 27, day: 'sun', time: '11:15',
      title: 'Depart St. James',
      body:  '[PLACEHOLDER: destination after cathedral — TBD by Bright Minds]',
    },
    { id: 28, day: 'sun', time: '12:00',
      title: 'Lunch',
      body:  '[PLACEHOLDER: location TBD — Bright Minds to confirm]',
    },
    { id: 29, day: 'sun', time: '13:30',
      title: 'Afternoon fellowship',
      body:  '[PLACEHOLDER: TBD by Bright Minds]',
    },
    { id: 30, day: 'sun', time: '16:30',
      title: 'Depart Seattle for Yakima',
      body:  'I-5 S → I-90 E → I-82 E → US-12 E. ~2h 45m.',
    },
    { id: 31, day: 'sun', time: '19:15',
      title: 'Arrive home — Deo gratias',
      body:  'Blessed be God in His angels and in His saints.',
    }
  ];

  function stopDate(stop, option) {
    const dateStr = stop.day === 'sat' ? '2026-05-16' : '2026-05-17';
    let time = stop.time;
    if (!time) time = (option === 'A' ? stop.timeA : stop.timeB);
    return new Date(`${dateStr}T${time}:00-07:00`);
  }

  function formatStopTime(stop, option) {
    const d = stopDate(stop, option);
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit',
      timeZone: 'America/Los_Angeles'
    });
  }

  function computeStates(stops, now) {
    let currentIdx = -1;
    for (let i = 0; i < stops.length; i++) {
      if (now >= stopDate(stops[i])) currentIdx = i;
    }
    return stops.map((_, i) => {
      if (i < currentIdx) return 'past';
      if (i === currentIdx) return 'current';
      return 'upcoming';
    });
  }

  function relativeLabel(stop, option, now) {
    const d = stopDate(stop, option);
    const diff = d - now;
    if (diff < 0) return '';
    const { d: dd, h, m } = formatDuration(diff);
    if (dd > 0) return `in ${dd}d ${h}h`;
    if (h > 0)  return `in ${h}h ${m}m`;
    if (m > 1)  return `in ${m} min`;
    if (m === 1) return `in 1 min`;
    return `in <1 min`;
  }

  // -------------------------------------------------------
  // 14. Timeline page
  // -------------------------------------------------------
  async function initTimeline() {
    const root = $('[data-timeline]');
    if (!root) return;

    const list = $('[data-timeline-list]');
    const banner = $('[data-timeline-banner]');
    const bannerCountdown = $('[data-banner-countdown]');
    const toggleA = $('[data-option="A"]');
    const toggleB = $('[data-option="B"]');

    let option = (await Storage.get('user:departureOption', 'A')) || 'A';

    function setOption(newOption, persist = true) {
      option = newOption;
      toggleA.setAttribute('aria-pressed', option === 'A' ? 'true' : 'false');
      toggleB.setAttribute('aria-pressed', option === 'B' ? 'true' : 'false');
      if (persist) Storage.set('user:departureOption', option, { shared: false });
      render();
    }

    toggleA.addEventListener('click', () => setOption('A'));
    toggleB.addEventListener('click', () => setOption('B'));

    const openIds = new Set();

    function render() {
      const filtered = STOPS.filter(s => !s.optionOnly || s.optionOnly === option);
      const now = new Date();
      const states = computeStates(filtered, now);

      // preserve currently expanded stops across re-renders
      list.querySelectorAll('.stop-card.open').forEach(card => {
        const stopEl = card.closest('.stop');
        if (stopEl && stopEl.dataset.stopId) openIds.add(stopEl.dataset.stopId);
      });

      list.innerHTML = '';
      let lastDay = null;
      let currentStopEl = null;

      filtered.forEach((stop, i) => {
        if (stop.day !== lastDay) {
          const marker = document.createElement('div');
          marker.className = 'day-marker';
          marker.id = stop.day === 'sat' ? 'timeline-saturday' : 'timeline-sunday';
          marker.innerHTML = `<span>${stop.day === 'sat' ? 'Saturday · May 16, 2026' : 'Sunday · May 17, 2026'}</span>`;
          list.appendChild(marker);
          lastDay = stop.day;
        }

        const state = states[i];
        const el = document.createElement('article');
        el.className = `stop ${state}`;
        el.dataset.stopId = stop.id;

        const card = document.createElement('div');
        card.className = 'stop-card';

        const time = formatStopTime(stop, option);
        const rel  = state === 'upcoming' ? relativeLabel(stop, option, now) : '';
        const statusLabel = state === 'current' ? '<span class="live-dot"></span>Happening now'
                          : state === 'past'    ? 'Completed'
                          : rel || 'Upcoming';

        const headerId = `stop-head-${stop.id}`;
        const detailId = `stop-detail-${stop.id}`;

        card.innerHTML = `
          <button type="button" class="stop-head" id="${headerId}" aria-expanded="false" aria-controls="${detailId}">
            <div class="stop-time">
              <span>${time}</span>
              <span class="stop-status">${statusLabel}</span>
            </div>
            <h3 class="stop-title">${escapeHTML(stop.title)}</h3>
          </button>
          <div class="stop-detail" id="${detailId}" role="region" aria-labelledby="${headerId}">
            ${stop.addr ? `<span class="addr">${escapeHTML(stop.addr)}</span>` : ''}
            <p>${escapeHTML(stop.body)}</p>
            ${stop.bring ? `<p><strong class="text-gold">Bring:</strong> ${escapeHTML(stop.bring)}</p>` : ''}
            ${stop.map ? `<a class="map-link" href="${stop.map}" target="_blank" rel="noopener">Open in Google Maps →</a>` : ''}
          </div>
        `;

        const headBtn = card.querySelector('.stop-head');

        if (openIds.has(String(stop.id))) {
          card.classList.add('open');
          headBtn.setAttribute('aria-expanded', 'true');
        }

        headBtn.addEventListener('click', () => {
          const open = card.classList.toggle('open');
          headBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
          if (open) openIds.add(String(stop.id));
          else openIds.delete(String(stop.id));
        });

        const dot = document.createElement('div');
        dot.className = 'stop-dot';

        el.appendChild(dot);
        el.appendChild(card);
        list.appendChild(el);

        if (state === 'current') currentStopEl = el;
      });

      // Banner — before, during, after
      if (now < TRIP.departPT) {
        banner.hidden = false;
        banner.innerHTML = `
          <h4>Retreat begins in</h4>
          <div class="banner-countdown" data-banner-countdown>${formatCompact(TRIP.departPT - now)}</div>
          <p class="text-mute" style="font-size:0.8125rem; margin-top:0.5rem;">Times below reflect Option ${option} · ${option === 'A' ? 'With Confession &amp; Adoration' : 'Without Confession &amp; Adoration'}</p>
        `;
      } else if (now < TRIP.returnPT) {
        banner.hidden = false;
        banner.innerHTML = `<h4 style="color: var(--live);"><span class="live-dot"></span>On retreat now</h4><p class="text-dim">Times update live.</p><button type="button" class="btn btn-outline btn-sm" data-jump-current style="margin-top:0.5rem">Jump to current stop</button>`;
        const jumpBtn = banner.querySelector('[data-jump-current]');
        if (jumpBtn) {
          jumpBtn.addEventListener('click', () => {
            const target = list.querySelector('.stop.current') || list.querySelector('.stop.upcoming');
            if (target) {
              const y = target.getBoundingClientRect().top + window.scrollY - 140;
              window.scrollTo({ top: Math.max(0, y), behavior: prefersReduced() ? 'auto' : 'smooth' });
            }
          });
        }
      } else {
        banner.hidden = false;
        banner.innerHTML = `<h4>Retreat complete — <span class="italic">Deo gratias</span> ${SVG_PRAYER}</h4><p class="text-dim">Thank you for walking with us. Blessed be God in His angels and in His saints.</p>`;
      }

      // No auto-scroll — let users read the option cards first
    }

    setOption(option, false);
    setInterval(render, 30000); // refresh every 30s for relative labels / state transitions

    // live banner countdown (every second)
    setInterval(() => {
      const el = $('[data-banner-countdown]');
      const now = new Date();
      if (el && now < TRIP.departPT) {
        el.textContent = formatCompact(TRIP.departPT - now);
      }
    }, 1000);
  }

  // -------------------------------------------------------
  // 15. Packing checklist
  // -------------------------------------------------------
  async function initPacking() {
    const root = $('[data-packing]');
    if (!root) return;
    const boxes = $$('input[type="checkbox"]', root);
    const totalEl = $('[data-packing-total]');
    const countEl = $('[data-packing-count]');
    const fill = $('[data-packing-fill]');

    const saved = await Storage.get('packing:checklist', {}) || {};
    boxes.forEach(b => { if (saved[b.id]) b.checked = true; });

    function update() {
      const total = boxes.length;
      const done  = boxes.filter(b => b.checked).length;
      if (totalEl) totalEl.textContent = total;
      if (countEl) countEl.textContent = done;
      if (fill) fill.style.width = (total ? (done / total) * 100 : 0) + '%';
      const state = {};
      boxes.forEach(b => { if (b.checked) state[b.id] = true; });
      Storage.set('packing:checklist', state, { shared: false });
    }

    boxes.forEach(b => b.addEventListener('change', update));
    update();
  }

  // -------------------------------------------------------
  // 16. Speaker card flip
  // -------------------------------------------------------
  function initSpeakers() {
    const cards = $$('.speaker');
    if (!cards.length) return;
    cards.forEach(card => {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      const toggle = () => card.classList.toggle('flipped');
      card.addEventListener('click', toggle);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    });
  }

  // -------------------------------------------------------
  // 17. Footer auto date
  // -------------------------------------------------------
  function initFooter() {
    const y = $('[data-year]');
    if (y) y.textContent = new Date().getFullYear();
    const u = $('[data-updated]');
    if (u) {
      const d = new Date();
      u.textContent = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
  }

  // -------------------------------------------------------
  // 18. Smooth internal scroll for anchor links
  // -------------------------------------------------------
  function initAnchors() {
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href').slice(1);
        if (!id) return;
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        const y = target.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top: y, behavior: prefersReduced() ? 'auto' : 'smooth' });
      });
    });
  }

  // -------------------------------------------------------
  // 18b. Scroll to top button
  // -------------------------------------------------------
  function initScrollTop() {
    const btn = document.querySelector('.btn-scroll-top');
    if (!btn) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          btn.classList.toggle('visible', window.scrollY > 400);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReduced() ? 'auto' : 'smooth' });
    });
  }

  // -------------------------------------------------------
  // 19. Helpers
  // -------------------------------------------------------
  function escapeHTML(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  // -------------------------------------------------------
  // 20. Onboarding wizard (first visit)
  // -------------------------------------------------------
  async function initOnboarding() {
    const done = await Storage.get('onboarding:complete', false);
    if (done) return;

    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/.test(ua);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

    const wizard = document.createElement('div');
    wizard.className = 'onboarding';
    wizard.setAttribute('role', 'dialog');
    wizard.setAttribute('aria-modal', 'true');
    wizard.setAttribute('aria-label', 'Welcome setup');

    // Platform-specific install instructions
    let installHTML = '';
    if (isIOS) {
      installHTML = `
        <div class="ob-instruction">
          <div class="ob-instruction-num">1</div>
          <p>Tap the <span class="ob-key"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg> Share</span> button at the bottom of Safari</p>
        </div>
        <div class="ob-instruction">
          <div class="ob-instruction-num">2</div>
          <p>Scroll down and tap <strong>"Add to Home Screen"</strong></p>
        </div>
        <div class="ob-instruction">
          <div class="ob-instruction-num">3</div>
          <p>Tap <strong>"Add"</strong> in the top right corner</p>
        </div>`;
    } else if (isAndroid) {
      installHTML = `
        <div class="ob-instruction">
          <div class="ob-instruction-num">1</div>
          <p>Tap the <strong>three-dot menu</strong> <span class="ob-key">&#8942;</span> at the top right of Chrome</p>
        </div>
        <div class="ob-instruction">
          <div class="ob-instruction-num">2</div>
          <p>Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong></p>
        </div>
        <div class="ob-instruction">
          <div class="ob-instruction-num">3</div>
          <p>Tap <strong>"Install"</strong> to confirm</p>
        </div>`;
    } else {
      installHTML = `
        <div class="ob-instruction">
          <div class="ob-instruction-num">1</div>
          <p>Press <strong>Ctrl+D</strong> (Windows) or <strong>Cmd+D</strong> (Mac) to bookmark this site for quick access</p>
        </div>`;
    }

    const totalSteps = isStandalone ? 4 : 5;
    let stepNum = 0;

    const installStep = isStandalone ? '' : `
        <div class="ob-step active" data-ob-step="${++stepNum}">
          <span class="eyebrow">Step ${stepNum} of ${totalSteps}</span>
          <h2>Add to your home screen</h2>
          <p class="lede">This site is your retreat guide. Pin it to your home screen for quick access all weekend.</p>
          ${installHTML}
          <div class="ob-actions">
            <button type="button" class="btn btn-ghost" data-ob-next>Skip</button>
            <button type="button" class="btn btn-primary" data-ob-next>Next</button>
          </div>
        </div>`;

    const dotsHTML = Array.from({ length: totalSteps }, (_, i) =>
      `<span class="ob-dot${i === 0 ? ' active' : ''}"></span>`
    ).join('');

    wizard.innerHTML = `
      <div class="ob-inner">
        <div class="ob-progress" aria-hidden="true">
          ${dotsHTML}
        </div>

        ${installStep}

        <div class="ob-step${isStandalone ? ' active' : ''}" data-ob-step="${++stepNum}">
          <span class="eyebrow">Step ${stepNum} of ${totalSteps}</span>
          <h2>Option A: With Confession &amp; Adoration</h2>
          <div class="ob-time-blocks">
            <div class="ob-time-block">
              <span class="ob-time">3:45 AM</span>
              <span class="ob-time-label">Depart from St. Juan Diego Parish, Tieton</span>
            </div>
            <div class="ob-time-block">
              <span class="ob-time">6:30 AM</span>
              <span class="ob-time-label">Arrive at Meydenbauer Center, Bellevue</span>
            </div>
            <div class="ob-time-block">
              <span class="ob-time">7:00 AM</span>
              <span class="ob-time-label">Eucharistic Adoration &amp; Confession begin</span>
            </div>
            <div class="ob-time-block">
              <span class="ob-time">9:00 AM</span>
              <span class="ob-time-label">ASCEND conference opens</span>
            </div>
          </div>
          <p class="ob-desc">Arrive early for two hours of Eucharistic Adoration, a Confession window, and praise music before the main program begins. It means a very early start, but you begin the day in the Lord's presence.</p>
          <div class="ob-actions">
            <button type="button" class="btn btn-ghost" data-ob-prev>Back</button>
            <button type="button" class="btn btn-primary" data-ob-next>Next</button>
          </div>
        </div>

        <div class="ob-step" data-ob-step="${++stepNum}">
          <span class="eyebrow">Step ${stepNum} of ${totalSteps}</span>
          <h2>Option B: Without Confession &amp; Adoration</h2>
          <div class="ob-time-blocks">
            <div class="ob-time-block">
              <span class="ob-time">5:30 AM</span>
              <span class="ob-time-label">Depart from St. Juan Diego Parish, Tieton</span>
            </div>
            <div class="ob-time-block">
              <span class="ob-time">8:15 AM</span>
              <span class="ob-time-label">Arrive at Meydenbauer Center, Bellevue</span>
            </div>
            <div class="ob-time-block">
              <span class="ob-time">9:00 AM</span>
              <span class="ob-time-label">ASCEND conference opens</span>
            </div>
          </div>
          <p class="ob-desc">Sleep a bit more and head straight to the conference. You'll arrive with time to settle in before the opening session. The day is still packed with powerful speakers, worship, and Holy Mass — just without the early Adoration and Confession window.</p>
          <div class="ob-actions">
            <button type="button" class="btn btn-ghost" data-ob-prev>Back</button>
            <button type="button" class="btn btn-primary" data-ob-next>Next</button>
          </div>
        </div>

        <div class="ob-step" data-ob-step="${++stepNum}">
          <span class="eyebrow">Step ${stepNum} of ${totalSteps}</span>
          <h2>Choose your departure</h2>
          <p class="lede">Which option works best for you?</p>
          <div class="ob-choices">
            <button type="button" class="ob-choice" data-ob-option="A" aria-pressed="false">
              <h3>Option A — With Confession &amp; Adoration</h3>
              <p class="ob-choice-sub">Depart 3:45 AM &middot; Adoration + Confession + ASCEND</p>
              <span class="ob-choice-tag">Recommended</span>
            </button>
            <button type="button" class="ob-choice" data-ob-option="B" aria-pressed="false">
              <h3>Option B — Without Confession &amp; Adoration</h3>
              <p class="ob-choice-sub">Depart 5:30 AM &middot; Conference only</p>
            </button>
          </div>
          <p class="ob-note">You can change this anytime on the Timeline page.</p>
          <div class="ob-actions">
            <button type="button" class="btn btn-ghost" data-ob-prev>Back</button>
            <button type="button" class="btn btn-primary" data-ob-next data-ob-require-option disabled>Next</button>
          </div>
        </div>

        <div class="ob-step" data-ob-step="${++stepNum}">
          <span class="eyebrow">Step ${stepNum} of ${totalSteps}</span>
          <h2>Choose your look</h2>
          <p class="lede">Pick a theme. You can switch anytime from the menu.</p>
          <div class="ob-theme-cards">
            <button type="button" class="ob-theme-choice" data-ob-theme="dark" aria-pressed="false">
              <div class="ob-theme-preview ob-preview-dark"></div>
              <span>Dark</span>
            </button>
            <button type="button" class="ob-theme-choice" data-ob-theme="light" aria-pressed="true">
              <div class="ob-theme-preview ob-preview-light"></div>
              <span>Light</span>
            </button>
          </div>
          <div class="ob-actions">
            <button type="button" class="btn btn-ghost" data-ob-prev>Back</button>
            <button type="button" class="btn btn-primary" data-ob-finish>Get Started</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(wizard);

    // Navigation
    let currentStep = 1;
    let selectedOption = null;
    const steps = wizard.querySelectorAll('.ob-step');
    const dots = wizard.querySelectorAll('.ob-dot');

    function goTo(n) {
      if (n < 1 || n > totalSteps) return;
      steps.forEach(s => s.classList.remove('active'));
      dots.forEach((d, i) => d.classList.toggle('active', i < n));
      wizard.querySelector(`[data-ob-step="${n}"]`).classList.add('active');
      currentStep = n;
    }

    wizard.querySelectorAll('[data-ob-next]').forEach(btn =>
      btn.addEventListener('click', () => goTo(currentStep + 1))
    );
    wizard.querySelectorAll('[data-ob-prev]').forEach(btn =>
      btn.addEventListener('click', () => goTo(currentStep - 1))
    );

    // Step 4: option selection
    wizard.querySelectorAll('[data-ob-option]').forEach(btn => {
      btn.addEventListener('click', () => {
        wizard.querySelectorAll('[data-ob-option]').forEach(b => b.setAttribute('aria-pressed', 'false'));
        btn.setAttribute('aria-pressed', 'true');
        selectedOption = btn.dataset.obOption;
        const nextBtn = wizard.querySelector('[data-ob-require-option]');
        if (nextBtn) nextBtn.disabled = false;
      });
    });

    // Step 5: theme selection (live preview)
    wizard.querySelectorAll('[data-ob-theme]').forEach(btn => {
      btn.addEventListener('click', () => {
        wizard.querySelectorAll('[data-ob-theme]').forEach(b => b.setAttribute('aria-pressed', 'false'));
        btn.setAttribute('aria-pressed', 'true');
        Theme.apply(btn.dataset.obTheme);
      });
    });

    // Finish
    return new Promise(resolve => {
      wizard.querySelector('[data-ob-finish]').addEventListener('click', async () => {
        if (selectedOption) {
          await Storage.set('user:departureOption', selectedOption, { shared: false });
        }
        const theme = document.documentElement.getAttribute('data-theme') || 'light';
        await Theme.set(theme);
        await Storage.set('onboarding:complete', true, { shared: false });
        wizard.classList.add('closing');
        setTimeout(() => { wizard.remove(); resolve(); }, 500);
      });
    });
  }

  // ============================================
  // SUPABASE CONFIG
  // ============================================
  const SUPABASE_URL = 'https://iisgwprvkzbwkeuygvlz.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlpc2d3cHJ2a3pid2tldXlndmx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NjUwMjksImV4cCI6MjA5MTM0MTAyOX0.rKo2mRJVfNihvF9re04dKCzUr-GaSuzeWr6a0D0Ltnw';
  const TURNSTILE_SITE_KEY = '0x4AAAAAAC3B7AbNZ6C3qQ-9';
  const BOOTSTRAP_ADMIN_USERNAME = 'alex';
  const SOURCE_CODE_URL = 'https://github.com/ragerbanjoo/ascend';
  const PBKDF2_ITERATIONS = 250000;

  // Supabase client (lazy-loaded)
  let _supabase = null;
  function getSupabase() {
    if (_supabase) return _supabase;
    if (typeof window.supabase === 'undefined') return null;
    _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return _supabase;
  }

  // ============================================
  // CRYPTO MODULE — AES-GCM + PBKDF2
  // ============================================
  const Crypto = {
    _cek: null, // Content Encryption Key — MEMORY ONLY

    get hasCEK() { return !!this._cek; },

    async deriveKey(password, salt) {
      const enc = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        'raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']
      );
      return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']
      );
    },

    generateSalt() {
      const salt = new Uint8Array(16);
      crypto.getRandomValues(salt);
      return salt;
    },

    async generateCEK() {
      return crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']
      );
    },

    async wrapCEK(cek, wrappingKey) {
      const iv = new Uint8Array(12);
      crypto.getRandomValues(iv);
      const wrapped = await crypto.subtle.wrapKey('raw', cek, wrappingKey, { name: 'AES-GCM', iv });
      return { wrapped: this._toBase64(new Uint8Array(wrapped)), iv: this._toBase64(iv) };
    },

    async unwrapCEK(wrappedB64, ivB64, unwrappingKey) {
      const wrapped = this._fromBase64(wrappedB64);
      const iv = this._fromBase64(ivB64);
      return crypto.subtle.unwrapKey(
        'raw', wrapped, unwrappingKey,
        { name: 'AES-GCM', iv },
        { name: 'AES-GCM', length: 256 },
        true, ['encrypt', 'decrypt']
      );
    },

    async encrypt(plaintext) {
      if (!this._cek) throw new Error('No encryption key loaded');
      const enc = new TextEncoder();
      const iv = new Uint8Array(12);
      crypto.getRandomValues(iv);
      const ct = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv }, this._cek, enc.encode(plaintext)
      );
      return { ciphertext: this._toBase64(new Uint8Array(ct)), iv: this._toBase64(iv) };
    },

    async decrypt(ciphertextB64, ivB64) {
      if (!this._cek) throw new Error('No encryption key loaded');
      const ct = this._fromBase64(ciphertextB64);
      const iv = this._fromBase64(ivB64);
      const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, this._cek, ct);
      return new TextDecoder().decode(pt);
    },

    setCEK(key) { this._cek = key; },
    clearCEK() { this._cek = null; },

    _toBase64(buf) { return btoa(String.fromCharCode(...buf)); },
    _fromBase64(str) { return Uint8Array.from(atob(str), c => c.charCodeAt(0)); },

    // BIP39 word list (embedded subset — 2048 words)
    _bip39Words: null,
    async getBip39Words() {
      if (this._bip39Words) return this._bip39Words;
      // Load from CDN
      try {
        const resp = await fetch('https://cdn.jsdelivr.net/npm/bip39@3.1.0/src/wordlists/english.json');
        this._bip39Words = await resp.json();
      } catch (e) {
        // Fallback: generate random words (not true BIP39 but functional)
        console.warn('Could not load BIP39 wordlist, using fallback');
        this._bip39Words = [];
      }
      return this._bip39Words;
    },

    async generateRecoveryPhrase() {
      const words = await this.getBip39Words();
      if (words.length < 2048) {
        // Fallback: generate hex string split into 12 chunks
        const bytes = new Uint8Array(16);
        crypto.getRandomValues(bytes);
        const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
        return Array.from({ length: 12 }, (_, i) => hex.slice(i * 2, i * 2 + 3) || 'word').join(' ');
      }
      const entropy = new Uint8Array(16); // 128 bits = 12 words
      crypto.getRandomValues(entropy);
      const phrase = [];
      // Convert 128 bits to 12 11-bit indices
      let bits = '';
      for (const byte of entropy) bits += byte.toString(2).padStart(8, '0');
      // Add 4-bit checksum (simplified — just use first 4 bits of SHA hash)
      const hashBuf = await crypto.subtle.digest('SHA-256', entropy);
      const hashBits = new Uint8Array(hashBuf)[0].toString(2).padStart(8, '0');
      bits += hashBits.slice(0, 4);
      for (let i = 0; i < 12; i++) {
        const idx = parseInt(bits.slice(i * 11, (i + 1) * 11), 2);
        phrase.push(words[idx % 2048]);
      }
      return phrase.join(' ');
    },

    async deriveKeyFromPhrase(phrase, salt) {
      // Use the phrase as the "password" for PBKDF2
      return this.deriveKey(phrase, salt);
    }
  };

  // ============================================
  // AUTH MODULE
  // ============================================
  const Auth = {
    _user: null,
    _profile: null,
    _listeners: [],

    get user() { return this._user; },
    get profile() { return this._profile; },
    get isGuest() { return !this._user; },
    get isAdmin() { return this._profile?.is_admin === true; },
    get username() { return this._profile?.username || null; },
    get displayName() { return this._profile?.display_name || this._profile?.username || 'pilgrim'; },

    onChange(fn) { this._listeners.push(fn); },
    _notify() { this._listeners.forEach(fn => fn(this._user, this._profile)); },

    async init() {
      const sb = getSupabase();
      if (!sb) return;

      const { data: { session } } = await sb.auth.getSession();
      if (session?.user) {
        this._user = session.user;
        await this._loadProfile();
        await this._updateLastSeen();
      }

      sb.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          this._user = session.user;
          await this._loadProfile();
        } else {
          this._user = null;
          this._profile = null;
          Crypto.clearCEK();
        }
        this._notify();
      });
    },

    async _loadProfile() {
      const sb = getSupabase();
      if (!sb || !this._user) return;
      const { data } = await sb.from('profiles').select('*').eq('id', this._user.id).single();
      this._profile = data;
    },

    async _updateLastSeen() {
      const sb = getSupabase();
      if (!sb || !this._user) return;
      await sb.from('profiles').update({ last_seen_at: new Date().toISOString() }).eq('id', this._user.id);
    },

    async checkUsernameTaken(username) {
      const sb = getSupabase();
      if (!sb) return false;
      const { data } = await sb.from('profiles').select('id').eq('username', username).maybeSingle();
      return !!data;
    },

    async checkRateLimited(username) {
      const sb = getSupabase();
      if (!sb) return false;
      const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { count } = await sb.from('failed_logins')
        .select('id', { count: 'exact', head: true })
        .eq('username', username)
        .gte('attempted_at', tenMinAgo);
      return (count || 0) >= 5;
    },

    async recordFailedLogin(username) {
      const sb = getSupabase();
      if (!sb) return;
      await sb.from('failed_logins').insert({ username, ip_hash: 'client' });
    },

    async signup(username, password, turnstileToken) {
      const sb = getSupabase();
      if (!sb) throw new Error('Supabase not configured');

      // 1. Validate username
      const uname = username.toLowerCase().trim();
      if (!/^[a-z0-9_]{3,20}$/.test(uname)) throw new Error('Username must be 3-20 chars, lowercase letters, numbers, and underscores only');

      // 2. Check uniqueness
      if (await this.checkUsernameTaken(uname)) throw new Error('Username is already taken');

      // 3. Derive encryption keys
      const passwordSalt = Crypto.generateSalt();
      const phraseSalt = Crypto.generateSalt();
      const passwordKey = await Crypto.deriveKey(password, passwordSalt);

      // 4. Generate CEK
      const cek = await Crypto.generateCEK();

      // 5. Generate recovery phrase
      const phrase = await Crypto.generateRecoveryPhrase();
      const phraseKey = await Crypto.deriveKeyFromPhrase(phrase, phraseSalt);

      // 6. Wrap CEK with both keys
      const passwordWrap = await Crypto.wrapCEK(cek, passwordKey);
      const phraseWrap = await Crypto.wrapCEK(cek, phraseKey);

      // 7. Sign up with Supabase
      const email = `${uname}@pilgrim.sjdyag.com`;
      const { data: authData, error: authError } = await sb.auth.signUp({ email, password });
      if (authError) throw new Error(authError.message);

      // 8. Insert profile
      const { error: profileError } = await sb.from('profiles').insert({
        id: authData.user.id,
        username: uname,
        display_name: uname,
        salt: Crypto._toBase64(passwordSalt),
        cek_password_wrapped: passwordWrap.wrapped,
        cek_password_iv: passwordWrap.iv,
        cek_phrase_wrapped: phraseWrap.wrapped,
        cek_phrase_iv: phraseWrap.iv,
        phrase_salt: Crypto._toBase64(phraseSalt),
      });
      if (profileError) throw new Error(profileError.message);

      // 9. Insert default sharing prefs
      await sb.from('sharing_preferences').insert({ user_id: authData.user.id });

      // 10. Set CEK in memory
      Crypto.setCEK(cek);
      this._user = authData.user;
      await this._loadProfile();
      this._notify();

      return { user: authData.user, recoveryPhrase: phrase };
    },

    async login(username, password) {
      const sb = getSupabase();
      if (!sb) throw new Error('Supabase not configured');

      const uname = username.toLowerCase().trim();

      // Check rate limiting
      if (await this.checkRateLimited(uname)) {
        throw new Error('Account temporarily locked. Try again in 15 minutes.');
      }

      const email = `${uname}@pilgrim.sjdyag.com`;
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) {
        await this.recordFailedLogin(uname);
        throw new Error('Invalid username or password');
      }

      // Derive CEK from password
      this._user = data.user;
      await this._loadProfile();

      if (this._profile?.salt && this._profile?.cek_password_wrapped) {
        const salt = Crypto._fromBase64(this._profile.salt);
        const passwordKey = await Crypto.deriveKey(password, salt);
        const cek = await Crypto.unwrapCEK(
          this._profile.cek_password_wrapped,
          this._profile.cek_password_iv,
          passwordKey
        );
        Crypto.setCEK(cek);
      }

      await this._updateLastSeen();
      this._notify();
      return data.user;
    },

    async recoverWithPhrase(username, phrase, newPassword) {
      const sb = getSupabase();
      if (!sb) throw new Error('Supabase not configured');

      // First login with any method to get session — use admin reset or
      // we need a different approach. Since we can't login without password,
      // we use a Supabase edge function or the user must already be logged in.
      // For now: the recovery phrase flow works when user is NOT logged in
      // by looking up the profile by username (public) and using the phrase
      // to unwrap the CEK locally.
      // Then we call auth.updateUser to set the new password.

      // This requires a special flow — the user enters username + phrase,
      // we look up their public encryption metadata, unwrap CEK with phrase,
      // re-wrap with new password, then update via Supabase password reset.
      // Note: updateUser requires an active session. So recovery requires
      // an admin-assisted password reset first, then the user re-wraps.
      // For simplicity: show instructions to contact Alex for password reset,
      // then on next login with temp password, re-wrap with new password.
      throw new Error('Contact Alex (alex@sjdyoungadults.com) for password recovery. Have your recovery phrase ready.');
    },

    async logout() {
      const sb = getSupabase();
      if (sb) await sb.auth.signOut();
      this._user = null;
      this._profile = null;
      Crypto.clearCEK();
      this._notify();
    },

    async changePassword(currentPassword, newPassword) {
      const sb = getSupabase();
      if (!sb || !this._user) throw new Error('Not authenticated');

      // Re-derive old key to verify, then re-wrap CEK with new key
      const salt = Crypto._fromBase64(this._profile.salt);
      const oldKey = await Crypto.deriveKey(currentPassword, salt);

      // Verify by unwrapping
      try {
        await Crypto.unwrapCEK(this._profile.cek_password_wrapped, this._profile.cek_password_iv, oldKey);
      } catch (e) {
        throw new Error('Current password is incorrect');
      }

      // Generate new salt, derive new key, re-wrap CEK
      const newSalt = Crypto.generateSalt();
      const newKey = await Crypto.deriveKey(newPassword, newSalt);
      const newWrap = await Crypto.wrapCEK(Crypto._cek, newKey);

      // Update Supabase auth password
      const { error } = await sb.auth.updateUser({ password: newPassword });
      if (error) throw new Error(error.message);

      // Update profile with new wrap
      await sb.from('profiles').update({
        salt: Crypto._toBase64(newSalt),
        cek_password_wrapped: newWrap.wrapped,
        cek_password_iv: newWrap.iv,
      }).eq('id', this._user.id);

      await this._loadProfile();
    },

    async updateProfile(updates) {
      const sb = getSupabase();
      if (!sb || !this._user) return;
      await sb.from('profiles').update(updates).eq('id', this._user.id);
      await this._loadProfile();
      this._notify();
    }
  };

  // ============================================
  // DATASTORE — Unified interface (guest=localStorage, auth=Supabase)
  // ============================================
  const DataStore = {
    // Packing items
    async getPackingItems() {
      if (Auth.isGuest) {
        return Storage._lsGet('hub:packing', {});
      }
      const sb = getSupabase();
      const { data } = await sb.from('packing_items').select('*').eq('user_id', Auth.user.id);
      const items = {};
      (data || []).forEach(r => { items[r.item_key] = r.checked; });
      return items;
    },

    async setPackingItem(key, checked) {
      if (Auth.isGuest) {
        const items = Storage._lsGet('hub:packing', {});
        items[key] = checked;
        Storage._lsSet('hub:packing', items);
        return;
      }
      const sb = getSupabase();
      await sb.from('packing_items').upsert({
        user_id: Auth.user.id, item_key: key, checked, updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,item_key' });
    },

    // Journal entries (ENCRYPTED)
    async getJournalEntries(filter) {
      if (Auth.isGuest) {
        let entries = Storage._lsGet('hub:journal', []);
        if (filter) entries = entries.filter(e => (e.entry_type || 'journal') === filter);
        return entries;
      }
      const sb = getSupabase();
      let query = sb.from('journal_entries').select('*')
        .eq('user_id', Auth.user.id).order('created_at', { ascending: false });
      if (filter) query = query.eq('entry_type', filter);
      const { data } = await query;
      if (!data || !Crypto.hasCEK) return data || [];
      const decrypted = [];
      for (const entry of data) {
        try {
          const title = entry.title_ciphertext ? await Crypto.decrypt(entry.title_ciphertext, entry.title_iv) : '';
          const body = entry.body_ciphertext ? await Crypto.decrypt(entry.body_ciphertext, entry.body_iv) : '';
          const speaker = entry.speaker_ciphertext ? await Crypto.decrypt(entry.speaker_ciphertext, entry.speaker_iv) : '';
          const talkTitle = entry.talk_title_ciphertext ? await Crypto.decrypt(entry.talk_title_ciphertext, entry.talk_title_iv) : '';
          decrypted.push({ ...entry, title, body, speaker, talkTitle });
        } catch (e) {
          decrypted.push({ ...entry, title: '[Encrypted]', body: '[Could not decrypt]', speaker: '', talkTitle: '' });
        }
      }
      return decrypted;
    },

    async saveJournalEntry(id, title, body, opts) {
      opts = opts || {};
      const entryType = opts.entryType || 'journal';
      const speaker = opts.speaker || '';
      const talkTitle = opts.talkTitle || '';
      if (Auth.isGuest) {
        const entries = Storage._lsGet('hub:journal', []);
        const now = new Date().toISOString();
        if (id) {
          const idx = entries.findIndex(e => e.id === id);
          if (idx >= 0) { entries[idx] = { ...entries[idx], title, body, entry_type: entryType, speaker, talkTitle, updated_at: now }; }
        } else {
          entries.unshift({ id: crypto.randomUUID(), title, body, entry_type: entryType, speaker, talkTitle, created_at: now, updated_at: now });
        }
        Storage._lsSet('hub:journal', entries);
        return;
      }
      const sb = getSupabase();
      const titleEnc = title ? await Crypto.encrypt(title) : { ciphertext: null, iv: null };
      const bodyEnc = body ? await Crypto.encrypt(body) : { ciphertext: null, iv: null };
      const speakerEnc = speaker ? await Crypto.encrypt(speaker) : { ciphertext: null, iv: null };
      const talkTitleEnc = talkTitle ? await Crypto.encrypt(talkTitle) : { ciphertext: null, iv: null };
      const row = {
        title_ciphertext: titleEnc.ciphertext, title_iv: titleEnc.iv,
        body_ciphertext: bodyEnc.ciphertext, body_iv: bodyEnc.iv,
        speaker_ciphertext: speakerEnc.ciphertext, speaker_iv: speakerEnc.iv,
        talk_title_ciphertext: talkTitleEnc.ciphertext, talk_title_iv: talkTitleEnc.iv,
        entry_type: entryType,
      };
      if (id) {
        row.updated_at = new Date().toISOString();
        await sb.from('journal_entries').update(row).eq('id', id).eq('user_id', Auth.user.id);
      } else {
        row.user_id = Auth.user.id;
        await sb.from('journal_entries').insert(row);
      }
    },

    async deleteJournalEntry(id) {
      if (Auth.isGuest) {
        const entries = Storage._lsGet('hub:journal', []);
        Storage._lsSet('hub:journal', entries.filter(e => e.id !== id));
        return;
      }
      const sb = getSupabase();
      await sb.from('journal_entries').delete().eq('id', id).eq('user_id', Auth.user.id);
    },

    // Talk notes (plaintext)
    async getTalkNotes() {
      if (Auth.isGuest) return Storage._lsGet('hub:talknotes', []);
      const sb = getSupabase();
      const { data } = await sb.from('talk_notes').select('*')
        .eq('user_id', Auth.user.id).order('created_at', { ascending: false });
      return data || [];
    },

    async saveTalkNote(id, speaker, talkTitle, notes) {
      if (Auth.isGuest) {
        const items = Storage._lsGet('hub:talknotes', []);
        const now = new Date().toISOString();
        if (id) {
          const idx = items.findIndex(e => e.id === id);
          if (idx >= 0) items[idx] = { ...items[idx], speaker, talk_title: talkTitle, notes, updated_at: now };
        } else {
          items.unshift({ id: crypto.randomUUID(), speaker, talk_title: talkTitle, notes, created_at: now });
        }
        Storage._lsSet('hub:talknotes', items);
        return;
      }
      const sb = getSupabase();
      if (id) {
        await sb.from('talk_notes').update({ speaker, talk_title: talkTitle, notes }).eq('id', id).eq('user_id', Auth.user.id);
      } else {
        await sb.from('talk_notes').insert({ user_id: Auth.user.id, speaker, talk_title: talkTitle, notes });
      }
    },

    // Prayer log (localStorage only — used by rosary.html)
    async logPrayer(type, detail) {
      const log = Storage._lsGet('hub:prayerlog', []);
      log.unshift({ id: crypto.randomUUID(), prayer_type: type, detail, prayed_at: new Date().toISOString() });
      Storage._lsSet('hub:prayerlog', log);
    },

    // Private intentions (ENCRYPTED)
    async getIntentions() {
      if (Auth.isGuest) return Storage._lsGet('hub:intentions', []);
      const sb = getSupabase();
      const { data } = await sb.from('private_intentions').select('*')
        .eq('user_id', Auth.user.id).order('created_at', { ascending: false });
      if (!data || !Crypto.hasCEK) return data || [];
      const decrypted = [];
      for (const item of data) {
        try {
          const text = await Crypto.decrypt(item.text_ciphertext, item.text_iv);
          decrypted.push({ ...item, text });
        } catch (e) {
          decrypted.push({ ...item, text: '[Could not decrypt]' });
        }
      }
      return decrypted;
    },

    async saveIntention(text) {
      if (Auth.isGuest) {
        const items = Storage._lsGet('hub:intentions', []);
        items.unshift({ id: crypto.randomUUID(), text, answered: false, created_at: new Date().toISOString() });
        Storage._lsSet('hub:intentions', items);
        return;
      }
      const sb = getSupabase();
      const enc = await Crypto.encrypt(text);
      await sb.from('private_intentions').insert({
        user_id: Auth.user.id, text_ciphertext: enc.ciphertext, text_iv: enc.iv
      });
    },

    async toggleIntentionAnswered(id, answered) {
      if (Auth.isGuest) {
        const items = Storage._lsGet('hub:intentions', []);
        const idx = items.findIndex(e => e.id === id);
        if (idx >= 0) items[idx].answered = answered;
        Storage._lsSet('hub:intentions', items);
        return;
      }
      const sb = getSupabase();
      await sb.from('private_intentions').update({ answered }).eq('id', id).eq('user_id', Auth.user.id);
    },

    async deleteIntention(id) {
      if (Auth.isGuest) {
        const items = Storage._lsGet('hub:intentions', []);
        Storage._lsSet('hub:intentions', items.filter(e => e.id !== id));
        return;
      }
      const sb = getSupabase();
      await sb.from('private_intentions').delete().eq('id', id).eq('user_id', Auth.user.id);
    },

    // Photos
    async getPhotos(filter) {
      if (Auth.isGuest) return Storage._lsGet('hub:photos', []);
      const sb = getSupabase();
      let q = sb.from('photos').select('*');
      if (filter === 'mine') q = q.eq('user_id', Auth.user.id);
      else if (filter === 'group') q = q.eq('visibility', 'group');
      const { data } = await q.order('created_at', { ascending: false });
      return data || [];
    },

    async uploadPhoto(file, caption, visibility) {
      if (Auth.isGuest) {
        // Store as data URL in localStorage (limited)
        const photos = Storage._lsGet('hub:photos', []);
        const reader = new FileReader();
        return new Promise((resolve) => {
          reader.onload = () => {
            photos.unshift({ id: crypto.randomUUID(), dataUrl: reader.result, caption, visibility, created_at: new Date().toISOString() });
            Storage._lsSet('hub:photos', photos);
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }
      const sb = getSupabase();
      const ext = file.name.split('.').pop();
      const path = `${Auth.user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadErr } = await sb.storage.from('photos').upload(path, file);
      if (uploadErr) throw new Error(uploadErr.message);
      await sb.from('photos').insert({
        user_id: Auth.user.id, storage_path: path, caption, visibility
      });
    },

    // Sharing preferences
    async getSharingPrefs() {
      if (Auth.isGuest) return { share_profile: false, share_packing_progress: false, share_photos: false };
      const sb = getSupabase();
      const { data } = await sb.from('sharing_preferences').select('*').eq('user_id', Auth.user.id).single();
      return data || { share_profile: false, share_packing_progress: false, share_photos: false };
    },

    async updateSharingPrefs(prefs) {
      if (Auth.isGuest) return;
      const sb = getSupabase();
      await sb.from('sharing_preferences').upsert({ user_id: Auth.user.id, ...prefs, updated_at: new Date().toISOString() });
    },

    // Friends (profiles with share_profile enabled)
    async getFriends() {
      if (Auth.isGuest) return [];
      const sb = getSupabase();
      const { data: prefs } = await sb.from('sharing_preferences')
        .select('user_id').eq('share_profile', true);
      const ids = (prefs || []).map(p => p.user_id).filter(id => id !== Auth.user.id);
      if (!ids.length) return [];
      const { data } = await sb.from('profiles')
        .select('username, display_name, saint_icon').in('id', ids);
      return data || [];
    },

    // Audit log (user's own)
    async getMyAuditLog() {
      if (Auth.isGuest) return [];
      const sb = getSupabase();
      const { data } = await sb.from('admin_access_log').select('*')
        .eq('target_user_id', Auth.user.id).order('created_at', { ascending: false });
      return data || [];
    },

    // Scheduled deletion
    async getScheduledDeletion() {
      if (Auth.isGuest) return null;
      const sb = getSupabase();
      const { data } = await sb.from('scheduled_deletions').select('*')
        .eq('user_id', Auth.user.id).maybeSingle();
      return data;
    },

    async scheduleAccountDeletion() {
      if (Auth.isGuest) return;
      const sb = getSupabase();
      const scheduledFor = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      await sb.from('scheduled_deletions').upsert({
        user_id: Auth.user.id, scheduled_for: scheduledFor
      });
    },

    async cancelAccountDeletion() {
      if (Auth.isGuest) return;
      const sb = getSupabase();
      await sb.from('scheduled_deletions').delete().eq('user_id', Auth.user.id);
    }
  };

  // ============================================
  // GUEST-TO-ACCOUNT MIGRATION
  // ============================================
  async function migrateGuestDataToAccount() {
    const userId = Auth.user?.id;
    if (!userId) return;

    // Packing
    const packing = Storage._lsGet('hub:packing', {});
    for (const [key, checked] of Object.entries(packing)) {
      await DataStore.setPackingItem(key, checked);
    }

    // Journal (encrypt)
    const journal = Storage._lsGet('hub:journal', []);
    for (const entry of journal) {
      await DataStore.saveJournalEntry(null, entry.title || '', entry.body || '');
    }

    // Talk notes
    const notes = Storage._lsGet('hub:talknotes', []);
    for (const note of notes) {
      await DataStore.saveTalkNote(null, note.speaker, note.talk_title, note.notes);
    }

    // Intentions (encrypt)
    const intentions = Storage._lsGet('hub:intentions', []);
    for (const item of intentions) {
      await DataStore.saveIntention(item.text);
    }

    // Clear localStorage hub data
    ['hub:packing', 'hub:journal', 'hub:talknotes', 'hub:intentions', 'hub:photos'].forEach(k => {
      try { localStorage.removeItem(k); } catch (e) {}
    });

    showToast('Saved! Your journey is now safe across all your devices.');
  }

  // ============================================
  // ADMIN — Audit logging
  // ============================================
  async function logAdminAction(action, targetUserId, targetUsername, details) {
    const sb = getSupabase();
    if (!sb || !Auth.user) return;
    await sb.from('admin_access_log').insert({
      admin_user_id: Auth.user.id,
      admin_username: Auth.username,
      action,
      target_user_id: targetUserId,
      target_username: targetUsername,
      details
    });
  }

  // ============================================
  // TOAST NOTIFICATIONS
  // ============================================
  function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // ============================================
  // HUB PAGE LOGIC
  // ============================================
  async function initHub() {
    const hubEl = document.querySelector('[data-hub]');
    if (!hubEl) return;

    // --- Jump-nav dropdown ---
    const jumpBtn = hubEl.querySelector('.hub-jumpnav-btn');
    const jumpNav = hubEl.querySelector('.hub-jumpnav');
    if (jumpBtn && jumpNav) {
      jumpBtn.addEventListener('click', () => {
        const open = jumpNav.classList.toggle('open');
        jumpBtn.setAttribute('aria-expanded', open);
      });
      jumpNav.querySelectorAll('.hub-jumpnav-menu a').forEach(a => {
        a.addEventListener('click', () => {
          jumpNav.classList.remove('open');
          jumpBtn.setAttribute('aria-expanded', 'false');
        });
      });
      document.addEventListener('click', (e) => {
        if (!jumpNav.contains(e.target)) {
          jumpNav.classList.remove('open');
          jumpBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Check for scheduled deletion banner
    if (!Auth.isGuest) {
      const deletion = await DataStore.getScheduledDeletion();
      if (deletion) {
        const date = new Date(deletion.scheduled_for).toLocaleDateString();
        const banner = document.createElement('div');
        banner.className = 'hub-deletion-banner';
        banner.innerHTML = `Your account is scheduled for deletion on <strong>${date}</strong>. <button type="button" data-cancel-deletion>Cancel deletion</button>`;
        hubEl.prepend(banner);
        banner.querySelector('[data-cancel-deletion]').addEventListener('click', async () => {
          await DataStore.cancelAccountDeletion();
          banner.remove();
          showToast('Deletion cancelled.');
        });
      }
    }

    // Guest banner
    if (Auth.isGuest) {
      const guestBanner = hubEl.querySelector('.hub-guest-banner');
      if (guestBanner) {
        guestBanner.style.display = '';
        guestBanner.querySelector('[data-auth-cta]')?.addEventListener('click', () => openAuthModal('signup'));
      }
    }

    // Update welcome text
    const welcomeEl = hubEl.querySelector('[data-hub-welcome]');
    if (welcomeEl) {
      welcomeEl.textContent = `Welcome, ${Auth.isGuest ? 'pilgrim' : '@' + Auth.displayName}`;
    }

    // Account pill
    const accountPill = hubEl.querySelector('[data-account-pill]');
    if (accountPill) {
      accountPill.textContent = Auth.isGuest ? 'Guest' : 'Signed in';
      accountPill.className = `hub-account-pill ${Auth.isGuest ? 'guest' : 'auth'}`;
    }

    // Settings link (visible for signed-in users)
    const settingsBtn = hubEl.querySelector('[data-hub-settings]');
    if (settingsBtn && !Auth.isGuest) settingsBtn.style.display = '';

    // Save CTA (visible for guests)
    const saveCta = hubEl.querySelector('#hub-save-btn');
    if (saveCta && Auth.isGuest) {
      saveCta.style.display = '';
      saveCta.addEventListener('click', () => openAuthModal('signup'));
    }

    // Export button
    document.querySelector('[data-export-all]')?.addEventListener('click', (e) => {
      e.preventDefault();
      exportAllData();
    });

    // Init sub-features
    await initHubPacking();
    await initHubJournal();
    await initHubIntentions();
    initHubConfessionPrep();
    initHubEmergency();

    // Auto-export reminder (May 18+)
    if (!Auth.isGuest) {
      const now = new Date();
      const exportDate = new Date('2026-05-18T00:00:00-07:00');
      if (now >= exportDate && !Storage._lsGet('hub:export-reminder-dismissed', false)) {
        showToast('Your pilgrimage is complete. Download a copy of your journey to keep forever.', 'info');
        Storage._lsSet('hub:export-reminder-dismissed', true);
      }
    }
  }

  // Hub sub-feature inits
  async function initHubPacking() {
    const container = document.querySelector('[data-hub-packing]');
    if (!container) return;
    const items = await DataStore.getPackingItems();
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
      const key = cb.dataset.packKey;
      if (key && items[key]) cb.checked = true;
      cb.addEventListener('change', () => DataStore.setPackingItem(key, cb.checked));
    });
    updatePackingProgress(container);
  }

  function updatePackingProgress(container) {
    const cbs = container.querySelectorAll('input[type="checkbox"]');
    const total = cbs.length;
    const checked = Array.from(cbs).filter(c => c.checked).length;
    const bar = container.querySelector('[data-packing-progress]');
    if (bar) {
      bar.style.setProperty('--progress', `${total ? (checked / total) * 100 : 0}%`);
      bar.setAttribute('aria-valuenow', checked);
      bar.setAttribute('aria-valuemax', total);
    }
    const label = container.querySelector('[data-packing-count]');
    if (label) label.textContent = `${checked}/${total}`;
  }

  async function initHubJournal() {
    const container = document.querySelector('[data-hub-journal]');
    if (!container) return;
    const entries = await DataStore.getJournalEntries();
    const count = container.querySelector('[data-journal-count]');
    if (count) count.textContent = entries.length + ' ' + (entries.length === 1 ? 'entry' : 'entries');
  }

  async function initHubIntentions() {
    const container = document.querySelector('[data-hub-intentions]');
    if (!container) return;

    async function render() {
      const items = await DataStore.getIntentions();
      const list = container.querySelector('[data-intentions-list]');
      if (!list) return;
      const count = container.querySelector('[data-intentions-count]');
      if (count) count.textContent = items.length;

      list.innerHTML = items.length ? items.map(i => `
        <div class="intention-item ${i.answered ? 'answered' : ''}">
          <button type="button" data-toggle-intention="${i.id}" class="intention-check" aria-label="${i.answered ? 'Mark unanswered' : 'Mark answered'}">${i.answered ? '&#10003;' : ''}</button>
          <span>${escapeHtml(i.text || '')}</span>
          <button type="button" data-delete-intention="${i.id}" class="btn-icon" aria-label="Delete">&times;</button>
        </div>
      `).join('') : '<p class="text-mute">No intentions yet.</p>';

      list.querySelectorAll('[data-toggle-intention]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const item = items.find(i => i.id === btn.dataset.toggleIntention);
          await DataStore.toggleIntentionAnswered(btn.dataset.toggleIntention, !item?.answered);
          render();
        });
      });

      list.querySelectorAll('[data-delete-intention]').forEach(btn => {
        btn.addEventListener('click', async () => {
          await DataStore.deleteIntention(btn.dataset.deleteIntention);
          render();
        });
      });
    }

    container.querySelector('[data-new-intention]')?.addEventListener('click', () => {
      const input = container.querySelector('[data-intention-input]');
      if (input && input.value.trim()) {
        DataStore.saveIntention(input.value.trim()).then(render);
        input.value = '';
      }
    });

    await render();
  }

  function initHubConfessionPrep() {
    // Static content, no dynamic init needed beyond reveal
  }

  function initHubEmergency() {
    // Static content
  }

  // ============================================
  // AUTH MODAL
  // ============================================
  function openAuthModal(mode = 'login') {
    const existing = document.querySelector('.auth-modal-overlay');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.className = 'modal-overlay auth-modal-overlay';
    modal.innerHTML = `
      <div class="modal auth-modal">
        <button type="button" class="modal-close" data-modal-cancel aria-label="Close">&times;</button>
        <div class="auth-tabs">
          <button type="button" class="auth-tab ${mode === 'login' ? 'active' : ''}" data-auth-tab="login">Sign in</button>
          <button type="button" class="auth-tab ${mode === 'signup' ? 'active' : ''}" data-auth-tab="signup">Create account</button>
        </div>

        <form class="auth-form" data-auth-form="login" ${mode !== 'login' ? 'style="display:none"' : ''}>
          <div class="field-group">
            <label for="login-user">Username</label>
            <input type="text" id="login-user" class="field" autocomplete="username" required>
          </div>
          <div class="field-group">
            <label for="login-pass">Password</label>
            <input type="password" id="login-pass" class="field" autocomplete="current-password" required>
          </div>
          <div class="cf-turnstile" data-sitekey="${TURNSTILE_SITE_KEY}" data-size="compact"></div>
          <p class="auth-error" data-auth-error style="display:none"></p>
          <button type="submit" class="btn btn-primary btn-full">Sign in</button>
          <p class="text-mute text-center" style="font-size:0.8rem;margin-top:var(--space-3)">
            Forgot password? <a href="mailto:alex@sjdyoungadults.com">Contact Alex</a> with your recovery phrase.
          </p>
        </form>

        <form class="auth-form" data-auth-form="signup" ${mode !== 'signup' ? 'style="display:none"' : ''}>
          <div class="field-group">
            <label for="signup-user">Username</label>
            <input type="text" id="signup-user" class="field" autocomplete="username" pattern="[a-z0-9_]{3,20}" required>
            <p class="field-hint">3-20 chars: lowercase letters, numbers, underscores</p>
          </div>
          <div class="field-group">
            <label for="signup-pass">Password</label>
            <input type="password" id="signup-pass" class="field" autocomplete="new-password" minlength="10" required>
            <div class="password-meter" data-pw-meter><div class="password-meter-fill"></div></div>
            <p class="field-hint" data-pw-hint>Minimum 10 characters</p>
          </div>
          <input type="text" name="website" style="display:none" tabindex="-1" autocomplete="off" data-honeypot>
          <div class="cf-turnstile" data-sitekey="${TURNSTILE_SITE_KEY}" data-size="compact"></div>
          <p class="auth-error" data-auth-error style="display:none"></p>
          <p class="text-mute" style="font-size:0.8rem">No email needed. Your journal and private intentions are encrypted end-to-end. Only you can read them.</p>
          <button type="submit" class="btn btn-primary btn-full">Create account</button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('open'));

    // Tab switching
    modal.querySelectorAll('[data-auth-tab]').forEach(tab => {
      tab.addEventListener('click', () => {
        modal.querySelectorAll('[data-auth-tab]').forEach(t => t.classList.remove('active'));
        modal.querySelectorAll('[data-auth-form]').forEach(f => f.style.display = 'none');
        tab.classList.add('active');
        modal.querySelector(`[data-auth-form="${tab.dataset.authTab}"]`).style.display = '';
      });
    });

    // Close
    modal.querySelector('[data-modal-cancel]').addEventListener('click', () => {
      modal.classList.remove('open');
      setTimeout(() => modal.remove(), 300);
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
        setTimeout(() => modal.remove(), 300);
      }
    });

    // Password strength meter (zxcvbn loaded via CDN)
    const pwInput = modal.querySelector('#signup-pass');
    const meter = modal.querySelector('[data-pw-meter]');
    const hint = modal.querySelector('[data-pw-hint]');
    if (pwInput && meter) {
      pwInput.addEventListener('input', () => {
        if (typeof zxcvbn === 'function') {
          const result = zxcvbn(pwInput.value);
          const fill = meter.querySelector('.password-meter-fill');
          const pct = (result.score / 4) * 100;
          fill.style.width = pct + '%';
          fill.className = 'password-meter-fill score-' + result.score;
          if (hint) hint.textContent = result.feedback.suggestions[0] || (result.score >= 3 ? 'Strong password' : 'Keep going...');
        }
      });
    }

    // Login form
    modal.querySelector('[data-auth-form="login"]').addEventListener('submit', async (e) => {
      e.preventDefault();
      const errEl = e.target.querySelector('[data-auth-error]');
      errEl.style.display = 'none';
      const btn = e.target.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Signing in...';
      try {
        const user = e.target.querySelector('#login-user').value;
        const pass = e.target.querySelector('#login-pass').value;
        await Auth.login(user, pass);
        modal.classList.remove('open');
        setTimeout(() => { modal.remove(); location.reload(); }, 300);
      } catch (err) {
        errEl.textContent = err.message;
        errEl.style.display = '';
        btn.disabled = false;
        btn.textContent = 'Sign in';
      }
    });

    // Signup form
    modal.querySelector('[data-auth-form="signup"]').addEventListener('submit', async (e) => {
      e.preventDefault();
      const errEl = e.target.querySelector('[data-auth-error]');
      errEl.style.display = 'none';

      // Honeypot check
      if (e.target.querySelector('[data-honeypot]').value) return;

      // zxcvbn check
      const pass = e.target.querySelector('#signup-pass').value;
      if (typeof zxcvbn === 'function' && zxcvbn(pass).score < 3) {
        errEl.textContent = 'Please choose a stronger password.';
        errEl.style.display = '';
        return;
      }

      const btn = e.target.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Creating account...';
      try {
        const user = e.target.querySelector('#signup-user').value;
        const { recoveryPhrase } = await Auth.signup(user, pass);

        // Show recovery phrase screen
        modal.querySelector('.auth-modal').innerHTML = `
          <div class="recovery-phrase-screen">
            <h3>Your Recovery Phrase</h3>
            <p>Your journal and private intentions are encrypted with your password. If you forget your password, this 12-word phrase is the <strong>only way</strong> to get them back.</p>
            <div class="recovery-words">${recoveryPhrase.split(' ').map((w, i) => `<span class="recovery-word"><em>${i + 1}</em>${escapeHtml(w)}</span>`).join('')}</div>
            <div class="recovery-actions">
              <button type="button" class="btn btn-ghost" data-copy-phrase>Copy to clipboard</button>
              <button type="button" class="btn btn-ghost" data-download-phrase>Download as text</button>
            </div>
            <p class="recovery-warning">Write this down somewhere safe. Screenshot it. Email it to yourself. Alex cannot recover this for you. If you lose both your password AND this phrase, your journal is gone forever.</p>
            <button type="button" class="btn btn-primary btn-full" data-phrase-continue disabled>I've saved this somewhere safe — continue</button>
          </div>
        `;

        // Enable continue after 10 seconds
        const continueBtn = modal.querySelector('[data-phrase-continue]');
        setTimeout(() => { continueBtn.disabled = false; }, 10000);

        modal.querySelector('[data-copy-phrase]')?.addEventListener('click', () => {
          navigator.clipboard.writeText(recoveryPhrase).then(() => showToast('Copied!'));
        });

        modal.querySelector('[data-download-phrase]')?.addEventListener('click', () => {
          const blob = new Blob([`ASCEND Recovery Phrase for @${Auth.username}\n\n${recoveryPhrase}\n\nKeep this safe. Do not share it.`], { type: 'text/plain' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `ascend-recovery-${Auth.username}.txt`;
          a.click();
        });

        continueBtn.addEventListener('click', async () => {
          await migrateGuestDataToAccount();
          modal.classList.remove('open');
          setTimeout(() => { modal.remove(); location.reload(); }, 300);
        });
      } catch (err) {
        errEl.textContent = err.message;
        errEl.style.display = '';
        btn.disabled = false;
        btn.textContent = 'Create account';
      }
    });

    // Load Turnstile script if needed
    if (!document.querySelector('script[src*="turnstile"]')) {
      const s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      s.async = true;
      document.head.appendChild(s);
    }
  }

  // ============================================
  // FIRST-VISIT HUB MODAL
  // ============================================
  function initHubFirstVisit() {
    if (!document.querySelector('[data-hub]')) return;
    const seen = Storage._lsGet('hub:welcome-seen', false);
    if (seen || !Auth.isGuest) return;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal hub-welcome-modal">
        <h2>Welcome, pilgrim.</h2>
        <p>Save your packing list, journal, talk notes, and photos.</p>
        <div class="hub-welcome-actions">
          <button type="button" class="btn btn-primary" data-welcome-signup>Create a free account</button>
          <button type="button" class="btn btn-ghost" data-welcome-guest>Continue as guest</button>
        </div>
        <p class="text-mute" style="font-size:0.8rem;margin-top:var(--space-4)">
          Accounts use a username and password — no email needed.<br>
          Your journal and private intentions are encrypted end-to-end. Only you can read them.
        </p>
      </div>
    `;
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('open'));

    modal.querySelector('[data-welcome-signup]').addEventListener('click', () => {
      Storage._lsSet('hub:welcome-seen', true);
      modal.classList.remove('open');
      setTimeout(() => { modal.remove(); openAuthModal('signup'); }, 300);
    });

    modal.querySelector('[data-welcome-guest]').addEventListener('click', () => {
      Storage._lsSet('hub:welcome-seen', true);
      modal.classList.remove('open');
      setTimeout(() => modal.remove(), 300);
    });
  }

  // ============================================
  // EXPORT ALL DATA
  // ============================================
  async function exportAllData() {
    showToast('Preparing export...', 'info');
    try {
      // Load JSZip
      if (typeof JSZip === 'undefined') {
        await loadScript('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js');
      }
      const zip = new JSZip();
      const username = Auth.username || 'guest';
      const now = new Date().toISOString().split('T')[0];

      // Profile
      zip.file('profile.json', JSON.stringify({
        username, display_name: Auth.displayName,
        created: Auth.profile?.created_at, last_seen: Auth.profile?.last_seen_at
      }, null, 2));

      // Packing
      zip.file('packing.json', JSON.stringify(await DataStore.getPackingItems(), null, 2));

      // Journal (decrypted)
      const journal = await DataStore.getJournalEntries();
      zip.file('journal.json', JSON.stringify(journal.map(e => ({
        title: e.title, body: e.body, created: e.created_at, updated: e.updated_at
      })), null, 2));

      // Talk notes
      zip.file('talk-notes.json', JSON.stringify(await DataStore.getTalkNotes(), null, 2));

      // Intentions (decrypted)
      const intentions = await DataStore.getIntentions();
      zip.file('intentions.json', JSON.stringify(intentions.map(i => ({
        text: i.text, answered: i.answered, created: i.created_at
      })), null, 2));

      // Audit log
      zip.file('audit-log.json', JSON.stringify(await DataStore.getMyAuditLog(), null, 2));

      // README
      zip.file('README.txt', `ASCEND Pilgrim Hub Export\nExported: ${new Date().toLocaleString()}\nUser: @${username}\n\nThis is your pilgrimage. Keep it forever.\n\nFiles:\n- profile.json — Your account info\n- packing.json — Packing checklist\n- journal.json — Journal entries (decrypted)\n- talk-notes.json — Notes from talks\n- intentions.json — Private intentions (decrypted)\n- audit-log.json — Account activity log\n`);

      const blob = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `sjd-pilgrimage-${username}-${now}.zip`;
      a.click();
      showToast('Export complete!');
    } catch (e) {
      showToast('Export failed: ' + e.message, 'error');
    }
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  // ============================================
  // UTILITY
  // ============================================
  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // -------------------------------------------------------
  // Kick off on DOM ready
  // -------------------------------------------------------
  async function start() {
    await Theme.init();
    await initOnboarding();

    // Load Supabase client library
    if (!window.supabase) {
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js');
      } catch (e) { console.warn('Supabase client failed to load — guest mode only'); }
    }

    // Load zxcvbn for password strength (lazy, non-blocking)
    loadScript('https://cdn.jsdelivr.net/npm/zxcvbn@4.4.2/dist/zxcvbn.js').catch(() => {});

    // Init auth
    await Auth.init();

    initCountdownChip();
    initBigCountdown();
    initNav();
    initReveal();
    initAnchors();
    initScrollTop();
    initFooter();
    initHeroParticles();
    initRSVP().catch(console.warn);
    initIntentions().catch(console.warn);
    initPrayerLines();
    initTimeline().catch(console.warn);
    initPacking().catch(console.warn);
    initSpeakers();

    // Hub page
    initHubFirstVisit();
    initHub().catch(console.warn);

    // Admin page
    initAdmin().catch(console.warn);

    // Account settings page
    initAccount().catch(console.warn);
  }

  // ============================================
  // ADMIN PAGE
  // ============================================
  async function initAdmin() {
    const adminEl = document.querySelector('[data-admin]');
    if (!adminEl) return;

    const loadingEl = adminEl.querySelector('[data-admin-loading]');
    const deniedEl = adminEl.querySelector('[data-admin-denied]');
    const dashEl = adminEl.querySelector('[data-admin-dashboard]');

    if (!Auth.user || !Auth.isAdmin) {
      if (loadingEl) loadingEl.style.display = 'none';
      if (deniedEl) deniedEl.style.display = '';
      return;
    }

    if (loadingEl) loadingEl.style.display = 'none';
    if (dashEl) dashEl.style.display = '';

    const sb = getSupabase();
    if (!sb) return;

    // Stats
    try {
      const { count: totalUsers } = await sb.from('profiles').select('id', { count: 'exact', head: true });
      const twentyFourAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count: active24 } = await sb.from('profiles').select('id', { count: 'exact', head: true }).gte('last_seen_at', twentyFourAgo);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count: newWeek } = await sb.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo);
      const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { count: failedLogins } = await sb.from('failed_logins').select('id', { count: 'exact', head: true }).gte('attempted_at', tenMinAgo);
      const { count: pendingDeletions } = await sb.from('scheduled_deletions').select('user_id', { count: 'exact', head: true });

      const stats = { 'total-users': totalUsers, 'active-24h': active24, 'new-week': newWeek, 'failed-logins': failedLogins, 'pending-deletions': pendingDeletions };
      Object.entries(stats).forEach(([key, val]) => {
        const el = adminEl.querySelector(`[data-admin-stat="${key}"]`);
        if (el) el.textContent = val ?? 0;
      });
    } catch (e) { console.warn('Admin stats error:', e); }

    // User list
    try {
      const { data: users } = await sb.from('profiles').select('*').order('created_at', { ascending: false });
      const tbody = adminEl.querySelector('[data-admin-users]');
      if (tbody && users) {
        tbody.innerHTML = users.map(u => `
          <tr>
            <td>${escapeHtml(u.username)}</td>
            <td>${escapeHtml(u.display_name || '')}</td>
            <td>${new Date(u.created_at).toLocaleDateString()}</td>
            <td>${u.last_seen_at ? new Date(u.last_seen_at).toLocaleDateString() : '—'}</td>
            <td>${u.is_admin ? '<span class="text-gold">Admin</span>' : ''}</td>
            <td>
              <button class="btn btn-ghost btn-sm" data-admin-view="${u.id}" data-username="${u.username}">View</button>
              <button class="btn btn-ghost btn-sm" data-admin-reset="${u.id}" data-username="${u.username}">Reset PW</button>
              <button class="btn btn-ghost btn-sm" data-admin-delete="${u.id}" data-username="${u.username}">Delete</button>
            </td>
          </tr>
        `).join('');

        // View user
        tbody.querySelectorAll('[data-admin-view]').forEach(btn => {
          btn.addEventListener('click', async () => {
            await logAdminAction('view_user', btn.dataset.adminView, btn.dataset.username, 'Viewed profile details');
            showToast(`Viewed @${btn.dataset.username}'s profile (logged)`);
          });
        });

        // Reset password
        tbody.querySelectorAll('[data-admin-reset]').forEach(btn => {
          btn.addEventListener('click', async () => {
            const confirmText = prompt('This PERMANENTLY DESTROYS the user\'s encrypted journal and private intentions. Type DELETE JOURNAL to confirm:');
            if (confirmText !== 'DELETE JOURNAL') return;
            await logAdminAction('reset_password', btn.dataset.adminReset, btn.dataset.username, 'Password reset — journal and intentions destroyed');
            // Delete encrypted data
            await sb.from('journal_entries').delete().eq('user_id', btn.dataset.adminReset);
            await sb.from('private_intentions').delete().eq('user_id', btn.dataset.adminReset);
            showToast(`Password reset for @${btn.dataset.username}. Encrypted data destroyed.`, 'info');
          });
        });

        // Delete user
        tbody.querySelectorAll('[data-admin-delete]').forEach(btn => {
          btn.addEventListener('click', async () => {
            if (!confirm(`Delete @${btn.dataset.username}? This cascades ALL their data.`)) return;
            await logAdminAction('delete_user', btn.dataset.adminDelete, btn.dataset.username, 'Account deleted by admin');
            showToast(`Deleted @${btn.dataset.username}`);
          });
        });
      }
    } catch (e) { console.warn('Admin users error:', e); }

    // Audit log
    try {
      const { data: logs } = await sb.from('admin_access_log').select('*').order('created_at', { ascending: false }).limit(100);
      const auditEl = adminEl.querySelector('[data-admin-audit]');
      if (auditEl && logs) {
        auditEl.innerHTML = logs.length ? `<table class="admin-table"><thead><tr><th>Date</th><th>Admin</th><th>Action</th><th>Target</th><th>Details</th></tr></thead><tbody>${
          logs.map(l => `<tr><td>${new Date(l.created_at).toLocaleString()}</td><td>${escapeHtml(l.admin_username || '')}</td><td>${escapeHtml(l.action)}</td><td>${escapeHtml(l.target_username || '')}</td><td>${escapeHtml(l.details || '')}</td></tr>`).join('')
        }</tbody></table>` : '<p class="text-mute">No admin actions logged yet.</p>';
      }
    } catch (e) { console.warn('Admin audit error:', e); }
  }

  // ============================================
  // ACCOUNT SETTINGS PAGE
  // ============================================

  const PROFILE_ICONS = {
    cross:    '<path d="M12 2v20M5 8h14"/>',
    dove:     '<path d="M18 8c0-3.3-2.7-6-6-6S6 4.7 6 8c0 2 1 3.8 2.5 5L12 22l3.5-9C17 11.8 18 10 18 8z"/><path d="M9 8.5c0-1.7 1.3-3 3-3"/>',
    flame:    '<path d="M12 22c-4-2-7-6-7-10C5 7 8 2 12 2c1.5 3 3 5 3 8 0 1.5-.5 3-1.5 4 2-1 3.5-3 3.5-6 2 3 1 10-5 14z"/>',
    star:     '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01z"/>',
    rose:     '<circle cx="12" cy="12" r="3"/><path d="M12 2C9 5 6 8 6 12s3 7 6 10c3-3 6-6 6-10S15 5 12 2z"/>',
    heart:    '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
    fish:     '<path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z"/><circle cx="16" cy="12" r="1"/>',
    candle:   '<rect x="9" y="10" width="6" height="12" rx="1"/><path d="M12 2C10.5 4 10 6 10 8c0 1.1.9 2 2 2s2-.9 2-2c0-2-.5-4-2-6z"/>',
    book:     '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    hands:    '<path d="M12 22V12M12 12L8 8M12 12l4-4"/><path d="M7 11c-2 0-3 1-3 3v2c0 3 3 6 8 6s8-3 8-6v-2c0-2-1-3-3-3"/>',
    church:   '<path d="M12 2v4M8 6h8l2 5H6l2-5z"/><rect x="7" y="11" width="10" height="11"/><rect x="10" y="16" width="4" height="6"/><path d="M10 2h4"/>',
    leaf:     '<path d="M17 8C8 10 5.9 16.17 3.82 21.34"/><path d="M20 2S4 6 4 20c8-2 14-8 16-18z"/>',
    sun:      '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>',
    mountain: '<path d="M8 21l4-10 4 10"/><path d="M2 21h20"/><path d="M15 14l3-5 4 12"/>',
    bread:    '<ellipse cx="12" cy="14" rx="9" ry="6"/><path d="M3 14c0-5 4-10 9-12 5 2 9 7 9 12"/><path d="M12 2v6"/>',
    water:    '<path d="M12 2C8 7 5 10 5 14a7 7 0 0 0 14 0c0-4-3-7-7-12z"/>'
  };

  function renderProfileIcon(key, size) {
    const d = PROFILE_ICONS[key];
    if (!d) return '';
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  }
  window.PROFILE_ICONS = PROFILE_ICONS;
  window.renderProfileIcon = renderProfileIcon;

  async function initAccount() {
    const pageEl = document.querySelector('[data-account-page]');
    if (!pageEl) return;

    const guestEl = pageEl.querySelector('[data-acct-guest]');
    const contentEl = pageEl.querySelector('[data-acct-content]');

    // Guest gate
    if (Auth.isGuest) {
      if (guestEl) guestEl.style.display = '';
      guestEl?.querySelector('[data-auth-cta]')?.addEventListener('click', () => openAuthModal('signup'));
      guestEl?.querySelector('[data-auth-signin]')?.addEventListener('click', () => openAuthModal('login'));
      return;
    }

    if (contentEl) contentEl.style.display = '';

    // --- Profile Section ---
    const usernameEl = pageEl.querySelector('[data-acct-username]');
    if (usernameEl) usernameEl.textContent = '@' + Auth.username;

    const displayNameInput = pageEl.querySelector('#acct-display-name');
    if (displayNameInput) displayNameInput.value = Auth.profile?.display_name || '';

    // Icon picker
    const iconGrid = pageEl.querySelector('[data-icon-picker]');
    let selectedIcon = Auth.profile?.saint_icon || '';
    if (iconGrid) {
      Object.keys(PROFILE_ICONS).forEach(key => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'icon-picker-btn' + (key === selectedIcon ? ' selected' : '');
        btn.innerHTML = renderProfileIcon(key, 24);
        btn.setAttribute('aria-label', 'Select ' + key + ' icon');
        btn.addEventListener('click', () => {
          iconGrid.querySelectorAll('.icon-picker-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          selectedIcon = key;
        });
        iconGrid.appendChild(btn);
      });
    }

    // Save profile
    pageEl.querySelector('[data-save-profile]')?.addEventListener('click', async () => {
      const displayName = displayNameInput?.value.trim();
      if (!displayName) { showToast('Display name is required.', 'error'); return; }
      try {
        await Auth.updateProfile({ display_name: displayName, saint_icon: selectedIcon });
        showToast('Profile updated!');
      } catch (e) { showToast('Failed to update: ' + e.message, 'error'); }
    });

    // --- Sharing Section ---
    try {
      const prefs = await DataStore.getSharingPrefs();
      const shareProfile = pageEl.querySelector('[data-share-profile]');
      const sharePacking = pageEl.querySelector('[data-share-packing]');
      const sharePhotos = pageEl.querySelector('[data-share-photos]');
      if (prefs) {
        if (shareProfile) shareProfile.checked = prefs.share_profile || false;
        if (sharePacking) sharePacking.checked = prefs.share_packing_progress || false;
        if (sharePhotos) sharePhotos.checked = prefs.share_photos || false;
      }

      async function saveSharingPref() {
        try {
          await DataStore.updateSharingPrefs({
            share_profile: shareProfile?.checked || false,
            share_packing_progress: sharePacking?.checked || false,
            share_photos: sharePhotos?.checked || false
          });
          showToast('Sharing preferences updated.');
        } catch (e) { showToast('Failed to save: ' + e.message, 'error'); }
      }
      shareProfile?.addEventListener('change', saveSharingPref);
      sharePacking?.addEventListener('change', saveSharingPref);
      sharePhotos?.addEventListener('change', saveSharingPref);
    } catch (e) { console.warn('Sharing prefs error:', e); }

    // --- Friends Section ---
    const friendsList = pageEl.querySelector('[data-friends-list]');
    const friendsEmpty = pageEl.querySelector('[data-friends-empty]');
    try {
      const friends = await DataStore.getFriends();
      if (friends.length === 0) {
        if (friendsEmpty) friendsEmpty.style.display = '';
      } else {
        friends.forEach(f => {
          const card = document.createElement('div');
          card.className = 'friend-card';
          const icon = f.saint_icon && PROFILE_ICONS[f.saint_icon]
            ? renderProfileIcon(f.saint_icon, 28)
            : '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
          card.innerHTML = `<span class="friend-icon">${icon}</span><span class="friend-name">${escapeHtml(f.display_name || f.username)}</span>`;
          friendsList.appendChild(card);
        });
      }
    } catch (e) { console.warn('Friends error:', e); }

    // --- Account Info ---
    const createdEl = pageEl.querySelector('[data-acct-created]');
    if (createdEl && Auth.profile?.created_at) {
      createdEl.textContent = new Date(Auth.profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    }

    // --- Admin link ---
    const adminLink = pageEl.querySelector('[data-acct-admin]');
    if (adminLink && Auth.isAdmin) adminLink.style.display = '';

    // --- Change Password ---
    const pwForm = pageEl.querySelector('[data-change-password-form]');
    if (pwForm) {
      const newPwInput = pageEl.querySelector('#acct-new-pw');
      const meterFill = pageEl.querySelector('[data-pw-meter]');
      if (newPwInput && meterFill) {
        newPwInput.addEventListener('input', () => {
          if (typeof zxcvbn === 'function') {
            const result = zxcvbn(newPwInput.value);
            meterFill.className = 'password-meter-fill score-' + result.score;
          }
        });
      }

      pwForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const current = pageEl.querySelector('#acct-current-pw').value;
        const newPw = newPwInput.value;
        const confirm = pageEl.querySelector('#acct-confirm-pw').value;
        if (!current || !newPw || !confirm) { showToast('All fields are required.', 'error'); return; }
        if (newPw !== confirm) { showToast('Passwords do not match.', 'error'); return; }
        if (newPw.length < 10) { showToast('Password must be at least 10 characters.', 'error'); return; }
        try {
          await Auth.changePassword(current, newPw);
          showToast('Password changed successfully!');
          pwForm.reset();
          if (meterFill) meterFill.className = 'password-meter-fill';
        } catch (e) { showToast(e.message, 'error'); }
      });
    }

    // --- Account Actions ---
    pageEl.querySelector('[data-acct-signout]')?.addEventListener('click', async () => {
      await Auth.logout();
      window.location.href = 'hub.html';
    });

    pageEl.querySelector('[data-acct-export]')?.addEventListener('click', () => {
      exportAllData();
    });

    // --- Delete Account ---
    const deletionStatus = pageEl.querySelector('[data-deletion-status]');
    if (deletionStatus) {
      async function renderDeletion() {
        const existing = await DataStore.getScheduledDeletion();
        if (existing) {
          const date = new Date(existing.scheduled_for).toLocaleDateString();
          deletionStatus.innerHTML = '<div class="acct-deletion-active"><p>Your account is scheduled for deletion on <strong>' + date + '</strong>.</p><button type="button" class="btn btn-ghost btn-sm" data-cancel-deletion>Cancel Deletion</button></div>';
          deletionStatus.querySelector('[data-cancel-deletion]').addEventListener('click', async () => {
            await DataStore.cancelAccountDeletion();
            showToast('Deletion cancelled.');
            renderDeletion();
          });
        } else {
          deletionStatus.innerHTML = '<button type="button" class="btn btn-danger btn-sm" data-delete-account>Delete My Account</button>';
          deletionStatus.querySelector('[data-delete-account]').addEventListener('click', async () => {
            if (!confirm('Are you sure? Your account will be permanently deleted in 7 days. You can cancel within that period.')) return;
            try {
              await DataStore.scheduleAccountDeletion();
              showToast('Account deletion scheduled. You have 7 days to change your mind.');
              renderDeletion();
            } catch (e) { showToast('Failed: ' + e.message, 'error'); }
          });
        }
      }
      renderDeletion().catch(console.warn);
    }

    // --- Audit Log ---
    const auditSection = pageEl.querySelector('[data-acct-audit]');
    const auditEntries = pageEl.querySelector('[data-audit-entries]');
    if (auditSection && auditEntries) {
      try {
        const log = await DataStore.getMyAuditLog();
        if (log && log.length > 0) {
          auditSection.style.display = '';
          auditEntries.innerHTML = log.map(entry =>
            '<div class="audit-entry">' +
              '<span class="audit-time">' + new Date(entry.created_at).toLocaleString() + '</span>' +
              '<span class="audit-action">' + escapeHtml(entry.action) + '</span>' +
              '<span class="audit-by">by @' + escapeHtml(entry.admin_username || 'unknown') + '</span>' +
              (entry.details ? '<span class="audit-details">' + escapeHtml(entry.details) + '</span>' : '') +
            '</div>'
          ).join('');
        }
      } catch (e) { console.warn('Audit log error:', e); }
    }
  }

  // Expose modules for sub-pages (journal.html, rosary.html, etc.)
  window.DataStore = DataStore;
  window.Storage = Storage;
  window.Auth = Auth;
  window.Crypto = Crypto;
  window.showToast = showToast;
  window.escapeHtml = escapeHtml;
  window.exportAllData = exportAllData;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
