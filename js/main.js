(function () {
  'use strict';

  var CALENDLY_URL = 'https://calendly.com/content-chameleon/30min?hide_gdpr_banner=1';

  /* Edition date — the masthead always shows today's date */
  var today = document.getElementById('today');
  if (today) {
    var now = new Date();
    try {
      var s = new Intl.DateTimeFormat('uk-UA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        .format(now).replace(/\s*р\.$/, '');
      today.textContent = s.charAt(0).toUpperCase() + s.slice(1);
      today.setAttribute('datetime', now.toISOString().slice(0, 10));
    } catch (e) { /* keep static fallback */ }
  }
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  if (!('IntersectionObserver' in window)) return;

  /* Mini masthead on desktop, sticky CTA on mobile — both appear once the masthead is gone
     and hide again while the booking coupon is on screen */
  var topbar = document.getElementById('topbar');
  var mobileCta = document.getElementById('mobile-cta');
  var masthead = document.querySelector('.masthead');
  var book = document.getElementById('book');
  var pastMasthead = false;
  var bookVisible = false;

  function sync() {
    var show = pastMasthead && !bookVisible;
    if (topbar) {
      topbar.classList.toggle('is-visible', pastMasthead);
      topbar.setAttribute('aria-hidden', pastMasthead ? 'false' : 'true');
      topbar.querySelectorAll('a').forEach(function (a) { a.tabIndex = pastMasthead ? 0 : -1; });
    }
    if (mobileCta) mobileCta.classList.toggle('is-visible', show);
  }

  if (masthead) {
    new IntersectionObserver(function (entries) {
      pastMasthead = !entries[0].isIntersecting;
      sync();
    }).observe(masthead);
  }
  if (book) {
    new IntersectionObserver(function (entries) {
      bookVisible = entries[0].isIntersecting;
      sync();
    }, { threshold: 0.05 }).observe(book);
  }

  /* Calendly: loaded only when the reader gets close to the coupon */
  var slot = document.getElementById('calendly-slot');
  if (slot) {
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      var widget = document.createElement('div');
      widget.className = 'calendly-inline-widget';
      widget.setAttribute('data-url', CALENDLY_URL);
      slot.appendChild(widget);
      var script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      script.onload = function () { slot.classList.add('is-loaded'); };
      document.body.appendChild(script);
    }, { rootMargin: '800px 0px' });
    io.observe(slot);
  }

  /* CTA click events for whatever analytics gets installed (GTM dataLayer) */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-cta]');
    if (!el) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'cta_click', cta_location: el.getAttribute('data-cta') });
  });
})();
