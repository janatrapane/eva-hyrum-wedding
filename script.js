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
  // Riga is UTC+3 in July (EEST). Target: 2026-07-14T16:00:00+03:00 = 13:00 UTC
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

  // ---------- Copy address for taxi ----------
  const copyBtn = document.getElementById('copy-address');
  if (copyBtn) {
    const addr = 'Buļļu iela 16, Rīga, LV-1007';
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(addr);
        const spans = copyBtn.querySelectorAll('span');
        const originals = Array.from(spans).map((s) => s.textContent);
        spans.forEach((s, i) => {
          s.textContent = s.dataset.lang === 'lv' ? 'Nokopēts!' : 'Copied!';
        });
        setTimeout(() => {
          spans.forEach((s, i) => { s.textContent = originals[i]; });
        }, 1800);
      } catch (e) {
        window.prompt('Copy address:', addr);
      }
    });
  }
})();
