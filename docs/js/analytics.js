(function() {
  var d = document, s = d.createElement('script');
  s.src = 'https://cloud.umami.is/script.js';
  s.setAttribute('data-website-id', '{{UMAMI_WEBSITE_ID}}');
  s.setAttribute('data-auto-track', 'true');
  s.async = true;
  d.head.appendChild(s);
})();
