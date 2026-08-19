(function () {
  'use strict';

  var FULL_BASE = 'https://github.com/janatrapane/eva-hyrum-wedding/releases/download/photos/';
  var INITIAL = 24; // cik bildes rāda nodaļā uzreiz

  // ---------- Valoda ----------
  var supported = ['en', 'lv'];
  function setLang(lang) {
    if (supported.indexOf(lang) === -1) lang = 'en';
    document.documentElement.lang = lang;
    try { localStorage.setItem('eh-lang', lang); } catch (e) {}
    document.querySelectorAll('[data-lang]').forEach(function (el) {
      el.classList.toggle('active', el.dataset.lang === lang);
    });
    document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.langBtn === lang);
    });
  }
  document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      setLang(btn.dataset.langBtn);
    });
  });
  var saved = null;
  try { saved = localStorage.getItem('eh-lang'); } catch (e) {}
  if (location.hash === '#lv') saved = 'lv';
  setLang(saved || ((navigator.language || '').toLowerCase().indexOf('lv') === 0 ? 'lv' : 'en'));

  // ---------- Nav scrolled ----------
  var nav = document.querySelector('.nav');
  function onScroll() {
    if (window.scrollY > 60) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Reveal ----------
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { observer.observe(el); });

  // ---------- Galerija ----------
  var flat = []; // {file, chapter} lightbox navigācijai
  var lightbox = document.getElementById('lightbox');
  var lbImg = document.getElementById('lb-img');
  var lbCounter = document.getElementById('lb-counter');
  var lbDownload = document.getElementById('lb-download');
  var current = -1;

  function thumbUrl(f) { return 'gallery/thumbs/' + encodeURIComponent(f); }
  function previewUrl(f) { return 'gallery/previews/' + encodeURIComponent(f); }
  function fullUrl(f) { return FULL_BASE + encodeURIComponent(f); }

  function openLb(idx) {
    current = idx;
    var f = flat[idx];
    lbImg.src = previewUrl(f);
    lbImg.alt = f;
    lbCounter.textContent = (idx + 1) + ' / ' + flat.length;
    lbDownload.href = fullUrl(f);
    lbDownload.setAttribute('download', f);
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    // priekšielāde blakus bildēm
    [idx - 1, idx + 1].forEach(function (i) {
      if (i >= 0 && i < flat.length) { (new Image()).src = previewUrl(flat[i]); }
    });
  }
  function closeLb() {
    lightbox.hidden = true;
    lbImg.src = '';
    document.body.style.overflow = '';
    current = -1;
  }
  function step(d) {
    if (current < 0) return;
    var n = current + d;
    if (n < 0) n = flat.length - 1;
    if (n >= flat.length) n = 0;
    openLb(n);
  }
  lightbox.querySelector('.lb-close').addEventListener('click', closeLb);
  lightbox.querySelector('.lb-prev').addEventListener('click', function () { step(-1); });
  lightbox.querySelector('.lb-next').addEventListener('click', function () { step(1); });
  lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
  var touchX = null;
  lightbox.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 45) step(dx < 0 ? 1 : -1);
    touchX = null;
  }, { passive: true });

  var lazyObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var img = entry.target;
        img.src = img.dataset.src;
        lazyObs.unobserve(img);
      }
    });
  }, { rootMargin: '400px 0px' });

  function renderChapter(container, chapter) {
    var section = document.createElement('div');
    section.className = 'chapter reveal';
    section.id = 'ch-' + chapter.id;

    var head = document.createElement('div');
    head.className = 'chapter-head';
    var time = document.createElement('span');
    time.className = 'chapter-time';
    time.textContent = chapter.time || '';
    var title = document.createElement('h3');
    title.className = 'chapter-title';
    var tLv = document.createElement('span');
    tLv.dataset.lang = 'lv';
    tLv.textContent = chapter.lv;
    var tEn = document.createElement('span');
    tEn.dataset.lang = 'en';
    tEn.textContent = chapter.en;
    title.appendChild(tLv);
    title.appendChild(tEn);
    var count = document.createElement('span');
    count.className = 'chapter-count';
    count.textContent = chapter.photos.length;
    head.appendChild(time);
    head.appendChild(title);
    head.appendChild(count);
    if (chapter.zips && chapter.zips.length) {
      var zwrap = document.createElement('span');
      zwrap.className = 'chapter-zips';
      chapter.zips.forEach(function (zname, zi) {
        var za = document.createElement('a');
        za.className = 'chapter-zip';
        za.href = FULL_BASE + encodeURIComponent(zname);
        za.setAttribute('download', zname);
        var multi = chapter.zips.length > 1;
        var zlv = document.createElement('span');
        zlv.dataset.lang = 'lv';
        zlv.textContent = multi ? ('⤓ Zip ' + (zi + 1) + '. daļa') : '⤓ Viss zip';
        var zen = document.createElement('span');
        zen.dataset.lang = 'en';
        zen.textContent = multi ? ('⤓ Zip part ' + (zi + 1)) : '⤓ All as zip';
        za.appendChild(zlv);
        za.appendChild(zen);
        zwrap.appendChild(za);
      });
      head.appendChild(zwrap);
    }
    section.appendChild(head);

    var grid = document.createElement('div');
    grid.className = 'photo-grid';
    section.appendChild(grid);

    var shown = 0;
    function addBatch(n) {
      var slice = chapter.photos.slice(shown, shown + n);
      slice.forEach(function (f) {
        var idx = flat.length;
        flat.push(f);
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.setAttribute('aria-label', f);
        var img = document.createElement('img');
        img.loading = 'lazy';
        img.decoding = 'async';
        img.alt = '';
        img.dataset.src = thumbUrl(f);
        lazyObs.observe(img);
        btn.appendChild(img);
        btn.addEventListener('click', function () { openLb(idx); });
        grid.appendChild(btn);
      });
      shown += slice.length;
      if (more) more.style.display = shown >= chapter.photos.length ? 'none' : 'block';
    }

    var more = null;
    if (chapter.photos.length > INITIAL) {
      more = document.createElement('button');
      more.type = 'button';
      more.className = 'chapter-more';
      var mLv = document.createElement('span');
      mLv.dataset.lang = 'lv';
      var mEn = document.createElement('span');
      mEn.dataset.lang = 'en';
      more.appendChild(mLv);
      more.appendChild(mEn);
      function refreshMoreLabel() {
        var left = chapter.photos.length - shown;
        mLv.textContent = 'Rādīt vēl (' + left + ')';
        mEn.textContent = 'Show more (' + left + ')';
      }
      more.addEventListener('click', function () {
        addBatch(48);
        refreshMoreLabel();
        setLang(document.documentElement.lang);
      });
      section.appendChild(more);
      var origAdd = addBatch;
      addBatch = function (n) { origAdd(n); refreshMoreLabel(); };
    }

    addBatch(INITIAL);
    container.appendChild(section);
    observer.observe(section);
  }

  fetch('gallery/manifest.json')
    .then(function (r) { return r.json(); })
    .then(function (m) {
      // ātrā navigācija pa nodaļām
      var nav = document.getElementById('chapter-nav');
      if (nav) {
        m.chapters.forEach(function (ch) {
          if (!ch.photos.length) return;
          var a = document.createElement('a');
          a.href = '#ch-' + ch.id;
          var lv = document.createElement('span');
          lv.dataset.lang = 'lv';
          lv.textContent = ch.lv;
          var en = document.createElement('span');
          en.dataset.lang = 'en';
          en.textContent = ch.en;
          a.appendChild(lv);
          a.appendChild(en);
          nav.appendChild(a);
        });
      }
      var container = document.getElementById('chapters');
      m.chapters.forEach(function (ch) {
        if (ch.photos.length) renderChapter(container, ch);
      });
      setLang(document.documentElement.lang);
    });

  // atgriezties augšā
  var toTop = document.getElementById('to-top');
  if (toTop) {
    window.addEventListener('scroll', function () {
      toTop.classList.toggle('show', window.scrollY > 1400);
    }, { passive: true });
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
