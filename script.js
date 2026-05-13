(function () {
  'use strict';

  // ---------- Language toggle (EN / LV) ----------
  const LANG_KEY = 'eva-hyrum-lang';
  const supported = ['en', 'lv'];

  function setLang(lang) {
    if (!supported.includes(lang)) lang = 'en';
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-lang]').forEach((el) => {
      el.classList.toggle('active', el.dataset.lang === lang);
    });
    document.querySelectorAll('[data-lang-btn]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.langBtn === lang);
    });
    document.querySelectorAll('[data-lang-only]').forEach((el) => {
      const show = el.dataset.langOnly === lang;
      el.hidden = !show;
      if (show && el.classList.contains('reveal')) el.classList.add('in');
    });
    document.querySelectorAll('[data-href-en][data-href-lv]').forEach((el) => {
      const next = lang === 'lv' ? el.dataset.hrefLv : el.dataset.hrefEn;
      if (next) el.setAttribute('href', next);
    });
    try { localStorage.setItem(LANG_KEY, lang); } catch (_) {}
  }

  document.querySelectorAll('[data-lang-btn]').forEach((btn) => {
    btn.addEventListener('click', () => setLang(btn.dataset.langBtn));
  });

  let initial = 'en';
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored && supported.includes(stored)) initial = stored;
    else if ((navigator.language || '').toLowerCase().startsWith('lv')) initial = 'lv';
  } catch (_) {}
  setLang(initial);

  // ---------- Nav scrolled state ----------
  const nav = document.querySelector('.nav');
  function onScroll() {
    if (window.scrollY > 60) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Countdown to 14.07.2026 16:00 Europe/Riga ----------
  const target = new Date('2026-07-14T16:00:00+03:00').getTime();
  const elDays = document.querySelector('[data-cd="days"]');
  const elHours = document.querySelector('[data-cd="hours"]');
  const elMins = document.querySelector('[data-cd="minutes"]');
  const elSecs = document.querySelector('[data-cd="seconds"]');

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      elDays.textContent = '00';
      elHours.textContent = '00';
      elMins.textContent = '00';
      elSecs.textContent = '00';
      return;
    }
    const s = Math.floor(diff / 1000);
    const days = Math.floor(s / 86400);
    const hours = Math.floor((s % 86400) / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;
    elDays.textContent = pad(days);
    elHours.textContent = pad(hours);
    elMins.textContent = pad(minutes);
    elSecs.textContent = pad(seconds);
  }
  tick();
  setInterval(tick, 1000);

  // ---------- Reveal on scroll ----------
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  // ---------- Copy address buttons ----------
  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (_) {}
    document.body.removeChild(ta);
    return ok;
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (_) {}
    }
    return fallbackCopy(text);
  }

  document.querySelectorAll('.copy-address').forEach((btn) => {
    const address = btn.dataset.address;
    if (!address) return;
    btn.addEventListener('click', async () => {
      const ok = await copyText(address);
      const spans = btn.querySelectorAll('span[data-lang]');
      const originals = Array.from(spans).map((s) => s.textContent);
      spans.forEach((s) => {
        if (s.dataset.lang === 'lv') s.textContent = ok ? 'Nokopēts!' : 'Neizdevās';
        else s.textContent = ok ? 'Copied!' : 'Copy failed';
      });
      setTimeout(() => {
        spans.forEach((s, i) => { s.textContent = originals[i]; });
      }, 1800);
      if (!ok) {
        window.prompt('Copy address:', address);
      }
    });
  });
})();
