(() => {
  const book = window.WowEnglish;
  const select = document.querySelector('[data-reading-language]');
  if (!book || !select) return;

  const { storyId, chapter } = document.body.dataset;
  const key = 'wow:reading-language:' + storyId;
  const url = new URL(location.href);
  const requested = url.searchParams.get('idioma');
  let saved;
  try { saved = localStorage.getItem(key); } catch { /* The URL still carries the choice. */ }
  const language = requested === 'en' || requested === 'es' ? requested : saved;
  select.value = language === 'en' ? 'en' : 'es';
  if (requested === 'en' || requested === 'es') {
    try { localStorage.setItem(key, requested); } catch { /* Optional preference. */ }
  }
  select.addEventListener('change', () => {
    url.searchParams.set('idioma', select.value);
    location.replace(url.href);
  });
  if (select.value !== 'en') return;

  document.body.dataset.readerLocale = 'en';
  const main = document.querySelector('main');
  function setEnglish(selector, value) {
    const element = main.querySelector(selector);
    element.lang = 'en';
    element.textContent = value;
  }

  const list = main.querySelectorAll('.chapter-list a');
  list.forEach((link, index) => {
    const label = link.children[1];
    label.lang = 'en';
    label.textContent = book.chapters[index].title;
  });
  for (const link of main.querySelectorAll('a[href]')) {
    const href = link.getAttribute('href');
    if (href === 'cuento' + storyId + '.html' || href.startsWith('cuento' + storyId + '_cap')) {
      link.href = href + '?idioma=en';
    }
  }

  const popup = document.createElement('div');
  popup.className = 'reading-gloss';
  popup.id = 'reading-gloss';
  popup.setAttribute('role', 'status');
  popup.hidden = true;
  const word = document.createElement('strong');
  word.lang = 'en';
  const meaning = document.createElement('span');
  meaning.lang = 'es';
  popup.append(word, meaning);
  document.body.append(popup);

  let active;
  function closeGloss() {
    active?.setAttribute('aria-expanded', 'false');
    active = null;
    popup.hidden = true;
  }
  function toggleGloss(button, translation) {
    const wasOpen = active === button;
    closeGloss();
    if (wasOpen) return;

    active = button;
    active.setAttribute('aria-expanded', 'true');
    popup.hidden = false;
    word.textContent = button.textContent;
    meaning.textContent = translation;
    const box = button.getBoundingClientRect();
    const width = popup.offsetWidth;
    const height = popup.offsetHeight;
    const left = Math.max(8, Math.min(box.left, document.documentElement.clientWidth - width - 8));
    const top = box.bottom + height + 8 <= window.innerHeight
      ? box.bottom + 6 : Math.max(8, box.top - height - 6);
    popup.style.left = left + 'px';
    popup.style.top = top + 'px';
  }
  document.addEventListener('click', event => {
    if (active && !active.contains(event.target) && !popup.contains(event.target)) closeGloss();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeGloss();
  });
  window.addEventListener('scroll', closeGloss, { passive: true });
  window.addEventListener('resize', closeGloss);

  function paragraph(line) {
    const element = document.createElement('p');
    element.lang = 'en';
    let cursor = 0;
    for (const match of line.matchAll(/\[\[([^|\]]+)\|([^\]]+)\]\]/g)) {
      const [, label, translation] = match;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'reading-word';
      button.textContent = label;
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-controls', popup.id);
      button.addEventListener('click', () => toggleGloss(button, translation));
      element.append(line.slice(cursor, match.index), button);
      cursor = match.index + match[0].length;
    }
    element.append(line.slice(cursor));
    return element;
  }

  const hint = document.createElement('p');
  hint.className = 'reading-hint';
  hint.lang = 'es';
  hint.textContent = 'Toca una palabra o frase subrayada para ver su significado en español.';

  if (chapter) {
    const entry = book.chapters[Number(chapter) - 1];
    document.title = entry.title + ' | World of Words';
    setEnglish('.reader-context a', book.title);
    setEnglish('#chapter-title', entry.title);
    setEnglish('.chapter-heading > p:not(.eyebrow)', entry.lead);
    const body = main.querySelector('.chapter-text');
    body.before(hint);
    body.replaceChildren(...entry.text.split('\n').map(paragraph));
    if (main.querySelector('.story-end')) {
      setEnglish('.story-end h2', 'The End of This Adventure');
      setEnglish('.story-end p', book.reflection);
    }
  } else {
    document.title = book.title + ' | World of Words';
    setEnglish('#story-title', book.title);
    setEnglish('.story-tag', book.tag);
    setEnglish('.story-lead', book.lead);
    setEnglish('.story-themes', book.themes);
    setEnglish('#prologo .eyebrow', book.before);
    setEnglish('#prologue-title', 'Prologue');
    setEnglish('#capitulos .eyebrow', book.route);
    setEnglish('#chapters-title', 'Chapters');
    const prologue = main.querySelector('#prologo');
    prologue.querySelectorAll('p:not(.eyebrow)').forEach(element => element.remove());
    prologue.append(hint, ...book.prologue.split('\n').map(paragraph));
  }
})();
