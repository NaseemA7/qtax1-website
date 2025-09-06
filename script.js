window.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('yr');
  if (el) el.textContent = new Date().getFullYear();

  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('.main-nav');

  if (!hamburger || !nav) return;

  if (!nav.id) nav.id = 'main-nav';
  hamburger.setAttribute('aria-controls', nav.id);
  hamburger.setAttribute('aria-expanded', 'false');

  const openMenu = () => {
    hamburger.classList.add('active');
    nav.classList.add('active');
    document.body.classList.add('nav-open');
    hamburger.setAttribute('aria-expanded', 'true');
  };

  const closeMenu = () => {
    hamburger.classList.remove('active');
    nav.classList.remove('active');
    document.body.classList.remove('nav-open');
    hamburger.setAttribute('aria-expanded', 'false');
  };

  const toggleMenu = () => {
    if (hamburger.classList.contains('active')) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  hamburger.addEventListener('click', toggleMenu);

  nav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') closeMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('active')) closeMenu();
  });

  document.addEventListener('click', (e) => {
    if (!nav.classList.contains('active')) return;
    if (!nav.contains(e.target) && !hamburger.contains(e.target)) closeMenu();
  });
});
