lucide.createIcons();
const menu = document.getElementById('mobile-menu');
const toggle = document.getElementById('menu-toggle');
toggle.addEventListener('click', () => { const open = menu.classList.contains('hidden'); menu.classList.toggle('hidden', !open); toggle.setAttribute('aria-expanded', String(open)); });
const grid = document.getElementById('stories-grid');
const search = document.querySelector('input[type="search"]');
const categoryButtons = [...document.querySelectorAll('[aria-label="Categorías de cuentos"] button')];
let stories = [];
let selectedCategory = 'all';
function drawStories() {
  const query = search.value.trim().toLocaleLowerCase('es');
  const visible = stories.filter(story => (selectedCategory === 'all' || story.categories.includes(selectedCategory)) &&
    (story.title.toLocaleLowerCase('es').includes(query) || (story.summary || '').toLocaleLowerCase('es').includes(query)));
  grid.replaceChildren();
  visible.forEach(story => {
    const card = document.createElement('article');
    card.className = 'soft-card overflow-hidden rounded-3xl bg-white';
    const cover = document.createElement('div');
    cover.className = 'book-cover flex items-center justify-center bg-gradient-to-br from-[#d7eff3] to-[#75c9dc] text-7xl';
    cover.textContent = story.cover_emoji || '📖';
    cover.setAttribute('aria-hidden', 'true');
    const body = document.createElement('div'); body.className = 'p-5';
    const category = document.createElement('span'); category.className = 'mb-2 inline-block rounded-full bg-[#e5f5ef] px-3 py-1 text-sm font-extrabold text-[#168c65]';
    category.textContent = story.categories.join(', ') || 'Cuento';
    const title = document.createElement('h3'); title.className = 'text-xl font-bold text-[#075985]'; title.textContent = story.title;
    const summary = document.createElement('p'); summary.className = 'mt-2 text-[#315c6e]'; summary.textContent = story.summary || 'Una aventura te espera.';
    body.append(category, title, summary); card.append(cover, body); grid.append(card);
  });
  if (!visible.length) { const message = document.createElement('p'); message.className = 'text-[#315c6e]'; message.textContent = 'No hay cuentos que coincidan con tu búsqueda.'; grid.append(message); }
}
categoryButtons.forEach((button, index) => button.addEventListener('click', () => {
  selectedCategory = index === 0 ? 'all' : button.textContent.trim();
  categoryButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  drawStories();
}));
search.addEventListener('input', drawStories);
fetch('api/index.php?action=stories', { credentials: 'same-origin' }).then(response => {
  if (!response.ok) throw new Error('No se pudieron cargar los cuentos.');
  return response.json();
}).then(data => { stories = data.stories.map(story => ({ ...story, categories: (story.categories || '').split(',').filter(Boolean) })); drawStories(); })
  .catch(error => { console.error(error); });
