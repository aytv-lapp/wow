(() => {
  const id = document.body.dataset.storyId;
  const story = window.WowStories.find(s => s.id === id);
  if (!story) return;
  const chapter = Number(document.body.dataset.chapter);
  if (chapter) window.WowProgress.openChapter(id, chapter);
  document.querySelectorAll('[data-chapter-next]').forEach(link => link.addEventListener('click', () => window.WowProgress.finishChapter(id, chapter)));
  const favorite = document.querySelector('[data-favorite]');
  const resume = document.querySelector('[data-resume]');
  const finish = document.querySelector('[data-finish-story]');
  function update() {
    const saved = window.WowProgress.snapshot().stories[id];
    if (favorite) {
      favorite.setAttribute('aria-pressed', String(Boolean(saved?.favorite)));
      favorite.textContent = saved?.favorite ? '♥ En mis favoritos' : '♡ Guardar como favorito';
    }
    if (resume && saved?.lastChapter) {
      resume.href = story.chapterPrefix + saved.lastChapter + '.html';
      resume.textContent = saved.completedAt ? 'Volver a leer →' : `Continuar: capítulo ${saved.lastChapter} →`;
    }
    if (finish && saved?.completedAt) finish.textContent = 'Cuento terminado · Ir a las actividades →';
  }
  favorite?.addEventListener('click', () => window.WowProgress.toggleFavorite(id));
  finish?.addEventListener('click', () => {
    const complete = window.WowProgress.finishChapter(id, chapter);
    const note = document.querySelector('[data-reading-status]');
    note.replaceChildren();
    const message = document.createElement('p');
    const link = document.createElement('a');
    link.className = 'luna-button';
    if (complete) {
      message.textContent = '¡Una aventura más en tu recorrido! ¿Resolvemos el misterio del cuento?';
      link.href = `actividades.html?cuento=${id}#misterio`; link.textContent = 'Resolver el misterio →';
    } else {
      const saved = window.WowProgress.snapshot().stories[id];
      const missing = Array.from({ length: story.chapters }, (_, i) => i + 1).find(n => !saved.chapters.includes(n));
      message.textContent = 'Guardamos este capítulo. Todavía te quedan capítulos por terminar para completar el cuento.';
      link.href = `${story.chapterPrefix}${missing}.html`; link.textContent = `Leer capítulo ${missing} →`;
    }
    note.append(message, link);
    note.focus();
  });
  window.addEventListener('wow:progress', update);
  update();
})();
