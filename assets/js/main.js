/* 4D Eventos — interações da landing page */
(function () {
  'use strict';

  /* ---------- Configuração ----------
     FORM_ENDPOINT: URL que recebe o POST do formulário (ex.: endpoint do
     Contact Form 7 via REST, webhook do CRM, Formspree...). Vazio = modo demo. */
  var FORM_ENDPOINT = '';

  /* TROCAR: IDs do YouTube com o aftermovie de cada convenção */
  var CASES = [
    { name: 'CREDFRANCO', sub: 'Convenção · Projeto completo 4D', video: 'DgaDGvrbl8g' },
    { name: 'X3 Promotora', sub: 'Convenção · Projeto completo 4D', video: 'lPLV1QcLKng' }
  ];

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Nav ---------- */
  var nav = document.querySelector('.nav');
  var toggle = document.querySelector('.nav__toggle');

  function onScroll() { nav.classList.toggle('is-scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });
  nav.querySelectorAll('.nav__links a').forEach(function (a) {
    a.addEventListener('click', function () {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Revelar ao rolar ---------- */
  var toReveal = document.querySelectorAll('.reveal, .ros__item');
  // escalonamento dentro de cada grupo
  document.querySelectorAll('.pains__list, .ros__list, .about__proofs, .impact, .hero__copy').forEach(function (group) {
    group.querySelectorAll('.reveal').forEach(function (el, i) { el.style.setProperty('--d', (i * 0.09) + 's'); });
  });

  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    toReveal.forEach(function (el) { io.observe(el); });
  } else {
    toReveal.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Cases + player ---------- */
  var player = document.querySelector('.player');
  var screen = player.querySelector('.player__screen');
  var posterHTML = screen.innerHTML;
  var tabs = document.querySelectorAll('.case-tab');
  var current = 0;

  function bindPoster() {
    var poster = screen.querySelector('.player__poster');
    if (poster) poster.addEventListener('click', play);
  }

  function play() {
    var id = CASES[current].video;
    screen.classList.add('is-playing');
    screen.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id +
      '?autoplay=1&rel=0&modestbranding=1" title="Vídeo do case ' + CASES[current].name +
      '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
  }

  function selectCase(i) {
    if (i === current && screen.querySelector('.player__poster')) return;
    current = i;
    tabs.forEach(function (t, k) {
      t.classList.toggle('is-active', k === i);
      t.setAttribute('aria-selected', k === i);
    });
    player.classList.add('is-switching');
    setTimeout(function () {
      screen.innerHTML = posterHTML;
      screen.classList.remove('is-playing');
      screen.querySelector('.player__title').textContent = CASES[i].name;
      screen.querySelector('.player__sub').textContent = CASES[i].sub;
      screen.dataset.video = CASES[i].video;
      bindPoster();
      requestAnimationFrame(function () { player.classList.remove('is-switching'); });
    }, reduceMotion ? 0 : 220);
  }

  tabs.forEach(function (t, i) { t.addEventListener('click', function () { selectCase(i); }); });
  bindPoster();

  /* ---------- Formulário ---------- */
  var form = document.getElementById('form-evento');
  var status = form.querySelector('.form__status');
  var phone = form.querySelector('[name="your-phone"]');

  phone.addEventListener('input', function () {
    var d = phone.value.replace(/\D/g, '').slice(0, 11);
    var out = d;
    if (d.length > 2) out = '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length > 7) out = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(-4);
    phone.value = out;
  });

  function fieldOf(el) { return el.closest('.field') || el.closest('.check'); }

  form.addEventListener('change', function (e) {
    var f = fieldOf(e.target);
    if (f) f.classList.remove('is-invalid');
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var firstBad = null;
    var seen = {};
    form.querySelectorAll('[required]').forEach(function (el) {
      var ok;
      if (el.type === 'radio') {
        if (seen[el.name]) return;
        seen[el.name] = true;
        ok = !!form.querySelector('[name="' + el.name + '"]:checked');
      } else if (el.type === 'checkbox') {
        ok = el.checked;
      } else {
        ok = el.value.trim() !== '' && el.checkValidity();
      }
      var f = fieldOf(el);
      if (f) f.classList.toggle('is-invalid', !ok);
      if (!ok && !firstBad) firstBad = el;
    });

    if (firstBad) {
      status.className = 'form__status is-err';
      status.textContent = 'Confira os campos destacados para continuar.';
      firstBad.focus({ preventScroll: true });
      fieldOf(firstBad).scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      return;
    }

    var btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    status.className = 'form__status';
    status.textContent = 'Enviando…';

    var done = function () {
      status.className = 'form__status is-ok';
      status.textContent = 'Recebemos seu pedido! Nosso time entra em contato em breve com os próximos passos.';
      form.reset();
      btn.disabled = false;
    };
    var fail = function () {
      status.className = 'form__status is-err';
      status.textContent = 'Não foi possível enviar agora. Tente novamente ou fale com a gente pelo WhatsApp.';
      btn.disabled = false;
    };

    if (!FORM_ENDPOINT) { setTimeout(done, 600); return; }
    fetch(FORM_ENDPOINT, { method: 'POST', body: new FormData(form) })
      .then(function (r) { r.ok ? done() : fail(); })
      .catch(fail);
  });

  /* ---------- Ano no rodapé ---------- */
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})();
