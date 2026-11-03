/* La selección depende de la página, también al entrar a un capítulo o a un ancla. */
(() => {
  const page = location.pathname.split('/').pop() || 'index.html';
  const section = /^cuento/.test(page) ? 'cuentos.html' : page;
  document.querySelectorAll('.site-header .nav-link').forEach(link => {
    const active = link.getAttribute('href') === section;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;
  function close() { menu.classList.add('hidden'); toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Abrir menú'); }
  toggle.addEventListener('click', () => {
    const open = menu.classList.contains('hidden');
    menu.classList.toggle('hidden', !open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { close(); toggle.focus(); }
  });
})();
