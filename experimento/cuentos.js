window.lucide?.createIcons();
const grid = document.getElementById('stories-grid');
const placeholderCards = [...grid.children].filter(card => card.tagName === 'ARTICLE');
const search = document.querySelector('input[type="search"]');
const categoryButtons = [...document.querySelectorAll('[aria-label="Categorías de cuentos"] button')];
const localStories = window.WowStories;
let stories = [...localStories];
let selectedCategory = 'all';
function drawStories() {
  const query = search.value.trim().toLocaleLowerCase('es');
  const visible = stories.filter(story => (selectedCategory === 'all' || story.categories.includes(selectedCategory)) &&
    (story.title.toLocaleLowerCase('es').includes(query) || (story.summary || '').toLocaleLowerCase('es').includes(query)));
  grid.replaceChildren();
  visible.forEach(story => {
    const card = document.createElement(story.href ? 'a' : 'article');
    card.className = 'soft-card block overflow-hidden rounded-3xl bg-white';
    if (story.href) card.href = story.href;
    const cover = document.createElement('div');
    cover.className = 'book-cover flex items-center justify-center bg-gradient-to-br from-[#d7eff3] to-[#75c9dc] text-7xl';
    if (story.cover_image) {
      const image = document.createElement('img');
      image.src = story.cover_image;
      image.alt = '';
      image.width = 1024;
      image.height = 1536;
      image.className = 'h-80 w-full object-contain bg-[#fff8e8]';
      cover.append(image);
    } else {
      cover.textContent = story.cover_emoji || '📖';
    }
    cover.setAttribute('aria-hidden', 'true');
    const body = document.createElement('div'); body.className = 'p-5';
    const category = document.createElement('span'); category.className = 'mb-2 inline-block rounded-full bg-[#e5f5ef] px-3 py-1 text-sm font-extrabold text-[#168c65]';
    category.textContent = story.categories.join(', ') || 'Cuento';
    const title = document.createElement('h3'); title.className = 'text-xl font-bold text-[#075985]'; title.textContent = story.title;
    if (story.series) {
      const series = document.createElement('p'); series.className = 'mb-2 text-sm font-extrabold text-[#168c65]';
      series.textContent = `${story.series.title} · Libro ${story.series.book} de ${story.series.total}`;
      body.append(series);
    }
    const summary = document.createElement('p'); summary.className = 'mt-2 text-[#315c6e]'; summary.textContent = story.summary || 'Una aventura te espera.';
    body.append(category, title, summary); card.append(cover, body); grid.append(card);
  });
  if (stories.length === localStories.length && selectedCategory === 'all' && !query) {
    grid.append(...placeholderCards);
  }
  if (!visible.length) { const message = document.createElement('p'); message.className = 'text-[#315c6e]'; message.textContent = 'No hay cuentos que coincidan con tu búsqueda.'; grid.append(message); }
}
categoryButtons.forEach((button, index) => button.addEventListener('click', () => {
  selectedCategory = index === 0 ? 'all' : button.textContent.trim();
  categoryButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  drawStories();
}));
search.addEventListener('input', drawStories);
drawStories();
fetch('api/index.php?action=stories', { credentials: 'same-origin' }).then(response => {
  if (!response.ok) throw new Error('No se pudieron cargar los cuentos.');
  return response.json();
}).then(data => {
  const remoteStories = (Array.isArray(data.stories) ? data.stories : [])
    .filter(story => !localStories.some(local => story.slug === local.slug || story.title === local.title))
    .map(story => ({ ...story, categories: Array.isArray(story.categories) ? story.categories : (story.categories || '').split(',').map(category => category.trim()).filter(Boolean) }));
  stories = [...localStories, ...remoteStories];
  drawStories();
})
  .catch(() => { /* La biblioteca local funciona también sin el servicio PHP. */ });
