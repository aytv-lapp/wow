
(() => {
  const stories = window.WowStories;
  // Datos ficticios para explorar el panel sin cuentas ni información personal.
  const profiles = [
    { name: 'Mateo', initials: 'M', chapters: { luna: 5, expedicion: 2 }, favorites: ['luna', 'expedicion'] },
    { name: 'Sofía', initials: 'S', chapters: { bruno: 4, expedicion: 6 }, favorites: ['bruno', 'expedicion'] }
  ];

  const byId = id => document.getElementById(id);
  const allButton = byId('family-all');
  const children = byId('family-children');
  const genres = byId('family-genres');
  const books = byId('family-books');
  const previous = byId('family-previous');
  const next = byId('family-next');
  const ring = byId('family-ring');

  function node(tag, value, className) {
    const element = document.createElement(tag);
    if (value) element.textContent = value;
    if (className) element.className = className;
    return element;
  }

  function summarize(selected) {
    let read = 0;
    let total = 0;
    let finished = 0;
    const favorites = new Map();
    for (const profile of selected) {
      for (const story of stories) {
        const chapters = Math.min(profile.chapters[story.id] || 0, story.chapters);
        read += chapters;
        total += story.chapters;
        if (chapters === story.chapters) finished++;
        if (profile.favorites.includes(story.id)) {
          for (const genre of story.categories) favorites.set(genre, (favorites.get(genre) || 0) + 1);
        }
      }
    }
    return { read, total, finished, favorites, percent: total ? Math.round(100 * read / total) : 0 };
  }

  function updateCarousel() {
    previous.disabled = books.scrollLeft <= 1;
    next.disabled = books.scrollWidth - books.clientWidth - books.scrollLeft <= 1;
  }

  function move(direction) {
    const [first, second] = books.children;
    if (!second) return;
    books.scrollBy({ left: direction * (second.offsetLeft - first.offsetLeft) });
  }

  function renderBooks(selected, favorites) {
    const ranked = stories.map(story => ({
      story,
      pending: selected.filter(profile => (profile.chapters[story.id] || 0) < story.chapters).length,
      relevance: story.categories.reduce((sum, genre) => sum + (favorites.get(genre) || 0), 0)
    })).sort((a, b) => b.pending - a.pending || b.relevance - a.relevance);
    books.replaceChildren(...ranked.map(({ story }) => {
      const item = node('li');
      const link = node('a', '', 'family-book');
      link.href = story.href;
      const image = node('img');
      image.src = story.cover_image;
      image.alt = '';
      const label = node('span');
      label.append(node('strong', story.title), node('span', story.categories.join(' · ')));
      link.append(image, label);
      item.append(link);
      return item;
    }));
    books.scrollLeft = 0;
    updateCarousel();
  }

  function render(selectedProfile) {
    const selected = selectedProfile ? [selectedProfile] : profiles;
    const { read, total, finished, favorites, percent } = summarize(selected);
    allButton.setAttribute('aria-pressed', String(!selectedProfile));
    cards.forEach((card, index) => card.setAttribute('aria-pressed', String(profiles[index] === selectedProfile)));
    byId('family-current').textContent = selectedProfile ? 'Mostrando el avance de ' + selectedProfile.name : 'Mostrando el avance de toda la familia';
    byId('family-percent').textContent = percent + ' %';
    byId('family-chapters').textContent = read + ' de ' + total;
    byId('family-finished').textContent = finished;
    ring.setAttribute('aria-label', percent + ' por ciento de capítulos terminados');
    ring.style.setProperty('--progress', percent + '%');

    const rankedGenres = [...favorites].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'es'));
    genres.replaceChildren(...rankedGenres.map(([genre, count]) => {
      const item = node('li');
      item.append(node('strong', genre), node('span', count + (count === 1 ? ' favorito' : ' favoritos')));
      return item;
    }));
    if (!rankedGenres.length) genres.append(node('li', 'Aún no hay géneros favoritos.'));
    renderBooks(selected, favorites);
  }

  const cards = profiles.map(profile => {
    const { read, total, percent } = summarize([profile]);
    const card = node('button', '', 'family-child');
    card.type = 'button';
    card.setAttribute('aria-label', 'Ver el avance de ' + profile.name);
    const heading = node('span', '', 'family-child-header');
    const avatar = node('span', profile.initials, 'family-avatar');
    avatar.setAttribute('aria-hidden', 'true');
    heading.append(avatar, node('strong', profile.name));
    const meta = node('span', '', 'family-child-meta');
    meta.append(node('span', read + ' de ' + total + ' capítulos'), node('strong', percent + ' %'));
    const bar = node('progress');
    bar.max = total;
    bar.value = read;
    bar.setAttribute('aria-hidden', 'true');
    card.append(heading, meta, bar);
    card.addEventListener('click', () => render(profile));
    return card;
  });

  children.append(...cards);
  allButton.addEventListener('click', () => render(null));
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  books.addEventListener('scroll', updateCarousel, { passive: true });
  window.addEventListener('resize', updateCarousel);
  render(null);
})();
