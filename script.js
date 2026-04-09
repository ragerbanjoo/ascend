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
      this.apply(saved || 'dark');
    },
    apply(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.content = theme === 'light' ? '#f7f4ec' : '#060d1a';
    },
    async toggle() {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
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

    async function render() {
      const list = await Storage.get('intentions:list', []);
      stage.innerHTML = '';
      if (!list.length) {
        stage.innerHTML = '<div class="intentions-empty">Be the first to share a prayer intention. It will drift gently across the night sky for all to pray with.</div>';
        return;
      }
      list.slice().reverse().slice(0, 14).forEach((it, idx) => {
        const el = document.createElement('div');
        el.className = 'intention-card';
        const top = 10 + ((idx * 73) % 72);
        const left = 4 + ((idx * 109) % 84);
        el.style.top = top + '%';
        el.style.left = left + '%';
        el.style.animationDelay = -(idx * 2.4) + 's';
        el.style.animationDuration = (18 + (idx % 6) * 2) + 's';
        el.textContent = '“' + it.text + '”';
        stage.appendChild(el);
      });
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
          <p class="text-mute" style="font-size:0.8125rem; margin-top:0.5rem;">Times below reflect Option ${option} · ${option === 'A' ? 'Full Experience' : 'Sustainable Plan'}</p>
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

    wizard.innerHTML = `
      <div class="ob-inner">
        <div class="ob-progress" aria-hidden="true">
          <span class="ob-dot active"></span>
          <span class="ob-dot"></span>
          <span class="ob-dot"></span>
          <span class="ob-dot"></span>
          <span class="ob-dot"></span>
        </div>

        <div class="ob-step active" data-ob-step="1">
          <span class="eyebrow">Step 1 of 5</span>
          <h2>Add to your home screen</h2>
          <p class="lede">This site is your retreat guide. Pin it to your home screen for quick access all weekend.</p>
          ${installHTML}
          <div class="ob-actions">
            <button type="button" class="btn btn-ghost" data-ob-next>Skip</button>
            <button type="button" class="btn btn-primary" data-ob-next>Next</button>
          </div>
        </div>

        <div class="ob-step" data-ob-step="2">
          <span class="eyebrow">Step 2 of 5</span>
          <h2>Option A: The Full Experience</h2>
          <div class="ob-time-blocks">
            <div class="ob-time-block">
              <span class="ob-time">3:45 AM</span>
              <span class="ob-time-label">Depart from St. Juan Diego Parish, Tieton</span>
            </div>
            <div class="ob-time-block">
              <span class="ob-time">6:30 AM</span>
              <span class="ob-time-label">Arrive in Edmonds for breakfast</span>
            </div>
            <div class="ob-time-block">
              <span class="ob-time">7:00 AM</span>
              <span class="ob-time-label">Eucharistic Adoration &amp; Confession at Holy Rosary</span>
            </div>
            <div class="ob-time-block">
              <span class="ob-time">9:00 AM</span>
              <span class="ob-time-label">ASCEND conference opens in Bellevue</span>
            </div>
          </div>
          <p class="ob-desc">This option includes an early-morning hour of Eucharistic Adoration before ASCEND begins. It's the full spiritual experience — Adoration, Confession, and then the conference. It means a very early start, but it's the way to get the most out of the day.</p>
          <div class="ob-actions">
            <button type="button" class="btn btn-ghost" data-ob-prev>Back</button>
            <button type="button" class="btn btn-primary" data-ob-next>Next</button>
          </div>
        </div>

        <div class="ob-step" data-ob-step="3">
          <span class="eyebrow">Step 3 of 5</span>
          <h2>Option B: Straight to ASCEND</h2>
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
          <p class="ob-desc">This option lets you sleep a bit more and head straight to the conference. You'll still arrive with time to settle in before the opening session. No pre-conference Adoration, but the day is still packed with powerful speakers, worship, and Holy Mass.</p>
          <div class="ob-actions">
            <button type="button" class="btn btn-ghost" data-ob-prev>Back</button>
            <button type="button" class="btn btn-primary" data-ob-next>Next</button>
          </div>
        </div>

        <div class="ob-step" data-ob-step="4">
          <span class="eyebrow">Step 4 of 5</span>
          <h2>Choose your departure</h2>
          <p class="lede">Which option works best for you?</p>
          <div class="ob-choices">
            <button type="button" class="ob-choice" data-ob-option="A" aria-pressed="false">
              <h3>Option A — The Full Experience</h3>
              <p class="ob-choice-sub">Depart 3:45 AM &middot; Adoration + ASCEND</p>
              <span class="ob-choice-tag">Recommended</span>
            </button>
            <button type="button" class="ob-choice" data-ob-option="B" aria-pressed="false">
              <h3>Option B — Straight to ASCEND</h3>
              <p class="ob-choice-sub">Depart 5:30 AM &middot; Arrive for opening</p>
            </button>
          </div>
          <p class="ob-note">You can change this anytime on the Timeline page.</p>
          <div class="ob-actions">
            <button type="button" class="btn btn-ghost" data-ob-prev>Back</button>
            <button type="button" class="btn btn-primary" data-ob-next data-ob-require-option disabled>Next</button>
          </div>
        </div>

        <div class="ob-step" data-ob-step="5">
          <span class="eyebrow">Step 5 of 5</span>
          <h2>Choose your look</h2>
          <p class="lede">Pick a theme. You can switch anytime from the menu.</p>
          <div class="ob-theme-cards">
            <button type="button" class="ob-theme-choice" data-ob-theme="dark" aria-pressed="true">
              <div class="ob-theme-preview ob-preview-dark"></div>
              <span>Dark</span>
            </button>
            <button type="button" class="ob-theme-choice" data-ob-theme="light" aria-pressed="false">
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
      if (n < 1 || n > 5) return;
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
        const theme = document.documentElement.getAttribute('data-theme') || 'dark';
        await Theme.set(theme);
        await Storage.set('onboarding:complete', true, { shared: false });
        wizard.classList.add('closing');
        setTimeout(() => { wizard.remove(); resolve(); }, 500);
      });
    });
  }

  // -------------------------------------------------------
  // Kick off on DOM ready
  // -------------------------------------------------------
  async function start() {
    await Theme.init();
    await initOnboarding();
    initCountdownChip();
    initBigCountdown();
    initNav();
    initReveal();
    initAnchors();
    initFooter();
    initHeroParticles();
    initRSVP().catch(console.warn);
    initIntentions().catch(console.warn);
    initPrayerLines();
    initTimeline().catch(console.warn);
    initPacking().catch(console.warn);
    initSpeakers();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
