/* El inicio presenta el mismo catálogo que Cuentos y los destinos disponibles. */
(() => {
  window.lucide?.createIcons();
  const stories = window.WowStories;
  const grid = document.getElementById('home-stories');
  const noBooks = document.getElementById('no-books');
  function renderStories(category = 'all') {
    grid.replaceChildren();
    const visible = stories.filter(story => category === 'all' || story.categories.includes(category));
    visible.forEach(story => {
      const card = document.createElement('article'); card.className = 'home-book-card soft-card overflow-hidden rounded-3xl bg-white';
      const cover = document.createElement('a'); cover.href = story.href; cover.className = 'book-cover'; cover.tabIndex = -1; cover.setAttribute('aria-hidden', 'true');
      const image = document.createElement('img'); image.src = story.cover_image; image.alt = ''; image.width = 1024; image.height = 1536; image.loading = 'lazy'; cover.append(image);
      const body = document.createElement('div'); body.className = 'story-card-body';
      const label = document.createElement('p'); label.className = 'story-card-category'; label.textContent = story.categories.join(' · ') + ` · ${story.chapters} capítulos`;
      const title = document.createElement('h3'); title.textContent = story.title;
      if (story.series) {
        const series = document.createElement('p'); series.className = 'story-card-category';
        series.textContent = `${story.series.title} · Libro ${story.series.book} de ${story.series.total}`;
        body.append(series);
      }
      const summary = document.createElement('p'); summary.className = 'story-card-summary'; summary.textContent = story.summary;
      const link = document.createElement('a'); link.className = 'story-card-link'; link.href = story.href; link.textContent = 'Descubrir el cuento →'; link.setAttribute('aria-label', 'Descubrir ' + story.title);
      body.append(label, title, summary, link); card.append(cover, body); grid.append(card);
    });
    noBooks.classList.toggle('hidden', visible.length > 0);
  }
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    renderStories(button.dataset.filter);
    document.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  }));
  document.querySelectorAll('[data-panel]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.feature-panel').forEach(panel => panel.classList.toggle('hidden', panel.id !== button.dataset.panel));
    document.querySelectorAll('[data-panel]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  }));
  renderStories();
})();
