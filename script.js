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
    departPT:  new Date('2026-05-16T04:00:00-07:00'),
    returnPT:  new Date('2026-05-17T18:45:00-07:00'), // ~6:45 PM
    label:     'May 16–17, 2026'
  };

  // SVG icon map — replaces emoji throughout the site
  const ICONS = {
    crucifix: '<img src="public/icons/crucifix-64.png" alt="Crucifix">',
    flame:    '<img src="public/icons/flame-64.png" alt="Holy Spirit Flame">',
    dove:     '<img src="public/icons/dove-64.png" alt="Holy Spirit Dove">',
    michael:  '<img src="public/icons/michael-64.png" alt="St. Michael">',
    mary:     '<img src="public/icons/mary-64.png" alt="Virgin Mary">',
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
    openBtn.addEventListener('click', () => {
      if (sheet.classList.contains('open')) close();
      else open();
    });
    closeBtns.forEach(btn => btn.addEventListener('click', close));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { close(); closeSched(); }
    });

    // --- Mobile top bar profile ---
    $$('[data-mtop-profile]').forEach(el => {
      if (!Auth.isGuest && Auth.displayName) {
        const name = Auth.displayName;
        el.textContent = name.charAt(0).toUpperCase();
        el.href = 'account.html';
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

    async function fetchRSVP() {
      const sb = getSupabase();
      if (sb) {
        try {
          const { data } = await sb.from('rsvp_wall').select('*').order('created_at', { ascending: true });
          if (data) return data.map(r => ({ name: r.name, icon: r.saint_icon }));
        } catch (e) { console.warn('RSVP fetch error:', e); }
      }
      return Storage._lsGet('rsvp:attendees', []);
    }

    async function render() {
      const list = await fetchRSVP();
      wall.innerHTML = '';
      if (!list.length) {
        wall.innerHTML = '<div class="wall-empty">Be the first to say <em>I\'m going</em> →</div>';
        return;
      }
      list.slice().reverse().forEach((it, i) => {
        const el = document.createElement('div');
        el.className = 'wall-item';
        el.style.animationDelay = (i * 60) + 'ms';
        el.innerHTML = `<span class="icon">${ICONS[it.icon] || ICONS.crucifix}</span><span>${escapeHTML(it.name)}</span>`;
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

      const sb = getSupabase();
      if (sb) {
        try {
          const { error: err } = await sb.from('rsvp_wall').insert({ name, saint_icon: selectedIcon });
          if (err) throw err;
        } catch (e) {
          console.warn('RSVP insert error:', e);
          error.textContent = 'Something went wrong. Please try again.';
          return;
        }
      } else {
        const list = Storage._lsGet('rsvp:attendees', []);
        list.push({ name, icon: selectedIcon, timestamp: Date.now() });
        Storage._lsSet('rsvp:attendees', list);
      }
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

    async function fetchIntentions() {
      const sb = getSupabase();
      if (sb) {
        try {
          const { data } = await sb.from('shared_intentions').select('*').order('created_at', { ascending: true });
          if (data) return data.map(r => ({ text: r.intention }));
        } catch (e) { console.warn('Intentions fetch error:', e); }
      }
      return Storage._lsGet('intentions:list', []);
    }

    async function render() {
      if (cancelPhysics) { cancelPhysics(); cancelPhysics = null; }
      const list = await fetchIntentions();
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

      const sb = getSupabase();
      if (sb) {
        try {
          const { error: err } = await sb.from('shared_intentions').insert({ intention: text });
          if (err) throw err;
        } catch (e) {
          console.warn('Intention insert error:', e);
          error.textContent = 'Something went wrong. Please try again.';
          return;
        }
      } else {
        const list = Storage._lsGet('intentions:list', []);
        list.push({ text, timestamp: Date.now() });
        Storage._lsSet('intentions:list', list);
      }
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
  let STOPS = [
    // ── Saturday ──
    { id: 1,  day: 'sat', time: '03:45',
      title: 'Meet at St. Juan Diego — Cowiche',
      addr:  '15800 Summitview Rd, Cowiche, WA 98923',
      map:   'https://www.google.com/maps/search/?api=1&query=St.+Juan+Diego+Catholic+Church+15800+Summitview+Rd+Cowiche+WA',
      body:  'Meet at our home parish. Morning prayer, roll call, load vehicles, final restroom break before the road. Please arrive on time — we leave together.',
      bring: 'Everything you packed. Coffee optional but recommended.'
    },
    { id: 2,  day: 'sat', time: '04:00',
      title: 'Depart Cowiche',
      body:  'Route: Summitview Rd → I-82 W → I-90 W → I-405 N → Meydenbauer Center. ~145 miles, ~2h 30m clean drive time.',
    },
    { id: 3,  day: 'sat', time: '05:00',
      title: 'Rest stop — Pilot Travel Center, Ellensburg',
      addr:  '1307 N Dolarway Rd, Ellensburg, WA 98926',
      map:   'https://www.google.com/maps/search/?api=1&query=Pilot+Travel+Center+1307+N+Dolarway+Rd+Ellensburg+WA',
      body:  '15 minutes — restroom, gas, coffee, stretch, regroup the caravan before Snoqualmie Pass.',
    },
    { id: 4,  day: 'sat', time: '06:30',
      title: 'Arrive Meydenbauer Center',
      addr:  '11100 NE 6th St, Bellevue, WA',
      map:   'https://www.google.com/maps/search/?api=1&query=Meydenbauer+Center+Bellevue+WA',
      body:  'Park in the underground garage. Walk in together, check in, find seats as a group near the front if possible.',
    },
    { id: 5,  day: 'sat', time: '07:00',
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
      title: 'Lunch — Sizzle & Crunch (Bellevue)',
      addr:  '10438 NE 10th St, Bellevue, WA 98004',
      map:   'https://maps.app.goo.gl/vEBRvnJ8wkT8PeFXA',
      body:  'Vietnamese fast-casual right by Meydenbauer — banh mi, vermicelli bowls, rice plates. ~5 min walk from the venue. Quick service that fits the lunch break. Anyone who would rather splurge on Din Tai Fung at Lincoln Square (700 Bellevue Way NE, right across the street) can do that instead — but Din Tai Fung is on you, not the group; the group is only covering Sizzle & Crunch.',
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
    { id: 18, day: 'sat', time: '20:30',
      title: 'Group dinner — Chick-fil-A (Alderwood)',
      addr:  '3026 196th St SW, Lynnwood, WA 98036',
      map:   'https://maps.app.goo.gl/h5tcqENQ6LM7pUkm9',
      body:  'Dinner together at Chick-fil-A — ~5 min from the hotel. Quick service so we can be back early; Latin Mass is early Sunday morning.',
    },
    { id: 19, day: 'sat', time: '23:00',
      title: 'Lights out',
      body:  'Latin Mass is early tomorrow. Rest well.',
    },
    // ── Sunday ──
    { id: 20, day: 'sun', time: '05:00',
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
      body:  'The 7:00 AM Low Mass at North American Martyrs, served by the FSSP. Please arrive by 6:40 to get booklets and find seats.',
    },
    { id: 23, day: 'sun', time: '08:15',
      title: 'Group photo outside church',
      body:  'Mass ends around 8:00. Quick photo on the steps before we head back to the hotel together.',
    },
    { id: 24, day: 'sun', time: '08:30',
      title: 'Head back to La Quinta',
      body:  '~15 min back to the hotel together.',
    },
    { id: 25, day: 'sun', time: '08:45',
      title: 'Hotel block — breakfast or chill',
      addr:  '4300 Alderwood Mall Blvd, Lynnwood, WA 98036',
      map:   'https://www.google.com/maps/search/?api=1&query=La+Quinta+Inn+Lynnwood+4300+Alderwood+Mall+Blvd',
      body:  'Two options, your call: come grab breakfast at Kona Kitchen with the group, or stay at the hotel to rest, pack, and chill until checkout. Either way we regroup at the hotel by 10:30 to load up and head out together.',
    },
    { id: 26, day: 'sun', time: '09:00',
      title: 'Breakfast — Kona Kitchen Lynnwood (optional)',
      addr:  '3805 196th St SW, Lynnwood, WA 98036',
      map:   'https://www.google.com/maps/search/?api=1&query=Kona+Kitchen+Lynnwood+3805+196th+St+SW',
      body:  'Hawaiian breakfast — loco moco, spam musubi, pancakes, fried rice. ~5 min from the hotel. The group still covers it for anyone who comes. Back to the hotel by 10:15 to regroup.',
    },
    { id: 27, day: 'sun', time: '10:30',
      title: 'Checkout & regroup',
      body:  'Everyone meets back at the hotel. Final checkout, load the vehicles, head out together.',
    },
    { id: 28, day: 'sun', time: '10:45',
      title: 'Depart → Gas Works Park',
      body:  '~25–30 min south on I-5. Sunday morning traffic is light.',
    },
    { id: 29, day: 'sun', time: '11:15',
      title: 'Gas Works Park',
      addr:  '2101 N Northlake Way, Seattle, WA 98103',
      map:   'https://www.google.com/maps/search/?api=1&query=Gas+Works+Park+Seattle+WA',
      body:  'Iconic Seattle skyline views from the north shore of Lake Union. Walk around, take photos. ~20 min.',
    },
    { id: 30, day: 'sun', time: '11:35',
      title: 'Depart → St. James Cathedral',
      body:  '~10–15 min south via I-5. Downtown Seattle.',
    },
    { id: 31, day: 'sun', time: '11:50',
      title: 'St. James Cathedral',
      addr:  '804 9th Ave, Seattle, WA 98104',
      map:   'https://www.google.com/maps/search/?api=1&query=St.+James+Cathedral+Seattle',
      body:  'Visit, prayer, light candles. Mother church of the Archdiocese of Seattle. ~30 min.',
    },
    { id: 32, day: 'sun', time: '12:20',
      title: 'Depart → Pike Place Market PDA Garage',
      body:  '~5–10 min west to 1531 Western Ave. Direct elevator up to MarketFront.',
    },
    { id: 33, day: 'sun', time: '12:35',
      title: 'Pike Place — food + a walk',
      addr:  '1531 Western Ave, Seattle, WA 98101 (Pike Place Market PDA Garage)',
      map:   'https://www.google.com/maps/search/?api=1&query=Pike+Place+Market+PDA+Garage+1531+Western+Ave',
      body:  'Short visit — just enough time to grab lunch at Pike Place and take a quick walk through the Market and the Overlook Walk. Your small group picks where to eat near Pike Place; lunch is on you. Plan to be back at the garage by 1:50 so we can head over to Bellevue.',
    },
    { id: 34, day: 'sun', time: '14:00',
      title: 'Depart → Bellevue Square',
      body:  '~25 min east across I-90 to Bellevue.',
    },
    { id: 35, day: 'sun', time: '14:30',
      title: 'Bellevue Square — own time in small groups',
      addr:  '575 Bellevue Square, Bellevue, WA 98004',
      map:   'https://www.google.com/maps/search/?api=1&query=Bellevue+Square+Bellevue+WA',
      body:  'Hang out, shop, grab coffee — small groups do their own thing around Bellevue Square and the surrounding area. ~2 hours. Meet back at the cars by 4:30 sharp to head home.',
    },
    { id: 36, day: 'sun', time: '16:30',
      title: 'Depart for Cowiche',
      body:  'I-90 E → I-82 E → Summitview Rd. ~2h 30m to St. Juan Diego.',
    },
    { id: 37, day: 'sun', time: '19:00',
      title: 'Arrive home — Deo gratias',
      body:  'What a weekend. See you at Sunday YAG.',
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
    const root = $('[data-timeline-list]');
    if (!root) return;

    // Fetch live stops from Supabase; fall back to hardcoded STOPS
    try {
      const sb = getSupabase();
      if (sb) {
        const { data, error } = await sb
          .from('stops')
          .select('*')
          .order('sort_order', { ascending: true });
        if (!error && data && data.length > 0) {
          STOPS = data;
        }
      }
    } catch (e) {
      console.warn('Timeline: Supabase fetch failed, using fallback', e);
    }

    const list = $('[data-timeline-list]');
    const banner = $('[data-timeline-banner]');
    const bannerCountdown = $('[data-banner-countdown]');
    const option = 'A'; // Option A is confirmed

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
            ${stop.places ? `<ul class="stop-places">${stop.places.map(p =>
              `<li><a href="${p.url}" target="_blank" rel="noopener">${escapeHTML(p.name)}</a><span class="text-dim"> — ${escapeHTML(p.desc)}${p.walk ? ' · ' + escapeHTML(p.walk) : ''}</span></li>`
            ).join('')}</ul>` : ''}
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
          <p class="text-mute" style="font-size:1rem; margin-top:0.5rem;">Times below reflect Option ${option} · ${option === 'A' ? 'With Confession &amp; Adoration' : 'Without Confession &amp; Adoration'}</p>
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

    render();
    setInterval(render, 30000); // refresh every 30s for relative labels / state transitions

    // live banner countdown (every second)
    setInterval(() => {
      const el = $('[data-banner-countdown]');
      const now = new Date();
      if (el && now < TRIP.departPT) {
        el.textContent = formatCompact(TRIP.departPT - now);
      }
    }, 1000);

    // --- Day-jump sticky toggle: auto-switch on scroll ---
    const jumpBar = document.querySelector('.day-jump');
    if (jumpBar) {
      const jumpBtns = Array.from(jumpBar.querySelectorAll('.day-jump-btn'));
      const jumpIndicator = jumpBar.querySelector('.day-jump-indicator');
      let activeDay = 'saturday';
      let scrollLock = false;

      function getNavOffset() {
        const mtop = document.querySelector('.mtop');
        const nav = document.querySelector('.nav');
        // Use offsetHeight > 0 (not offsetParent) — fixed-position elements have null offsetParent
        const navH = (mtop && mtop.offsetHeight > 0) ? mtop.offsetHeight
                   : (nav && nav.offsetHeight > 0) ? nav.offsetHeight : 0;
        return navH + jumpBar.offsetHeight + 16;
      }

      function setActiveDay(day, doScroll) {
        if (activeDay === day && !doScroll) return;
        activeDay = day;
        const idx = day === 'sunday' ? 1 : 0;
        jumpBtns.forEach(b => b.classList.remove('active'));
        jumpBtns[idx].classList.add('active');
        if (jumpIndicator) jumpIndicator.style.transform = `translateX(${idx * 100}%)`;

        if (doScroll) {
          const target = document.getElementById('timeline-' + day);
          if (!target) return;
          const top = target.getBoundingClientRect().top + window.scrollY - getNavOffset();
          scrollLock = true;
          window.scrollTo({ top: Math.max(0, top), behavior: prefersReduced() ? 'auto' : 'smooth' });
          setTimeout(() => { scrollLock = false; }, 900);
        }
      }

      jumpBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const day = btn.dataset.jump || (jumpBtns.indexOf(btn) === 0 ? 'saturday' : 'sunday');
          setActiveDay(day, true);
        });
      });

      let ticking = false;
      window.addEventListener('scroll', () => {
        if (scrollLock || ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const sun = document.getElementById('timeline-sunday');
          if (sun) {
            const threshold = getNavOffset() + 24;
            const day = sun.getBoundingClientRect().top <= threshold ? 'sunday' : 'saturday';
            if (day !== activeDay) setActiveDay(day, false);
          }
          ticking = false;
        });
      }, { passive: true });
    }
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
  // 18b-1. Jump-to-section dropdown (all sub-pages)
  // -------------------------------------------------------
  function initJumpNav() {
    const jumpNav = document.querySelector('.hub-jumpnav');
    if (!jumpNav) return;
    const jumpBtn = jumpNav.querySelector('.hub-jumpnav-btn');
    if (!jumpBtn) return;

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

  // -------------------------------------------------------
  // 18b-2. Section jump nav (Saturday/Sunday pages)
  // -------------------------------------------------------
  function initSectionJump() {
    const nav = document.querySelector('.section-jump');
    if (!nav) return;
    const btns = Array.from(nav.querySelectorAll('.section-jump-btn'));
    const track = nav.querySelector('.section-jump-track');
    let scrollLock = false;

    function getOffset() {
      const mtop = document.querySelector('.mtop');
      const navEl = document.querySelector('.nav');
      // Use offsetHeight > 0 (not offsetParent) — fixed-position elements have null offsetParent
      const navH = (mtop && mtop.offsetHeight > 0) ? mtop.offsetHeight
                 : (navEl && navEl.offsetHeight > 0) ? navEl.offsetHeight : 0;
      return navH + nav.offsetHeight + 12;
    }

    function setActive(btn) {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // Scroll the pill into view within the track (horizontal only — never scrollIntoView
      // on sticky children, it yanks the whole page to the element's natural position)
      const left = btn.offsetLeft - track.offsetWidth / 2 + btn.offsetWidth / 2;
      track.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
    }

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.jumpTo;
        const target = document.getElementById(id);
        if (!target) return;
        setActive(btn);
        scrollLock = true;
        const top = target.getBoundingClientRect().top + window.scrollY - getOffset();
        window.scrollTo({ top: Math.max(0, top), behavior: prefersReduced() ? 'auto' : 'smooth' });
        setTimeout(() => { scrollLock = false; }, 900);
      });
    });

    // Auto-highlight on scroll
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (scrollLock || ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const threshold = getOffset() + 40;
        let active = btns[0];
        for (const btn of btns) {
          const section = document.getElementById(btn.dataset.jumpTo);
          if (section && section.getBoundingClientRect().top <= threshold) {
            active = btn;
          }
        }
        if (!active.classList.contains('active')) setActive(active);
        ticking = false;
      });
    }, { passive: true });
  }

  // -------------------------------------------------------
  // 18c. Scroll to top button
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
      const rosaryProgress = document.querySelector('#pray-active .progress-bar-wrap');
      if (rosaryProgress && rosaryProgress.offsetParent !== null) {
        const y = rosaryProgress.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: Math.max(0, y), behavior: prefersReduced() ? 'auto' : 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: prefersReduced() ? 'auto' : 'smooth' });
      }
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
  // 20. Onboarding — redirect first-time visitors to guide.html
  //     The guide itself lives in guide.html so the copy is easy
  //     to edit without touching JavaScript.
  // -------------------------------------------------------
  function detectStandaloneInstall() {
    try {
      const standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
        || window.navigator.standalone === true;
      if (standalone) localStorage.setItem('app:installed', 'true');
    } catch (e) { /* no-op */ }
  }

  async function initOnboarding() {
    detectStandaloneInstall();
    const done = await Storage.get('onboarding:complete', false);
    if (done) return;

    const path = (location.pathname || '').toLowerCase();
    if (path.endsWith('/guide.html') || path.endsWith('guide.html')) return;
    if (path.endsWith('/parents.html') || path.endsWith('parents.html')) return;

    location.replace('guide.html');
  }

  // ============================================
  // SUPABASE CONFIG
  // ============================================
  const SUPABASE_URL = 'https://iisgwprvkzbwkeuygvlz.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlpc2d3cHJ2a3pid2tldXlndmx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NjUwMjksImV4cCI6MjA5MTM0MTAyOX0.rKo2mRJVfNihvF9re04dKCzUr-GaSuzeWr6a0D0Ltnw';
  const TURNSTILE_SITE_KEY = '0x4AAAAAAC3B7AbNZ6C3qQ-9';
  const BOOTSTRAP_ADMIN_USERNAME = 'alex';
  const SOURCE_CODE_URL = 'https://github.com/ragerbanjoo/ascend';
  const PBKDF2_ITERATIONS = 250000; // (unused — legacy)

  // Supabase client (lazy-loaded)
  let _supabase = null;
  function getSupabase() {
    if (_supabase) return _supabase;
    if (typeof window.supabase === 'undefined') return null;
    _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return _supabase;
  }

  // ============================================
  // CRYPTO MODULE — retained as a no-op shim.
  // The site used to client-side-encrypt journal, intentions, and private
  // photos. Those flows are gone (privacy is now enforced by Supabase RLS).
  // The shim keeps any stray references compiling without re-introducing
  // crypto state, recovery phrases, or session keys.
  // ============================================
  const Crypto = {
    get hasCEK() { return false; },
    clearCEK() {},
    async restoreCEK() { return false; }
  };

  // ============================================
  // AUTH MODULE
  // ============================================
  const Auth = {
    _user: null,
    _profile: null,
    _listeners: [],
    _initialized: false,

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
      if (!sb) { this._initialized = true; return; }

      const { data: { session } } = await sb.auth.getSession();
      if (session?.user) {
        this._user = session.user;
        await this._loadProfile();
        // If auth exists but profile is missing (broken signup), sign out
        if (!this._profile) {
          console.warn('Auth session exists but no profile found — signing out broken account');
          this._user = null;
          await sb.auth.signOut();
          return;
        }
        await this._updateLastSeen();
        await Crypto.restoreCEK();
      }

      this._initialized = true;

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

      const uname = username.toLowerCase().trim();
      if (!/^[a-z0-9_]{3,20}$/.test(uname)) throw new Error('Username must be 3-20 chars, lowercase letters, numbers, and underscores only');
      if (await this.checkUsernameTaken(uname)) throw new Error('Username is already taken');

      // Supabase auth requires an email; we synthesize one from the username.
      const email = `${uname}@pilgrim.sjdyag.com`;
      let authData;
      const { data: signUpData, error: authError } = await sb.auth.signUp({ email, password });
      if (authError) {
        if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
          const { data: signInData, error: signInErr } = await sb.auth.signInWithPassword({ email, password });
          if (signInErr) throw new Error('Username was previously used. Please choose a different username.');
          authData = signInData;
        } else {
          throw new Error(authError.message);
        }
      } else {
        authData = signUpData;
      }

      const { error: profileError } = await sb.from('profiles').insert({
        id: authData.user.id,
        username: uname,
        display_name: uname
      });
      if (profileError) {
        await sb.auth.signOut();
        throw new Error(profileError.message);
      }

      await sb.from('sharing_preferences').insert({ user_id: authData.user.id });

      this._user = authData.user;
      await this._loadProfile();
      this._notify();

      return { user: authData.user };
    },

    async login(username, password) {
      const sb = getSupabase();
      if (!sb) throw new Error('Supabase not configured');

      const uname = username.toLowerCase().trim();

      if (await this.checkRateLimited(uname)) {
        throw new Error('Account temporarily locked. Try again in 15 minutes.');
      }

      const email = `${uname}@pilgrim.sjdyag.com`;
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) {
        await this.recordFailedLogin(uname);
        throw new Error('Invalid username or password');
      }

      this._user = data.user;
      await this._loadProfile();

      // Repair broken signup: auth exists but profile was never created.
      if (!this._profile) {
        const { error: insertErr } = await sb.from('profiles').upsert({
          id: data.user.id, username: uname, display_name: uname
        }, { onConflict: 'id' });
        if (insertErr) {
          throw new Error('Account repair failed: ' + insertErr.message + '. Message Alex to reset this account.');
        }
        await sb.from('sharing_preferences').upsert({ user_id: data.user.id }, { onConflict: 'user_id' });
        await this._loadProfile();
        this._notify();
        return { user: data.user, repaired: true };
      }

      await this._updateLastSeen();
      this._notify();
      return data.user;
    },

    async logout() {
      const sb = getSupabase();
      if (sb) await sb.auth.signOut();
      this._user = null;
      this._profile = null;
      this._notify();
    },

    async changePassword(currentPassword, newPassword) {
      const sb = getSupabase();
      if (!sb || !this._user) throw new Error('Not authenticated');

      // Verify current password by re-signing in.
      const email = `${this._profile.username}@pilgrim.sjdyag.com`;
      const { error: verifyErr } = await sb.auth.signInWithPassword({ email, password: currentPassword });
      if (verifyErr) throw new Error('Current password is incorrect');

      const { error } = await sb.auth.updateUser({ password: newPassword });
      if (error) throw new Error(error.message);

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

    // Journal entries — stored as plaintext; privacy enforced by RLS.
    async getJournalEntries(filter) {
      if (Auth.isGuest) {
        let entries = Storage._lsGet('hub:journal', []);
        if (filter) entries = entries.filter(e => (e.entry_type || 'journal') === filter);
        return entries;
      }
      const sb = getSupabase();
      const { data } = await sb.from('journal_entries').select('*')
        .eq('user_id', Auth.user.id).order('created_at', { ascending: false });
      const rows = (data || []).map(entry => {
        // Body stores JSON: {"body":"...","type":"journal","speaker":"...","talkTitle":"..."}
        let body = entry.body || '', entryType = 'journal', speaker = '', talkTitle = '';
        try {
          const parsed = JSON.parse(entry.body || '');
          if (parsed && typeof parsed.body === 'string') {
            body = parsed.body;
            entryType = parsed.type || 'journal';
            speaker = parsed.speaker || '';
            talkTitle = parsed.talkTitle || '';
          }
        } catch (_) { /* plain text body, not JSON */ }
        return { ...entry, body, entry_type: entryType, speaker, talkTitle };
      });
      if (filter) return rows.filter(e => (e.entry_type || 'journal') === filter);
      return rows;
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
      const bodyJson = JSON.stringify({ body, type: entryType, speaker, talkTitle });
      const row = { title: title || '', body: bodyJson };
      if (id) {
        row.updated_at = new Date().toISOString();
        const { error } = await sb.from('journal_entries').update(row).eq('id', id).eq('user_id', Auth.user.id);
        if (error) throw new Error('Failed to save journal: ' + error.message);
      } else {
        row.user_id = Auth.user.id;
        const { error } = await sb.from('journal_entries').insert(row);
        if (error) throw new Error('Failed to save journal: ' + error.message);
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

    // Private intentions — stored as plaintext; privacy enforced by RLS.
    async getIntentions() {
      if (Auth.isGuest) return Storage._lsGet('hub:intentions', []);
      const sb = getSupabase();
      const { data } = await sb.from('private_intentions').select('*')
        .eq('user_id', Auth.user.id).order('created_at', { ascending: false });
      return data || [];
    },

    async saveIntention(text) {
      if (Auth.isGuest) {
        const items = Storage._lsGet('hub:intentions', []);
        items.unshift({ id: crypto.randomUUID(), text, answered: false, created_at: new Date().toISOString() });
        Storage._lsSet('hub:intentions', items);
        return;
      }
      const sb = getSupabase();
      const { error } = await sb.from('private_intentions').insert({
        user_id: Auth.user.id, text: text || ''
      });
      if (error) throw new Error('Failed to save intention: ' + error.message);
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

    // Get a displayable URL for a photo (all photos are group-shared now)
    async getPhotoUrl(photo) {
      if (photo.dataUrl) return photo.dataUrl; // guest localStorage
      const sb = getSupabase();
      const { data: signedData, error: signErr } = await sb.storage.from('photos').createSignedUrl(photo.storage_path, 3600);
      if (signErr || !signedData?.signedUrl) throw new Error('Could not get photo URL');
      return signedData.signedUrl;
    },

    // Get caption for a photo (plain text — no decryption)
    async getPhotoCaption(photo) {
      return photo.caption || '';
    },

    // Upload a photo — always added to the group gallery
    async uploadPhoto(file, caption, _visibility) {
      if (Auth.isGuest) {
        const photos = Storage._lsGet('hub:photos', []);
        const reader = new FileReader();
        return new Promise((resolve) => {
          reader.onload = () => {
            photos.unshift({ id: crypto.randomUUID(), dataUrl: reader.result, caption, visibility: 'group', created_at: new Date().toISOString() });
            Storage._lsSet('hub:photos', photos);
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }
      const sb = getSupabase();
      const path = `${Auth.user.id}/public/${crypto.randomUUID()}.${file.name.split('.').pop() || 'jpg'}`;
      const { error: uploadErr } = await sb.storage.from('photos').upload(path, file);
      if (uploadErr) throw new Error(uploadErr.message);
      const { data, error: insertErr } = await sb.from('photos').insert({
        user_id: Auth.user.id,
        storage_path: path,
        caption: caption || '',
        visibility: 'group'
      }).select().single();
      if (insertErr) throw new Error(insertErr.message);
      return data;
    },

    // Photos are always group-shared now; share/unshare are no-ops kept for any
    // legacy UI references.
    async sharePhoto(_photoId) { return; },
    async unsharePhoto(_photoId) { return; },

    // Resolve user IDs to display names for group gallery
    async getPhotoUploaderNames(userIds) {
      if (!userIds.length) return {};
      const sb = getSupabase();
      const { data } = await sb.from('profiles').select('id, display_name').in('id', userIds);
      const map = {};
      (data || []).forEach(p => { map[p.id] = p.display_name || 'Pilgrim'; });
      return map;
    },

    // Delete a photo and its group copy if any
    async deletePhoto(photoId) {
      if (Auth.isGuest) {
        const photos = Storage._lsGet('hub:photos', []);
        Storage._lsSet('hub:photos', photos.filter(p => p.id !== photoId));
        return;
      }
      const sb = getSupabase();
      const { data: photo } = await sb.from('photos').select('*').eq('id', photoId).eq('user_id', Auth.user.id).single();
      if (!photo) return;
      // Delete any group copies first
      const { data: copies } = await sb.from('photos').select('*').eq('shared_from', photoId);
      for (const copy of (copies || [])) {
        await sb.storage.from('photos').remove([copy.storage_path]);
        await sb.from('photos').delete().eq('id', copy.id);
      }
      // Delete the original
      await sb.storage.from('photos').remove([photo.storage_path]);
      await sb.from('photos').delete().eq('id', photoId);
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

    let migrated = 0;
    let failed = 0;
    const succeeded = [];

    // Packing
    try {
      const packing = Storage._lsGet('hub:packing', {});
      if (Object.keys(packing).length) {
        for (const [key, checked] of Object.entries(packing)) {
          await DataStore.setPackingItem(key, checked);
        }
        migrated++;
        succeeded.push('hub:packing');
      }
    } catch (e) { console.error('Migration: packing failed', e); failed++; }

    // Journal + talk notes (encrypt)
    try {
      const journal = Storage._lsGet('hub:journal', []);
      if (journal.length) {
        for (const entry of journal) {
          await DataStore.saveJournalEntry(null, entry.title || '', entry.body || '', {
            entryType: entry.entry_type || 'journal',
            speaker: entry.speaker || '',
            talkTitle: entry.talkTitle || ''
          });
        }
        migrated++;
        succeeded.push('hub:journal', 'hub:talknotes');
      }
    } catch (e) { console.error('Migration: journal failed', e); failed++; }

    // Intentions (encrypt)
    try {
      const intentions = Storage._lsGet('hub:intentions', []);
      if (intentions.length) {
        for (const item of intentions) {
          if (item.text) {
            await DataStore.saveIntention(item.text);
          }
        }
        migrated++;
        succeeded.push('hub:intentions');
      }
    } catch (e) { console.error('Migration: intentions failed', e); failed++; }

    // Only clear localStorage for sections that actually migrated
    for (const k of succeeded) {
      try { localStorage.removeItem(k); } catch (e) {}
    }

    if (failed > 0) {
      showToast(`Some data couldn't be migrated (${failed} section${failed > 1 ? 's' : ''}). Check console for details.`, 'error');
    } else if (migrated > 0) {
      showToast('Saved! Your journey is now safe across all your devices.');
    }
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
      if (Auth.isGuest) {
        welcomeEl.textContent = 'Welcome';
      } else {
        const iconKey = Auth.profile?.saint_icon;
        const iconHtml = iconKey && PROFILE_ICONS[iconKey]
          ? `<span class="hub-welcome-icon">${renderProfileIcon(iconKey, 36)}</span>`
          : '';
        welcomeEl.innerHTML = `${iconHtml}<span>Welcome, ${escapeHtml(Auth.displayName)}</span>`;
      }
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
    initHubReadings();
    await initHubPacking();
    await initHubJournal();
    await initHubIntentions();
    initHubConfessionPrep();
    initHubEmergency();
    await initHubPhotos();

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

  function initHubReadings() {
    const container = document.querySelector('[data-readings-content]');
    if (!container) return;

    const API_BASE = 'https://cpbjr.github.io/catholic-readings-api';
    const USCCB_BASE = 'https://bible.usccb.org/bible/readings';
    const now = new Date();
    const year = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}/${mm}-${dd}`;
    const usccbDate = `${mm}${dd}${String(year).slice(-2)}`;

    const dateDisplay = now.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });

    // Fetch API data + USCCB markdown in parallel
    Promise.all([
      fetch(`${API_BASE}/readings/${dateStr}.json`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API_BASE}/liturgical-calendar/${dateStr}.json`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(`${USCCB_BASE}/${usccbDate}.cfm.md`)}`).then(r => r.ok ? r.text() : null).catch(() => null)
    ]).then(([readings, calendar, markdown]) => {
      if (!readings && !calendar) {
        container.innerHTML = '<p class="readings-error">Could not load today\'s readings. Check back later.</p>';
        return;
      }

      let html = `<div class="readings-date">${dateDisplay}</div>`;

      // Celebration / Saint
      if (calendar?.celebration) {
        const c = calendar.celebration;
        html += `<div class="readings-celebration">${escapeHtml(c.name)}</div>`;
        const typeLabel = c.type && c.type !== 'FERIA' ? c.type.charAt(0) + c.type.slice(1).toLowerCase() : '';
        html += `<div class="readings-season">`;
        html += `<span class="readings-season-dot"></span>`;
        html += escapeHtml(calendar.season || '');
        if (typeLabel) html += ` &middot; ${escapeHtml(typeLabel)}`;
        html += `</div>`;
        if (c.quote) {
          html += `<div class="readings-saint-quote">&ldquo;${escapeHtml(c.quote)}&rdquo;</div>`;
        }
        if (c.description) {
          html += `<div class="readings-saint-desc">${escapeHtml(c.description)}</div>`;
        }
      }

      // Reading references
      if (readings?.readings) {
        const r = readings.readings;
        html += '<div class="readings-list">';
        if (r.firstReading) html += `<div class="readings-item"><span class="readings-label">1st Reading</span><span class="readings-ref">${escapeHtml(r.firstReading)}</span></div>`;
        if (r.psalm) html += `<div class="readings-item"><span class="readings-label">Psalm</span><span class="readings-ref">${escapeHtml(r.psalm)}</span></div>`;
        if (r.secondReading) html += `<div class="readings-item"><span class="readings-label">2nd Reading</span><span class="readings-ref">${escapeHtml(r.secondReading)}</span></div>`;
        if (r.gospel) html += `<div class="readings-item"><span class="readings-label">Gospel</span><span class="readings-ref">${escapeHtml(r.gospel)}</span></div>`;
        html += '</div>';
      }

      // Parse markdown into reading sections for the reader modal
      const readingSections = markdown ? parseReadingsMarkdown(markdown) : [];

      // Actions row: Read Now + USCCB link
      const usccbLink = readings?.usccbLink || `${USCCB_BASE}/${usccbDate}.cfm`;
      html += `<div class="readings-actions">`;
      if (readingSections.length > 0) {
        html += `<button type="button" class="btn btn-primary btn-sm readings-read-now" data-open-reader>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          Read Now
        </button>`;
      }
      html += `<a href="${usccbLink}" target="_blank" rel="noopener" class="readings-usccb">
        Read on USCCB
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      </a>`;
      html += `</div>`;

      container.innerHTML = html;

      // Wire Read Now button
      if (readingSections.length > 0) {
        container.querySelector('[data-open-reader]')?.addEventListener('click', () => {
          openReadingsReader(readingSections, usccbLink);
        });
      }
    });
  }

  /**
   * Parse the USCCB markdown into reading sections.
   * Returns array of { title, reference, body } objects.
   */
  function parseReadingsMarkdown(md) {
    const sections = [];
    // Split on ### headings
    const parts = md.split(/^### /m);
    for (const part of parts) {
      if (!part.trim()) continue;
      const lines = part.split('\n');
      const rawTitle = lines[0].trim();

      // Only keep actual reading sections
      const titleLower = rawTitle.toLowerCase();
      if (!titleLower.startsWith('reading') &&
          !titleLower.startsWith('responsorial') &&
          !titleLower.startsWith('gospel') &&
          !titleLower.startsWith('alleluia') &&
          !titleLower.startsWith('sequence')) continue;

      // Skip Alleluia (usually just a short acclamation, not a full reading)
      if (titleLower.startsWith('alleluia')) continue;

      // Extract reference (usually on the line after the title, in brackets)
      let reference = '';
      let bodyStart = 1;
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const refMatch = line.match(/\[([^\]]+)\]/);
        if (refMatch) {
          reference = refMatch[1].trim();
          bodyStart = i + 1;
        }
        break;
      }

      // Build body text — clean up markdown artifacts
      let body = lines.slice(bodyStart).join('\n');
      // Remove markdown links but keep text
      body = body.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
      // Convert bold markdown to <strong>
      body = body.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      // Convert italic markdown to <em>
      body = body.replace(/\*([^*]+)\*/g, '<em>$1</em>');
      // Convert line breaks (two trailing spaces or double newlines)
      body = body.replace(/  \n/g, '<br>');
      // Collapse runs of blank lines into paragraph breaks
      body = body.replace(/\n{3,}/g, '\n\n');
      // Convert remaining double newlines to paragraph breaks
      body = body.replace(/\n\n/g, '</p><p>');
      // Convert single newlines to line breaks
      body = body.replace(/\n/g, '<br>');
      // Wrap in paragraphs and clean up empty ones
      body = '<p>' + body + '</p>';
      body = body.replace(/<p>\s*<\/p>/g, '');
      body = body.replace(/<p>\s*<br>\s*<\/p>/g, '');
      // Clean up leading/trailing <br> in paragraphs
      body = body.replace(/<p>\s*<br>/g, '<p>');
      body = body.replace(/<br>\s*<\/p>/g, '</p>');

      if (!body.replace(/<[^>]*>/g, '').trim()) continue;

      // Friendly display title
      let displayTitle = rawTitle;
      if (titleLower.startsWith('reading 1')) displayTitle = 'First Reading';
      else if (titleLower.startsWith('reading 2')) displayTitle = 'Second Reading';
      else if (titleLower.startsWith('responsorial')) displayTitle = 'Responsorial Psalm';
      else if (titleLower.startsWith('gospel')) displayTitle = 'Gospel';
      else if (titleLower.startsWith('sequence')) displayTitle = 'Sequence';

      sections.push({ title: displayTitle, reference, body });
    }
    return sections;
  }

  /**
   * Open a paginated readings reader modal.
   */
  function openReadingsReader(sections, usccbLink) {
    // Remove existing reader if any
    document.querySelector('.reader-overlay')?.remove();

    const total = sections.length;
    const dotsHTML = sections.map((_, i) => `<span class="reader-dot${i === 0 ? ' active' : ''}"></span>`).join('');
    const pagesHTML = sections.map((s, i) => `
      <div class="reader-page${i === 0 ? ' active' : ''}" data-reader-page="${i}">
        <div class="reader-page-label">${escapeHtml(s.title)}</div>
        ${s.reference ? `<div class="reader-page-ref">${escapeHtml(s.reference)}</div>` : ''}
        <div class="reader-page-body">${s.body}</div>
      </div>
    `).join('');

    const overlay = document.createElement('div');
    overlay.className = 'reader-overlay';
    overlay.innerHTML = `
      <div class="reader-modal">
        <div class="reader-header">
          <div class="reader-dots">${dotsHTML}</div>
          <button type="button" class="reader-close" data-reader-close aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="reader-body">${pagesHTML}</div>
        <div class="reader-footer">
          <button type="button" class="btn btn-ghost btn-sm" data-reader-prev disabled>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="15 18 9 12 15 6"/></svg>
            Back
          </button>
          <span class="reader-counter" data-reader-counter>1 / ${total}</span>
          <button type="button" class="btn btn-ghost btn-sm" data-reader-next>
            Next
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
        <a href="${usccbLink}" target="_blank" rel="noopener" class="reader-usccb-link">
          Read on USCCB
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </a>
      </div>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('open'));

    let current = 0;
    const pages = overlay.querySelectorAll('.reader-page');
    const dots = overlay.querySelectorAll('.reader-dot');
    const prevBtn = overlay.querySelector('[data-reader-prev]');
    const nextBtn = overlay.querySelector('[data-reader-next]');
    const counter = overlay.querySelector('[data-reader-counter]');

    function goTo(n) {
      pages.forEach(p => p.classList.remove('active'));
      dots.forEach(d => d.classList.remove('active'));
      pages[n].classList.add('active');
      dots[n].classList.add('active');
      current = n;
      prevBtn.disabled = n === 0;
      nextBtn.disabled = n === total - 1;
      counter.textContent = `${n + 1} / ${total}`;
      // Scroll reader body to top
      overlay.querySelector('.reader-body').scrollTop = 0;
    }

    function close() {
      overlay.classList.remove('open');
      setTimeout(() => overlay.remove(), 350);
    }

    overlay.addEventListener('click', (e) => {
      if (e.target.matches('[data-reader-next]') || e.target.closest('[data-reader-next]')) {
        if (current < total - 1) goTo(current + 1);
      } else if (e.target.matches('[data-reader-prev]') || e.target.closest('[data-reader-prev]')) {
        if (current > 0) goTo(current - 1);
      } else if (e.target.matches('[data-reader-close]') || e.target.closest('[data-reader-close]')) {
        close();
      } else if (e.target === overlay) {
        close();
      }
    });

    // Keyboard navigation
    function onKey(e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); }
      else if (e.key === 'ArrowRight' && current < total - 1) goTo(current + 1);
      else if (e.key === 'ArrowLeft' && current > 0) goTo(current - 1);
    }
    document.addEventListener('keydown', onKey);
  }

  async function initHubPacking() {
    const container = document.querySelector('[data-hub-packing]');
    if (!container) return;
    const items = await DataStore.getPackingItems();

    // Hide removed default items
    container.querySelectorAll('[data-pack-item]').forEach(label => {
      const key = label.dataset.packItem;
      if (items['_removed:' + key]) label.remove();
    });

    // Restore checked state on remaining default items
    container.querySelectorAll('input[data-pack-key]').forEach(cb => {
      const key = cb.dataset.packKey;
      if (key && items[key]) cb.checked = true;
      cb.addEventListener('change', () => {
        DataStore.setPackingItem(key, cb.checked);
        updatePackingProgress(container);
      });
    });

    // Render custom items into their categories
    // Key format: custom:category:itemText
    Object.keys(items).forEach(key => {
      if (!key.startsWith('custom:')) return;
      const parts = key.split(':');
      const cat = parts[1] || 'essentials';
      const text = parts.slice(2).join(':');
      const catEl = container.querySelector(`[data-pack-cat="${cat}"]`);
      if (!catEl || !text) return;
      addPackItemEl(catEl, key, text, items[key], container);
    });

    // Remove buttons for default items
    container.querySelectorAll('.pack-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const label = btn.closest('label');
        const key = label.dataset.packItem;
        if (!key) return;
        DataStore.setPackingItem('_removed:' + key, true);
        label.remove();
        updatePackingProgress(container);
      });
    });

    // Add item inputs
    container.querySelectorAll('[data-pack-add-btn]').forEach(btn => {
      const cat = btn.dataset.packAddBtn;
      const input = container.querySelector(`[data-pack-add="${cat}"]`);
      if (!input) return;

      function addItem() {
        const text = input.value.trim();
        if (!text) return;
        const key = 'custom:' + cat + ':' + text;
        const catEl = container.querySelector(`[data-pack-cat="${cat}"]`);
        DataStore.setPackingItem(key, false);
        addPackItemEl(catEl, key, text, false, container);
        input.value = '';
        updatePackingProgress(container);
      }

      btn.addEventListener('click', addItem);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addItem(); } });
    });

    updatePackingProgress(container);
  }

  function addPackItemEl(catEl, key, text, checked, container) {
    const label = document.createElement('label');
    label.dataset.packItem = key;
    label.innerHTML = `<input type="checkbox" data-pack-key="${escapeHtml(key)}"${checked ? ' checked' : ''}><span>${escapeHtml(text)}</span><button type="button" class="pack-remove" aria-label="Remove">&times;</button>`;
    catEl.appendChild(label);
    const cb = label.querySelector('input');
    cb.addEventListener('change', () => {
      DataStore.setPackingItem(key, cb.checked);
      updatePackingProgress(container);
    });
    label.querySelector('.pack-remove').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Delete custom item from DB
      if (Auth.isGuest) {
        const items = Storage._lsGet('hub:packing', {});
        delete items[key];
        Storage._lsSet('hub:packing', items);
      } else {
        const sb = getSupabase();
        sb.from('packing_items').delete().eq('user_id', Auth.user.id).eq('item_key', key);
      }
      label.remove();
      updatePackingProgress(container);
    });
  }

  function updatePackingProgress(container) {
    const cbs = container.querySelectorAll('input[type="checkbox"][data-pack-key]');
    const visible = Array.from(cbs).filter(c => !c.dataset.packKey.startsWith('_'));
    const total = visible.length;
    const checked = visible.filter(c => c.checked).length;
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

    container.querySelector('[data-new-intention]')?.addEventListener('click', async () => {
      const input = container.querySelector('[data-intention-input]');
      if (!input || !input.value.trim()) return;
      const text = input.value.trim();
      try {
        await DataStore.saveIntention(text);
        input.value = '';
        await render();
      } catch (err) {
        if (typeof showToast === 'function') {
          if (err.message && err.message.includes('encryption key')) {
            showToast('Encryption key not loaded. Try logging out and back in.', 'error');
          } else {
            showToast('Failed to save intention: ' + (err.message || 'Unknown error'), 'error');
          }
        }
      }
    });

    await render();
  }

  async function initHubPhotos() {
    const container = document.querySelector('[data-hub-photos]');
    if (!container) return;
    const previews = container.querySelector('[data-photo-previews]');
    const countEl = container.querySelector('[data-photo-count]');
    const photos = await DataStore.getPhotos('mine');
    if (countEl) countEl.textContent = photos.length + ' photo' + (photos.length === 1 ? '' : 's');
    const show = photos.slice(0, 4);
    if (previews && show.length) {
      for (const photo of show) {
        try {
          const url = await DataStore.getPhotoUrl(photo);
          const img = document.createElement('img');
          img.src = url; img.alt = '';
          previews.appendChild(img);
        } catch (e) { /* skip failed decryption */ }
      }
      if (photos.length > 4) {
        const more = document.createElement('div');
        more.className = 'hub-photo-more';
        more.textContent = '+' + (photos.length - 4);
        previews.appendChild(more);
      }
    }
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
          <p class="text-mute text-center" style="font-size:1rem;margin-top:var(--space-3)">
            Forgot password? <a href="mailto:alex@sjdyoungadults.com">Message Alex</a> and he'll reset it for you.
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
          <div class="field-group">
            <label for="signup-pass-confirm">Confirm Password</label>
            <input type="password" id="signup-pass-confirm" class="field" autocomplete="new-password" minlength="10" required>
          </div>
          <input type="text" name="website" style="display:none" tabindex="-1" autocomplete="off" data-honeypot>
          <div class="cf-turnstile" data-sitekey="${TURNSTILE_SITE_KEY}" data-size="compact"></div>
          <p class="auth-error" data-auth-error style="display:none"></p>
          <label style="display:flex;align-items:flex-start;gap:0.5rem;font-size:0.9rem;color:var(--cream-dim);cursor:pointer;margin:var(--space-3) 0">
            <input type="checkbox" required data-privacy-agree style="margin-top:0.2rem;flex-shrink:0">
            <span>I am at least 14 years old and agree to the <a href="privacy.html" target="_blank" style="color:var(--gold);text-decoration:underline">Privacy Policy</a></span>
          </label>
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

    async function finishAccountSetup() {
      await migrateGuestDataToAccount();
      modal.classList.remove('open');
      setTimeout(() => { modal.remove(); location.reload(); }, 300);
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

      // Password match check
      const pass = e.target.querySelector('#signup-pass').value;
      const confirmPass = e.target.querySelector('#signup-pass-confirm').value;
      if (pass !== confirmPass) {
        errEl.textContent = 'Passwords do not match.';
        errEl.style.display = '';
        return;
      }

      // zxcvbn check
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
        await Auth.signup(user, pass);
        // Brand-new account: ensure the setup guide fires after reload,
        // even if a prior account on this device already dismissed it.
        try { localStorage.removeItem('acct:setup-seen'); } catch (e) {}
        await finishAccountSetup();
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
  // HUB TOUR GUIDE (first visit)
  // ============================================
  function createGuide(stepsConfig, opts = {}) {
    const { onClose, onFinish, storageKey } = opts;
    const total = stepsConfig.length;
    let current = 0;

    const el = document.createElement('div');
    el.className = 'guide-overlay';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');

    el.innerHTML = `
      <div class="guide-inner">
        <button type="button" class="guide-close-x" aria-label="Close">&times;</button>
        <div class="guide-dots">${stepsConfig.map((_, i) => `<span class="guide-dot${i === 0 ? ' active' : ''}"></span>`).join('')}</div>
        <div class="guide-body"></div>
        <div class="guide-nav">
          <button type="button" class="btn btn-ghost btn-sm guide-btn-back" style="visibility:hidden">Back</button>
          <button type="button" class="btn btn-primary btn-sm guide-btn-next ob-pulse">Next</button>
        </div>
        <p class="ob-next-hint guide-next-hint" aria-hidden="true">Tap to continue</p>
      </div>
    `;

    const body = el.querySelector('.guide-body');
    const dots = el.querySelectorAll('.guide-dot');
    const backBtn = el.querySelector('.guide-btn-back');
    const nextBtn = el.querySelector('.guide-btn-next');
    const nextHint = el.querySelector('.guide-next-hint');
    const closeX = el.querySelector('.guide-close-x');

    function render() {
      const step = stepsConfig[current];
      body.classList.remove('entering');

      setTimeout(() => {
        body.innerHTML = `
          ${step.icon ? `<div class="guide-icon">${step.icon}</div>` : ''}
          ${step.html || `<h2>${step.title}</h2><p class="guide-desc">${step.desc}</p>`}
          ${step.extra || ''}
        `;
        void body.offsetWidth; // force reflow
        body.classList.add('entering');
        if (step.onEnter) step.onEnter(el);
      }, 50);

      dots.forEach((d, i) => d.classList.toggle('active', i <= current));
      backBtn.style.visibility = current > 0 ? 'visible' : 'hidden';

      if (step.nextLabel) nextBtn.textContent = step.nextLabel;
      else if (current === total - 1) nextBtn.textContent = 'Done';
      else if (current === 0) nextBtn.textContent = step.cta ? 'Get Started' : 'Next';
      else nextBtn.textContent = 'Next';

      if (step.cta) {
        nextBtn.style.display = 'none';
        if (nextHint) nextHint.style.display = 'none';
      } else {
        nextBtn.style.display = '';
        if (nextHint) {
          nextHint.style.display = '';
          nextHint.textContent = `Tap "${nextBtn.textContent}" to continue`;
        }
      }
    }

    function goTo(n) {
      if (n < 0 || n >= total) return;
      current = n;
      render();
    }

    function close() {
      if (storageKey) Storage._lsSet(storageKey, true);
      el.classList.remove('open');
      el.classList.add('closing');
      setTimeout(() => el.remove(), 500);
      if (onClose) onClose();
    }

    function advance() {
      if (current === total - 1) {
        if (onFinish) onFinish(el);
        else close();
      } else {
        goTo(current + 1);
      }
    }

    backBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', advance);
    closeX.addEventListener('click', close);

    el.addEventListener('click', (e) => {
      if (e.target === el) close();
      if (e.target.matches('[data-guide-advance]')) advance();
      if (e.target.matches('[data-guide-dismiss]')) close();
      if (e.target.matches('[data-guide-signin]')) {
        if (storageKey) Storage._lsSet(storageKey, true);
        el.classList.remove('open');
        setTimeout(() => { el.remove(); openAuthModal('login'); }, 350);
      }
    });

    document.body.appendChild(el);
    render();
    requestAnimationFrame(() => el.classList.add('open'));

    return { el, goTo, close, advance, getCurrent: () => current };
  }

  // ============================================
  // HUB FIRST VISIT TOUR (guests only)
  // ============================================
  function initHubFirstVisit() {
    if (!document.querySelector('[data-hub]')) return;
    if (Storage._lsGet('hub:tour-seen', false) || !Auth.isGuest) return;

    const svgAttrs = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="48" height="48"';

    createGuide([
      {
        icon: `<svg ${svgAttrs}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
        title: 'Your Retreat Hub',
        desc: 'This is your personal command center for the ASCEND 2026 retreat. Everything you need is right here — let\'s take a quick look.',
        nextLabel: 'Show Me Around'
      },
      {
        icon: `<svg ${svgAttrs}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
        title: 'Daily Readings',
        desc: 'Start each day with the Mass readings, psalm, and gospel. If there\'s a saint of the day, you\'ll see their story and a quote.'
      },
      {
        icon: `<svg ${svgAttrs}><path d="M4 19V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13"/><path d="M4 19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="14" y2="13"/></svg>`,
        title: 'Journal & Talk Notes',
        desc: 'Write reflections, sketch drawings, and capture speaker notes with a rich text editor. Only you can read your entries.'
      },
      {
        icon: `<svg ${svgAttrs}><circle cx="12" cy="12" r="10"/><path d="M12 6v12M8 12h8"/></svg>`,
        title: 'Rosary & Intentions',
        desc: 'Pray the Holy Rosary with a guided experience, and keep a private list of prayer intentions only you can read.'
      },
      {
        icon: `<svg ${svgAttrs}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
        title: 'Photo Gallery',
        desc: 'Upload retreat photos to the shared group gallery — everyone on the trip can see and enjoy them.'
      },
      {
        icon: `<svg ${svgAttrs}><path d="M6 21V10a6 6 0 0 1 12 0v11"/><path d="M4 21h16"/><rect x="9" y="14" width="6" height="3" rx=".5"/></svg>`,
        title: 'Packing & More',
        desc: 'Check off your packing list, review confession prep, find emergency contacts, and see the full retreat schedule.'
      },
      {
        icon: `<svg ${svgAttrs}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
        title: 'Create an Account',
        desc: 'Unlock the journal, photo gallery, packing checklist, and private intentions. Just a username and password — no email needed. Only you can read your journal and intentions. <a href="security.html" style="color:var(--gold);text-decoration:underline;text-underline-offset:2px">How we keep it safe</a>',
        cta: true,
        extra: `<div class="guide-actions">
          <button type="button" class="btn btn-primary" data-guide-advance>Create Account</button>
          <button type="button" class="btn btn-ghost btn-sm" data-guide-signin>Already have an account? Sign in</button>
          <button type="button" class="btn btn-ghost btn-sm" data-guide-dismiss>Continue as Guest</button>
        </div>`
      }
    ], {
      storageKey: 'hub:tour-seen',
      onClose() {},
      onFinish(el) {
        Storage._lsSet('hub:tour-seen', true);
        el.classList.remove('open');
        setTimeout(() => { el.remove(); openAuthModal('signup'); }, 350);
      }
    });
  }

  // ============================================
  // ACCOUNT SETUP GUIDE (after first signup)
  // ============================================
  function showAccountSetupGuide() {
    if (Storage._lsGet('acct:setup-seen', false)) return;

    const iconKeys = typeof PROFILE_ICONS !== 'undefined' ? Object.keys(PROFILE_ICONS) : [];
    const iconGridHTML = iconKeys.map(key => {
      const img = typeof renderProfileIcon === 'function' ? renderProfileIcon(key, 48) : '';
      const label = PROFILE_ICONS[key]?.label || key;
      return `<button type="button" class="guide-icon-btn" data-pick-icon="${key}" title="${label}">${img}</button>`;
    }).join('');

    const svgAttrs = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="48" height="48"';
    let selectedIcon = Auth.profile?.saint_icon || '';

    createGuide([
      {
        icon: `<svg ${svgAttrs}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
        title: 'Account Created!',
        desc: 'Welcome to ASCEND. Let\'s set up your profile so other retreat attendees can recognize you.',
        nextLabel: 'Set Up Profile'
      },
      {
        html: `
          <h2>What should we call you?</h2>
          <p class="guide-desc">This is how you'll appear to other attendees.</p>
          <div class="guide-field">
            <label for="setup-display-name">Display Name</label>
            <input type="text" id="setup-display-name" class="field" placeholder="Your name" maxlength="30" value="${escapeHtml(Auth.displayName || '')}">
          </div>
        `
      },
      {
        html: `
          <h2>Pick a Profile Icon</h2>
          <p class="guide-desc">Choose a symbol that represents you.</p>
          <div class="guide-icon-grid">${iconGridHTML}</div>
        `,
        onEnter(el) {
          if (selectedIcon) {
            const active = el.querySelector(`[data-pick-icon="${selectedIcon}"]`);
            if (active) active.classList.add('selected');
          }
        }
      },
      {
        html: `
          <h2>Sharing Preferences</h2>
          <p class="guide-desc">Control what other retreat attendees can see.</p>
          <div class="guide-toggles">
            <label class="guide-toggle-row">
              <span><strong>Share Profile</strong><small>Others can see your name and icon</small></span>
              <input type="checkbox" data-setup-share-profile checked>
            </label>
            <label class="guide-toggle-row">
              <span><strong>Share Packing Progress</strong><small>Others can see your packing checklist</small></span>
              <input type="checkbox" data-setup-share-packing>
            </label>
            <label class="guide-toggle-row">
              <span><strong>Share Photos</strong><small>Your shared photos appear in the group gallery</small></span>
              <input type="checkbox" data-setup-share-photos checked>
            </label>
          </div>
        `
      },
      {
        html: `
          <h2>Choose Your Theme</h2>
          <p class="guide-desc">You can always change this later in settings.</p>
          <div class="ob-theme-cards">
            <button type="button" class="ob-theme-choice" data-setup-theme="dark" aria-pressed="false">
              <div class="ob-theme-preview ob-preview-dark"></div>
              <span>Dark</span>
            </button>
            <button type="button" class="ob-theme-choice" data-setup-theme="light" aria-pressed="true">
              <div class="ob-theme-preview ob-preview-light"></div>
              <span>Light</span>
            </button>
          </div>
        `
      },
      {
        icon: `<svg ${svgAttrs}><path d="M12 2L4 7v5c0 5.25 3.4 10.2 8 11 4.6-.8 8-5.75 8-11V7l-8-5z"/><path d="M9 12l2 2 4-4"/></svg>`,
        title: 'You\'re All Set!',
        desc: 'Your profile is saved. You can update any of these settings anytime from the account page.'
      }
    ], {
      storageKey: 'acct:setup-seen',
      async onFinish(el) {
        const nameInput = el.querySelector('#setup-display-name');
        const displayName = nameInput ? nameInput.value.trim() : '';
        const shareProfile = el.querySelector('[data-setup-share-profile]')?.checked ?? true;
        const sharePacking = el.querySelector('[data-setup-share-packing]')?.checked ?? false;
        const sharePhotos = el.querySelector('[data-setup-share-photos]')?.checked ?? true;

        if (displayName || selectedIcon) {
          const update = {};
          if (displayName) update.display_name = displayName;
          if (selectedIcon) update.saint_icon = selectedIcon;
          try { await Auth.updateProfile(update); } catch (e) { console.warn('Profile update failed:', e); }
        }
        try {
          await DataStore.updateSharingPrefs({ share_profile: shareProfile, share_packing_progress: sharePacking, share_photos: sharePhotos });
        } catch (e) { console.warn('Sharing prefs failed:', e); }

        Storage._lsSet('acct:setup-seen', true);
        el.classList.remove('open');
        setTimeout(() => { el.remove(); location.reload(); }, 350);
      }
    });

    // Delegate icon picker and theme picker clicks
    document.querySelector('.guide-overlay')?.addEventListener('click', (e) => {
      const iconBtn = e.target.closest('[data-pick-icon]');
      if (iconBtn) {
        document.querySelectorAll('.guide-icon-btn').forEach(b => b.classList.remove('selected'));
        iconBtn.classList.add('selected');
        selectedIcon = iconBtn.dataset.pickIcon;
      }
      const themeBtn = e.target.closest('[data-setup-theme]');
      if (themeBtn) {
        document.querySelectorAll('[data-setup-theme]').forEach(b => b.setAttribute('aria-pressed', 'false'));
        themeBtn.setAttribute('aria-pressed', 'true');
        Theme.set(themeBtn.dataset.setupTheme);
      }
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

      // Photos
      try {
        const photos = await DataStore.getPhotos('mine');
        const photosFolder = zip.folder('photos');
        for (const photo of photos) {
          try {
            const url = await DataStore.getPhotoUrl(photo);
            const caption = await DataStore.getPhotoCaption(photo);
            const resp = await fetch(url);
            const blob = await resp.blob();
            const ext = 'jpg';
            photosFolder.file(`${photo.id}.${ext}`, blob);
            if (caption) photosFolder.file(`${photo.id}.caption.txt`, caption);
          } catch (e) { /* skip photos that fail to fetch */ }
        }
      } catch (e) { /* photos export optional */ }

      // Audit log
      zip.file('audit-log.json', JSON.stringify(await DataStore.getMyAuditLog(), null, 2));

      // README
      zip.file('README.txt', `ASCEND Pilgrim Hub Export\nExported: ${new Date().toLocaleString()}\nUser: @${username}\n\nThis is your pilgrimage. Keep it forever.\n\nFiles:\n- profile.json — Your account info\n- packing.json — Packing checklist\n- journal.json — Journal entries\n- talk-notes.json — Notes from talks\n- intentions.json — Private intentions\n- photos/ — Your photos with captions\n- audit-log.json — Account activity log\n`);

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
    initSectionJump();
    initJumpNav();
    initFooter();
    initHeroParticles();
    initRSVP().catch(console.warn);
    initIntentions().catch(console.warn);
    initPrayerLines();
    initTimeline().catch(console.warn);
    initPacking().catch(console.warn);
    initSpeakers();
    initCarpoolPublic().catch(console.warn);
    initHotelRoomsPublic().catch(console.warn);

    // Hub page
    initHubFirstVisit();
    if (!Auth.isGuest) showAccountSetupGuide();
    initHub().catch(console.warn);

    // Admin page
    initAdmin().catch(console.warn);

    // Account settings page
    initAccount().catch(console.warn);

    // Deep-link to the auth modal via #signin / #login.
    if ((location.hash === '#signin' || location.hash === '#login') && Auth.isGuest) {
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
      setTimeout(() => openAuthModal('login'), 100);
    }

    // One-time message from Alex (next-startup popup).
    showAlexMessage();
  }

  // -------------------------------------------------------
  // One-time message from Alex
  // -------------------------------------------------------
  function showAlexMessage() {
    const KEY = 'msg:alex-2026-05-15-sunday';
    try { if (localStorage.getItem(KEY) === 'seen') return; } catch (e) { return; }
    if (!document.body) return;

    const overlay = document.createElement('div');
    overlay.className = 'alex-msg-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Message from Alex');
    overlay.innerHTML = `
      <div class="alex-msg-card">
        <div class="alex-msg-header">
          <span class="alex-msg-from">a quick note from</span>
          <strong class="alex-msg-name">alex</strong>
        </div>
        <div class="alex-msg-body">
          <p>have a great trip y'all — wish i could be there. praying for an awesome weekend.</p>
          <p class="alex-msg-foot">—alex</p>
        </div>
        <button type="button" class="btn btn-primary btn-full alex-msg-dismiss">got it</button>
      </div>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('open'));

    const dismiss = () => {
      try { localStorage.setItem(KEY, 'seen'); } catch (e) {}
      overlay.classList.remove('open');
      setTimeout(() => overlay.remove(), 300);
    };
    overlay.querySelector('.alex-msg-dismiss').addEventListener('click', dismiss);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) dismiss(); });
  }

  // ============================================
  // ADMIN PAGE
  // ============================================
  async function initAdmin() {
    const adminEl = document.querySelector('[data-admin]');
    if (!adminEl) return;

    const loadingEl = adminEl.querySelector('[data-admin-loading]');
    const deniedEl = adminEl.querySelector('[data-admin-denied]');
    const dashEl = adminEl.querySelector('[data-admin-content]');

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

        // Password resets are performed by Alex from the Supabase Auth
        // dashboard — there is no in-app reset button. The user's journal,
        // intentions, and photos are preserved across the reset.

        // Delete user
        tbody.querySelectorAll('[data-admin-delete]').forEach(btn => {
          btn.addEventListener('click', async () => {
            if (!confirm(`Delete @${btn.dataset.username}? This will remove ALL their data permanently.`)) return;
            const uid = btn.dataset.adminDelete;
            try {
              btn.disabled = true;
              btn.textContent = 'Deleting...';
              // Delete user photos from storage
              const { data: userPhotos } = await sb.from('photos').select('storage_path').eq('user_id', uid);
              if (userPhotos && userPhotos.length) {
                await sb.storage.from('photos').remove(userPhotos.map(p => p.storage_path));
              }
              // Cascade delete from all user tables
              await sb.from('photos').delete().eq('user_id', uid);
              await sb.from('journal_entries').delete().eq('user_id', uid);
              await sb.from('private_intentions').delete().eq('user_id', uid);
              await sb.from('talk_notes').delete().eq('user_id', uid);
              await sb.from('packing_items').delete().eq('user_id', uid);
              await sb.from('sharing_preferences').delete().eq('user_id', uid);
              await sb.from('scheduled_deletions').delete().eq('user_id', uid);
              await sb.from('profiles').delete().eq('id', uid);
              // Delete the auth user so the username can be reused
              try { await sb.rpc('admin_delete_auth_user', { target_user_id: uid }); } catch (e) {}
              await logAdminAction('delete_user', uid, btn.dataset.username, 'Account deleted by admin');
              // Remove the row from the table
              btn.closest('tr').remove();
              showToast(`Deleted @${btn.dataset.username} and all their data.`);
            } catch (err) {
              showToast('Delete failed: ' + err.message, 'error');
              btn.disabled = false;
              btn.textContent = 'Delete';
            }
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

    // Timeline Editor
    initTimelineEditor(sb);
    // Carpool + Room Assignments editors
    initCarpoolEditor(sb).catch(console.warn);
    initHotelRoomsEditor(sb).catch(console.warn);
  }

  // -------------------------------------------------------
  // Timeline Editor (admin only)
  // -------------------------------------------------------
  async function initTimelineEditor(sb) {
    const listEl = document.querySelector('[data-te-list]');
    if (!listEl || !sb) return;

    let stops = [];
    let filterDay = 'all';

    async function loadStops() {
      const { data, error } = await sb.from('stops').select('*').order('sort_order', { ascending: true });
      if (error) { listEl.innerHTML = '<p class="text-dim">Error loading stops.</p>'; return; }
      stops = data || [];
      renderList();
    }

    function formatTime12(t) {
      if (!t) return '';
      const [h, m] = t.split(':').map(Number);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return m === 0 ? `${h12} ${ampm}` : `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
    }

    function renderList() {
      const filtered = filterDay === 'all' ? stops : stops.filter(s => s.day === filterDay);
      if (!filtered.length) {
        listEl.innerHTML = '<p class="text-dim">No stops found.</p>';
        return;
      }
      listEl.innerHTML = filtered.map(s => `
        <div class="te-item" data-te-id="${s.id}">
          <div class="te-item-info">
            <span class="te-day-badge ${s.day}">${s.day === 'sat' ? 'SAT' : 'SUN'}</span>
            <span class="te-time">${formatTime12(s.time)}</span>
            <span class="te-title">${escapeHtml(s.title)}</span>
          </div>
          <div class="te-item-actions">
            <button class="btn btn-ghost btn-sm" data-te-edit="${s.id}">Edit</button>
            <button class="btn btn-ghost btn-sm" data-te-up="${s.id}" title="Move up">&#9650;</button>
            <button class="btn btn-ghost btn-sm" data-te-down="${s.id}" title="Move down">&#9660;</button>
            <button class="btn btn-ghost btn-sm te-delete" data-te-delete="${s.id}">Delete</button>
          </div>
        </div>
      `).join('');

      // Wire actions
      listEl.querySelectorAll('[data-te-edit]').forEach(btn => {
        btn.addEventListener('click', () => openModal(stops.find(s => s.id === Number(btn.dataset.teEdit))));
      });
      listEl.querySelectorAll('[data-te-delete]').forEach(btn => {
        btn.addEventListener('click', () => deleteStop(Number(btn.dataset.teDelete)));
      });
      listEl.querySelectorAll('[data-te-up]').forEach(btn => {
        btn.addEventListener('click', () => moveStop(Number(btn.dataset.teUp), -1));
      });
      listEl.querySelectorAll('[data-te-down]').forEach(btn => {
        btn.addEventListener('click', () => moveStop(Number(btn.dataset.teDown), 1));
      });
    }

    // Filter buttons
    document.querySelectorAll('[data-te-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-te-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterDay = btn.dataset.teFilter;
        renderList();
      });
    });

    // Add button
    const addBtn = document.querySelector('[data-te-add]');
    if (addBtn) addBtn.addEventListener('click', () => openModal(null));

    // Modal
    const modalBackdrop = document.querySelector('[data-te-modal]');
    const modalTitle = document.querySelector('[data-te-modal-title]');
    const form = document.querySelector('[data-te-form]');
    const placesContainer = document.querySelector('[data-te-places]');
    const addPlaceBtn = document.querySelector('[data-te-add-place]');
    let editingId = null;

    function openModal(stop) {
      editingId = stop ? stop.id : null;
      modalTitle.textContent = stop ? 'Edit Stop' : 'Add Stop';
      form.elements.day.value = stop ? stop.day : 'sat';
      form.elements.time.value = stop ? stop.time : '';
      form.elements.title.value = stop ? stop.title : '';
      form.elements.body.value = stop ? (stop.body || '') : '';
      form.elements.addr.value = stop ? (stop.addr || '') : '';
      form.elements.map.value = stop ? (stop.map || '') : '';
      form.elements.bring.value = stop ? (stop.bring || '') : '';
      renderPlaces(stop ? (stop.places || []) : []);
      modalBackdrop.hidden = false;
    }

    function closeModal() {
      modalBackdrop.hidden = true;
      editingId = null;
    }

    document.querySelectorAll('[data-te-modal-close]').forEach(el => {
      el.addEventListener('click', closeModal);
    });
    // Close on backdrop click
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modalBackdrop.hidden) closeModal();
    });

    // Places sub-editor
    function renderPlaces(places) {
      placesContainer.innerHTML = '';
      places.forEach(p => addPlaceRow(p));
    }

    function addPlaceRow(place) {
      place = place || {};
      const row = document.createElement('div');
      row.className = 'te-place-row';
      row.innerHTML = `
        <input type="text" class="field te-place-field" placeholder="Name" value="${escapeHtml(place.name || '')}" data-place="name">
        <input type="text" class="field te-place-field" placeholder="Description" value="${escapeHtml(place.desc || '')}" data-place="desc">
        <input type="text" class="field te-place-field" placeholder="Walk time" value="${escapeHtml(place.walk || '')}" data-place="walk">
        <input type="url" class="field te-place-field" placeholder="Map URL" value="${escapeHtml(place.url || '')}" data-place="url">
        <button type="button" class="btn btn-ghost btn-sm te-remove-place" title="Remove">&times;</button>
      `;
      row.querySelector('.te-remove-place').addEventListener('click', () => row.remove());
      placesContainer.appendChild(row);
    }

    if (addPlaceBtn) addPlaceBtn.addEventListener('click', () => addPlaceRow());

    function collectPlaces() {
      return Array.from(placesContainer.querySelectorAll('.te-place-row')).map(row => ({
        name: row.querySelector('[data-place="name"]').value.trim(),
        desc: row.querySelector('[data-place="desc"]').value.trim(),
        walk: row.querySelector('[data-place="walk"]').value.trim(),
        url:  row.querySelector('[data-place="url"]').value.trim()
      })).filter(p => p.name);
    }

    // Save — bind all save buttons (in-form for desktop + footer for mobile)
    const saveBtns = modalBackdrop.querySelectorAll('[data-te-save]');
    async function handleSave() {
      if (!form.elements.title.value.trim() || !form.elements.time.value) {
        showToast('Title and time are required', 'error');
        return;
      }
      saveBtns.forEach(b => { b.disabled = true; b.textContent = 'Saving...'; });

      const payload = {
        day:    form.elements.day.value,
        time:   form.elements.time.value,
        title:  form.elements.title.value.trim(),
        body:   form.elements.body.value.trim(),
        addr:   form.elements.addr.value.trim() || null,
        map:    form.elements.map.value.trim() || null,
        bring:  form.elements.bring.value.trim() || null,
        places: collectPlaces(),
        updated_at: new Date().toISOString()
      };

      try {
        if (editingId) {
          const { error } = await sb.from('stops').update(payload).eq('id', editingId);
          if (error) throw error;
          showToast('Stop updated');
        } else {
          const maxSort = stops.length ? Math.max(...stops.map(s => s.sort_order)) : 0;
          payload.sort_order = maxSort + 1;
          const { error } = await sb.from('stops').insert(payload);
          if (error) throw error;
          showToast('Stop added');
        }
        logAdminAction(editingId ? 'timeline_update' : 'timeline_add', null, null,
          `${editingId ? 'Updated' : 'Added'} stop: ${payload.title}`).catch(() => {});
        closeModal();
        await loadStops();
      } catch (err) {
        showToast('Error saving: ' + (err.message || err), 'error');
      } finally {
        saveBtns.forEach(b => { b.disabled = false; b.textContent = 'Save'; });
      }
    }
    saveBtns.forEach(btn => btn.addEventListener('click', (e) => {
      e.preventDefault();
      handleSave();
    }));

    // Delete
    async function deleteStop(id) {
      const stop = stops.find(s => s.id === id);
      if (!stop) return;
      if (!confirm(`Delete "${stop.title}"? This cannot be undone.`)) return;
      try {
        const { error } = await sb.from('stops').delete().eq('id', id);
        if (error) throw error;
        await logAdminAction('timeline_delete', null, null, `Deleted stop #${id}: ${stop.title}`);
        showToast('Stop deleted');
        await loadStops();
      } catch (err) {
        showToast('Error deleting: ' + err.message);
      }
    }

    // Reorder
    async function moveStop(id, direction) {
      const idx = stops.findIndex(s => s.id === id);
      if (idx < 0) return;
      const swapIdx = idx + direction;
      if (swapIdx < 0 || swapIdx >= stops.length) return;
      const a = stops[idx], b = stops[swapIdx];
      try {
        await Promise.all([
          sb.from('stops').update({ sort_order: b.sort_order, updated_at: new Date().toISOString() }).eq('id', a.id),
          sb.from('stops').update({ sort_order: a.sort_order, updated_at: new Date().toISOString() }).eq('id', b.id)
        ]);
        await logAdminAction('timeline_reorder', null, null, `Swapped "${a.title}" and "${b.title}"`);
        await loadStops();
      } catch (err) {
        showToast('Error reordering: ' + err.message);
      }
    }

    await loadStops();
  }

  // =====================================================================
  // CARPOOL + HOTEL ROOMS — public rendering + admin editors
  // Data tables: carpool_vehicles / carpool_riders / hotel_rooms /
  // hotel_room_occupants (see supabase-carpool-rooms-setup.sql).
  // Falls back to hardcoded seed so the pages still render if Supabase
  // is down or the tables haven't been created yet.
  // =====================================================================

  const CARPOOL_FALLBACK = [
    {
      id: 'v1', label: 'Car 1', driver: 'Deacon Enrique Alejandro Galeana', co_driver: '',
      notes: 'Leaves St. Juan Diego (Cowiche) Saturday morning. Minors on board.',
      riders: ['Lucas','Kevin','Sebastian','Kaiser','Luisa','Ruben']
    },
    {
      id: 'v2', label: 'Car 2', driver: 'Patricia Galeana', co_driver: '',
      notes: 'Leaves St. Juan Diego (Cowiche) Saturday morning. Minors on board.',
      riders: ['Diana','Sofi','Lupita','Meli','Angie','Gali']
    },
    {
      id: 'v3', label: 'Car 3', driver: '', co_driver: '',
      notes: 'Leaves St. Juan Diego (Cowiche) Saturday morning. All passengers are 18+ — driver self-assigned by the riders.',
      riders: ['Mary','Lydia','Gaby','Kole']
    }
  ];

  const ROOMS_FALLBACK = [
    { id: 'r1', label: 'Room 1 · Deacon & wife', notes: 'Married couple (exception to co-ed rule).',
      occupants: ['Deacon Enrique','Patricia Galeana'] },
    { id: 'r2', label: 'Room 2 · Women', notes: '',
      occupants: ['Mary','Lydia','Gaby','Shayla'] },
    { id: 'r3', label: 'Room 3 · Women', notes: '',
      occupants: ['Diana','Sofi','Lupita','Meli'] },
    { id: 'r4', label: 'Room 4 · Women', notes: '',
      occupants: ['Angie','Gali','Luisa'] },
    { id: 'r5', label: 'Room 5 · Men', notes: '',
      occupants: ['Kole','Lucas','Kevin','Sebastian','Kaiser','Ruben'] }
  ];

  async function fetchCarpool(sb) {
    if (!sb) return CARPOOL_FALLBACK;
    const [{ data: vehicles, error: vErr }, { data: riders, error: rErr }] = await Promise.all([
      sb.from('carpool_vehicles').select('*').order('sort_order', { ascending: true }),
      sb.from('carpool_riders').select('*').order('sort_order', { ascending: true })
    ]);
    if (vErr || rErr || !vehicles?.length) return CARPOOL_FALLBACK;
    return vehicles.map(v => ({
      ...v,
      riders: (riders || []).filter(r => r.vehicle_id === v.id).map(r => r.name)
    }));
  }

  async function fetchRooms(sb) {
    if (!sb) return ROOMS_FALLBACK;
    const [{ data: rooms, error: rErr }, { data: occupants, error: oErr }] = await Promise.all([
      sb.from('hotel_rooms').select('*').order('sort_order', { ascending: true }),
      sb.from('hotel_room_occupants').select('*').order('sort_order', { ascending: true })
    ]);
    if (rErr || oErr || !rooms?.length) return ROOMS_FALLBACK;
    return rooms.map(r => ({
      ...r,
      occupants: (occupants || []).filter(o => o.room_id === r.id).map(o => o.name)
    }));
  }

  async function initCarpoolPublic() {
    const listEl = document.querySelector('[data-carpool-list]');
    if (!listEl) return;
    const vehicles = await fetchCarpool(getSupabase());
    if (!vehicles.length) {
      listEl.innerHTML = '<p class="text-dim">No carpool assignments yet.</p>';
      return;
    }
    listEl.innerHTML = vehicles.map(v => `
      <div class="vehicle-card">
        <div class="vehicle-head">
          <h3 class="vehicle-label">${escapeHtml(v.label)}</h3>
          <span class="vehicle-driver">${escapeHtml(v.driver)}${v.co_driver ? ' &amp; ' + escapeHtml(v.co_driver) : ''}</span>
        </div>
        ${v.notes ? `<p class="vehicle-note">${escapeHtml(v.notes)}</p>` : ''}
        <ul class="rider-list">
          ${(v.riders || []).map(n => `<li class="rider-chip">${escapeHtml(n)}</li>`).join('')}
        </ul>
      </div>
    `).join('');
  }

  async function initHotelRoomsPublic() {
    const listEl = document.querySelector('[data-rooms-list]');
    if (!listEl) return;
    const rooms = await fetchRooms(getSupabase());
    if (!rooms.length) {
      listEl.innerHTML = '<p class="text-dim">No room assignments yet.</p>';
      return;
    }
    listEl.innerHTML = rooms.map(r => `
      <div class="room-card">
        <div class="room-head">
          <h3 class="room-label">${escapeHtml(r.label)}</h3>
        </div>
        ${r.notes ? `<p class="room-note">${escapeHtml(r.notes)}</p>` : ''}
        <ul class="occupant-list">
          ${(r.occupants || []).map(n => `<li class="occupant-chip">${escapeHtml(n)}</li>`).join('')}
        </ul>
      </div>
    `).join('');
  }

  // -------------------------------------------------------
  // Generic admin editor for "group with named items" tables
  // (carpool_vehicles + riders, hotel_rooms + occupants). The two editors
  // below just configure this with the right selectors + column names.
  // -------------------------------------------------------
  async function initGroupEditor(sb, cfg) {
    const listEl = document.querySelector(cfg.listSel);
    if (!listEl || !sb) return;

    let groups = [];

    async function load() {
      const [{ data: groupRows, error: gErr }, { data: itemRows, error: iErr }] = await Promise.all([
        sb.from(cfg.groupTable).select('*').order('sort_order', { ascending: true }),
        sb.from(cfg.itemTable).select('*').order('sort_order', { ascending: true })
      ]);
      if (gErr || iErr) {
        const err = gErr || iErr;
        const missing = err && (err.code === '42P01' || err.code === 'PGRST205' || /does not exist|could not find the table|schema cache/i.test(err.message || ''));
        listEl.innerHTML = missing
          ? `<p class="text-dim">Database tables are missing. Run <code>supabase-carpool-rooms-setup.sql</code> in the Supabase SQL editor, then reload this page.</p>`
          : `<p class="text-dim">Error loading ${cfg.nounPlural}: ${escapeHtml(err.message || 'unknown error')}</p>`;
        return;
      }
      groups = (groupRows || []).map(g => ({
        ...g,
        items: (itemRows || []).filter(i => i[cfg.fkColumn] === g.id)
      }));
      render();
    }

    function render() {
      if (!groups.length) {
        listEl.innerHTML = `<p class="text-dim">No ${cfg.nounPlural} yet.</p>`;
        return;
      }
      listEl.innerHTML = groups.map(g => `
        <div class="te-item">
          <div class="te-item-info">
            <span class="te-title">${escapeHtml(g.label)}</span>
            ${cfg.subtitleFor ? `<span class="te-time">${escapeHtml(cfg.subtitleFor(g))}</span>` : ''}
            <span class="text-dim">${g.items.length} ${g.items.length === 1 ? cfg.nounItem : cfg.nounItem + 's'}</span>
          </div>
          <div class="te-item-actions">
            <button class="btn btn-ghost btn-sm" data-edit="${g.id}">Edit</button>
            <button class="btn btn-ghost btn-sm" data-up="${g.id}" title="Move up">&#9650;</button>
            <button class="btn btn-ghost btn-sm" data-down="${g.id}" title="Move down">&#9660;</button>
            <button class="btn btn-ghost btn-sm te-delete" data-del="${g.id}">Delete</button>
          </div>
        </div>
      `).join('');
      listEl.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => openModal(groups.find(g => String(g.id) === b.dataset.edit))));
      listEl.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => del(b.dataset.del)));
      listEl.querySelectorAll('[data-up]').forEach(b => b.addEventListener('click', () => move(b.dataset.up, -1)));
      listEl.querySelectorAll('[data-down]').forEach(b => b.addEventListener('click', () => move(b.dataset.down, 1)));
    }

    const addBtn = document.querySelector(cfg.addBtnSel);
    if (addBtn) addBtn.addEventListener('click', () => openModal(null));

    const modal = document.querySelector(cfg.modalSel);
    const modalTitle = modal.querySelector('[data-modal-title]');
    const form = modal.querySelector('form');
    const itemsContainer = modal.querySelector('[data-items]');
    const addItemBtn = modal.querySelector('[data-add-item]');
    let editingId = null;

    function openModal(group) {
      editingId = group ? group.id : null;
      modalTitle.textContent = group ? `Edit ${cfg.nounGroup}` : `Add ${cfg.nounGroup}`;
      form.elements.label.value = group ? group.label : '';
      if (form.elements.driver)    form.elements.driver.value    = group && group.driver    ? group.driver    : '';
      if (form.elements.co_driver) form.elements.co_driver.value = group && group.co_driver ? group.co_driver : '';
      if (form.elements.notes)     form.elements.notes.value     = group && group.notes     ? group.notes     : '';
      renderItems(group ? group.items.map(i => i.name) : []);
      modal.hidden = false;
    }
    function closeModal() { modal.hidden = true; editingId = null; }

    modal.querySelectorAll('[data-modal-close]').forEach(el => el.addEventListener('click', closeModal));
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

    function renderItems(names) {
      itemsContainer.innerHTML = '';
      names.forEach(n => addItemRow(n));
    }
    function addItemRow(name) {
      const row = document.createElement('div');
      row.className = 'te-place-row';
      row.style.gridTemplateColumns = '1fr auto';
      row.innerHTML = `
        <input type="text" class="field te-place-field" placeholder="${cfg.nounItem} name" value="${escapeHtml(name || '')}" data-item-name>
        <button type="button" class="btn btn-ghost btn-sm" data-remove-item title="Remove">&times;</button>
      `;
      row.querySelector('[data-remove-item]').addEventListener('click', () => row.remove());
      itemsContainer.appendChild(row);
    }
    if (addItemBtn) addItemBtn.addEventListener('click', () => addItemRow(''));

    function collectItems() {
      return Array.from(itemsContainer.querySelectorAll('[data-item-name]'))
        .map(el => el.value.trim()).filter(Boolean);
    }

    const saveBtns = modal.querySelectorAll('[data-save]');
    async function save() {
      if (!form.elements.label.value.trim()) { showToast('Label is required', 'error'); return; }
      saveBtns.forEach(b => { b.disabled = true; b.textContent = 'Saving...'; });
      const payload = { label: form.elements.label.value.trim() };
      if (form.elements.driver)    payload.driver    = form.elements.driver.value.trim();
      if (form.elements.co_driver) payload.co_driver = form.elements.co_driver.value.trim() || null;
      if (form.elements.notes)     payload.notes     = form.elements.notes.value.trim() || null;
      payload.updated_at = new Date().toISOString();
      const names = collectItems();

      try {
        let groupId = editingId;
        if (editingId) {
          const { error } = await sb.from(cfg.groupTable).update(payload).eq('id', editingId);
          if (error) throw error;
          await sb.from(cfg.itemTable).delete().eq(cfg.fkColumn, editingId);
        } else {
          const maxSort = groups.length ? Math.max(...groups.map(g => g.sort_order)) : 0;
          payload.sort_order = maxSort + 1;
          const { data, error } = await sb.from(cfg.groupTable).insert(payload).select().single();
          if (error) throw error;
          groupId = data.id;
        }
        if (names.length) {
          const rows = names.map((n, idx) => ({ [cfg.fkColumn]: groupId, name: n, sort_order: idx + 1 }));
          const { error } = await sb.from(cfg.itemTable).insert(rows);
          if (error) throw error;
        }
        logAdminAction(cfg.actionPrefix + (editingId ? '_update' : '_add'), null, null,
          `${editingId ? 'Updated' : 'Added'} ${cfg.nounGroup}: ${payload.label}`).catch(() => {});
        showToast(`${cfg.nounGroup} saved`);
        closeModal();
        await load();
      } catch (err) {
        showToast('Error saving: ' + (err.message || err), 'error');
      } finally {
        saveBtns.forEach(b => { b.disabled = false; b.textContent = 'Save'; });
      }
    }
    saveBtns.forEach(b => b.addEventListener('click', e => { e.preventDefault(); save(); }));

    async function del(id) {
      const g = groups.find(x => String(x.id) === String(id));
      if (!g) return;
      if (!confirm(`Delete "${g.label}"? This cannot be undone.`)) return;
      try {
        const { error } = await sb.from(cfg.groupTable).delete().eq('id', id);
        if (error) throw error;
        await logAdminAction(cfg.actionPrefix + '_delete', null, null, `Deleted ${cfg.nounGroup}: ${g.label}`);
        showToast(`${cfg.nounGroup} deleted`);
        await load();
      } catch (err) {
        showToast('Error deleting: ' + err.message);
      }
    }

    async function move(id, dir) {
      const idx = groups.findIndex(g => String(g.id) === String(id));
      if (idx < 0) return;
      const swap = idx + dir;
      if (swap < 0 || swap >= groups.length) return;
      const a = groups[idx], b = groups[swap];
      try {
        await Promise.all([
          sb.from(cfg.groupTable).update({ sort_order: b.sort_order, updated_at: new Date().toISOString() }).eq('id', a.id),
          sb.from(cfg.groupTable).update({ sort_order: a.sort_order, updated_at: new Date().toISOString() }).eq('id', b.id)
        ]);
        await load();
      } catch (err) {
        showToast('Error reordering: ' + err.message);
      }
    }

    await load();
  }

  async function initCarpoolEditor(sb) {
    return initGroupEditor(sb, {
      listSel: '[data-cp-list]',
      addBtnSel: '[data-cp-add]',
      modalSel: '[data-cp-modal]',
      groupTable: 'carpool_vehicles',
      itemTable: 'carpool_riders',
      fkColumn: 'vehicle_id',
      nounGroup: 'Vehicle',
      nounItem: 'rider',
      nounPlural: 'vehicles',
      actionPrefix: 'carpool',
      subtitleFor: g => [g.driver, g.co_driver].filter(Boolean).join(' & ')
    });
  }

  async function initHotelRoomsEditor(sb) {
    return initGroupEditor(sb, {
      listSel: '[data-hr-list]',
      addBtnSel: '[data-hr-add]',
      modalSel: '[data-hr-modal]',
      groupTable: 'hotel_rooms',
      itemTable: 'hotel_room_occupants',
      fkColumn: 'room_id',
      nounGroup: 'Room',
      nounItem: 'occupant',
      nounPlural: 'rooms',
      actionPrefix: 'rooms'
    });
  }

  // ============================================
  // ACCOUNT SETTINGS PAGE
  // ============================================

  const PROFILE_ICONS = {
    crucifix: { src: 'public/icons/crucifix-200.png', label: 'Crucifix' },
    flame:    { src: 'public/icons/flame-200.png',    label: 'Holy Spirit Flame' },
    dove:     { src: 'public/icons/dove-200.png',     label: 'Holy Spirit Dove' },
    michael:  { src: 'public/icons/michael-200.png',  label: 'St. Michael' },
    mary:     { src: 'public/icons/mary-200.png',     label: 'Virgin Mary' },
  };

  function renderProfileIcon(key, size) {
    const icon = PROFILE_ICONS[key];
    if (!icon) return '';
    return `<img src="${icon.src}" alt="${icon.label}" width="${size}" height="${size}" style="object-fit:contain;">`;
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

    const displayLabel = pageEl.querySelector('[data-acct-display-label]');
    if (displayLabel) displayLabel.textContent = Auth.profile?.display_name || '';

    const acctIconEl = pageEl.querySelector('[data-acct-icon]');
    if (acctIconEl && Auth.profile?.saint_icon && PROFILE_ICONS[Auth.profile.saint_icon]) {
      acctIconEl.innerHTML = renderProfileIcon(Auth.profile.saint_icon, 52);
    }

    const displayNameInput = pageEl.querySelector('#acct-display-name');
    if (displayNameInput) displayNameInput.value = Auth.profile?.display_name || '';

    // Icon picker
    const iconGrid = pageEl.querySelector('[data-icon-picker]');
    let selectedIcon = Auth.profile?.saint_icon || '';
    if (iconGrid) {
      Object.keys(PROFILE_ICONS).forEach(key => {
        const icon = PROFILE_ICONS[key];
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'icon-picker-btn' + (key === selectedIcon ? ' selected' : '');
        btn.innerHTML = renderProfileIcon(key, 48);
        btn.setAttribute('aria-label', 'Select ' + icon.label);
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
            ? renderProfileIcon(f.saint_icon, 36)
            : '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
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
    const auditEntries = pageEl.querySelector('[data-audit-entries]');
    if (auditEntries) {
      try {
        const log = await DataStore.getMyAuditLog();
        if (log && log.length > 0) {
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
  window.Theme = Theme;
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
