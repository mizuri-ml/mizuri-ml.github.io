'use strict';
(() => {
  const menuButton = document.getElementById('nav-toggle');
  const menu = document.getElementById('site-nav');
  if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
      const opened = menu.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(opened));
      menuButton.setAttribute('aria-label', opened ? 'Cerrar navegación' : 'Abrir navegación');
    });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
    }));
  }

  const search = document.getElementById('article-search');
  if (search) {
    const cards = [...document.querySelectorAll('.searchable-article')];
    const empty = document.getElementById('empty-articles');
    const status = document.getElementById('article-search-status');
    const update = () => {
      const query = search.value.toLocaleLowerCase('es').trim();
      let shown = 0;
      cards.forEach(card => {
        const match = !query || card.textContent.toLocaleLowerCase('es').includes(query);
        card.hidden = !match;
        if (match) shown++;
      });
      if (empty) empty.hidden = shown !== 0;
      if (status) status.textContent = `${shown} publicación${shown === 1 ? '' : 'es'} encontrada${shown === 1 ? '' : 's'}.`;
    };
    search.addEventListener('input', update);
    update();
  }

  const copyLink = document.querySelector('[data-copy-url]');
  if (copyLink) copyLink.addEventListener('click', async () => {
    const feedback = document.querySelector('.copy-feedback');
    try {
      await navigator.clipboard.writeText(window.location.href);
      if (feedback) feedback.textContent = 'Enlace copiado.';
    } catch (_) {
      if (feedback) feedback.textContent = 'No se pudo copiar. Copia la dirección desde el navegador.';
    }
  });

  const progress = document.getElementById('reading-progress');
  if (progress) {
    const updateProgress = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = `${total > 0 ? Math.min(100, Math.max(0, (window.scrollY / total) * 100)) : 0}%`;
    };
    document.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }
})();
