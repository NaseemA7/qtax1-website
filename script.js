window.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('yr');
  if (el) el.textContent = new Date().getFullYear();
});
