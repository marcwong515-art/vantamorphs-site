/* VANTAMORPHS — shared site behaviour: mobile menu, nav dropdown, photo lightbox */
(function () {
  'use strict';

  /* ---------- Mobile menu ---------- */
  var navToggle = document.getElementById('navToggle');
  var mobileMenu = document.getElementById('mobileMenu');
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open);
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', false);
      });
    });
  }

  /* ---------- Nav dropdown (hover on desktop, tap on touch) ---------- */
  document.querySelectorAll('.nav-item.has-drop').forEach(function (item) {
    var trigger = item.querySelector('.drop-trigger');
    var close = function () { item.classList.remove('open'); trigger.setAttribute('aria-expanded', false); };
    var open = function () { item.classList.add('open'); trigger.setAttribute('aria-expanded', true); };
    item.addEventListener('mouseenter', open);
    item.addEventListener('mouseleave', close);
    // keyboard
    item.addEventListener('focusin', open);
    item.addEventListener('focusout', function (e) {
      if (!item.contains(e.relatedTarget)) close();
    });
    // touch: first tap opens instead of following the link
    trigger.addEventListener('click', function (e) {
      if (matchMedia('(hover: none)').matches && !item.classList.contains('open')) {
        e.preventDefault(); open();
      }
    });
    document.addEventListener('click', function (e) { if (!item.contains(e.target)) close(); });
  });

  /* ---------- Lightbox ---------- */
  var data = window.VM_ANIMALS;
  var lb = document.getElementById('lb');
  if (!data || !lb) return;

  var img = document.getElementById('lbImg');
  var nameEl = document.getElementById('lbName');
  var countEl = document.getElementById('lbCount');
  var strip = document.getElementById('lbStrip');
  var BASE = 'assets/animals/';
  var animal = null, pos = 0, lastFocus = null;

  function render() {
    var photos = animal.photos;
    img.src = BASE + photos[pos];
    img.alt = animal.name + ' — photo ' + (pos + 1) + ' of ' + photos.length;
    nameEl.textContent = animal.name;
    countEl.textContent = (pos + 1) + ' / ' + photos.length;
    strip.querySelectorAll('button').forEach(function (b, i) {
      b.classList.toggle('is-active', i === pos);
      if (i === pos && b.scrollIntoView) b.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    });
    var single = photos.length < 2;
    document.getElementById('lbPrev').hidden = single;
    document.getElementById('lbNext').hidden = single;
    strip.hidden = single;
  }

  function go(step) {
    var n = animal.photos.length;
    pos = (pos + step + n) % n;
    render();
  }

  function open(i) {
    animal = data[i]; pos = 0;
    lastFocus = document.activeElement;
    strip.innerHTML = '';
    animal.photos.forEach(function (p, k) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Photo ' + (k + 1));
      var t = document.createElement('img');
      t.src = BASE + p; t.alt = ''; t.loading = 'lazy';
      b.appendChild(t);
      b.addEventListener('click', function () { pos = k; render(); });
      strip.appendChild(b);
    });
    render();
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    document.getElementById('lbClose').focus();
  }

  function close() {
    lb.hidden = true;
    document.body.style.overflow = '';
    img.src = '';
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll('.animal-card').forEach(function (c) {
    c.addEventListener('click', function () { open(+c.dataset.i); });
  });
  document.getElementById('lbClose').addEventListener('click', close);
  document.getElementById('lbPrev').addEventListener('click', function () { go(-1); });
  document.getElementById('lbNext').addEventListener('click', function () { go(1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });

  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === 'ArrowRight') go(1);
  });

  /* swipe */
  var x0 = null, y0 = null;
  lb.addEventListener('touchstart', function (e) {
    x0 = e.changedTouches[0].clientX; y0 = e.changedTouches[0].clientY;
  }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    var dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
    x0 = y0 = null;
  }, { passive: true });
})();
