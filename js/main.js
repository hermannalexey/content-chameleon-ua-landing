(function () {
  'use strict';

  var CALENDLY_URL = 'https://calendly.com/content-chameleon/30min?hide_gdpr_banner=1';

  /* Edition date in the colophon — always today's date */
  var today = document.getElementById('today');
  if (today) {
    var now = new Date();
    try {
      var s = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })
        .format(now).replace(/\s*р\.$/, '');
      today.textContent = s;
      today.setAttribute('datetime', now.toISOString().slice(0, 10));
    } catch (e) { /* keep static fallback */ }
  }
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* CTA click events for whatever analytics gets installed (GTM dataLayer) */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-cta]');
    if (!el) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'cta_click', cta_location: el.getAttribute('data-cta') });
  });

  if (!('IntersectionObserver' in window)) return;

  /* Page indicator ("с. 4") and current nav link follow the screen in the middle of the viewport */
  var pageNo = document.getElementById('page-no');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.bar__nav a'));
  var screens = document.querySelectorAll('.screen[data-page]');
  var mobileCta = document.getElementById('mobile-cta');

  var pageObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      if (pageNo) pageNo.textContent = 'с. ' + el.getAttribute('data-page');
      navLinks.forEach(function (a) {
        a.classList.toggle('is-current', a.getAttribute('href') === '#' + el.id);
      });
      /* sticky mobile CTA hides on the hero (it has its own buttons) and on the booking screen */
      if (mobileCta) mobileCta.classList.toggle('is-visible', el.id !== 'top' && el.id !== 'book');
    });
  }, { rootMargin: '-50% 0px -50% 0px' });
  screens.forEach(function (el) { pageObserver.observe(el); });

  /* Calendly: loaded only when the reader gets close to the booking screen */
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
})();
