(() => {
  const stories = window.WowStories;
  const get = id => document.getElementById(id);
  function render() {
    const saved = window.WowProgress.snapshot();
    const finished = stories.filter(s => saved.stories[s.id]?.completedAt);
    const favorites = stories.filter(s => saved.stories[s.id]?.favorite);
    const ongoing = stories.filter(s => saved.stories[s.id]?.lastChapter && !saved.stories[s.id].completedAt);
    const activities = Object.keys(saved.activities);
    get('read-count').textContent = finished.length;
    get('favorite-count').textContent = favorites.length;
    get('activity-count').textContent = activities.length;
    get('discoveries').innerHTML = [
      { title: 'Primera aventura', hint: 'Termina tu primer cuento.', earned: finished.length >= 1, symbol: '✦' },
      { title: 'Mente curiosa', hint: 'Completa una actividad.', earned: activities.length >= 1, symbol: '✿' },
      { title: 'Mundos nuevos', hint: 'Termina dos cuentos diferentes.', earned: finished.length >= 2, symbol: '☀' }
    ].map(b => `<article class="badge ${b.earned ? 'earned' : ''}"><span class="seal" aria-hidden="true">${b.symbol}</span><h3>${b.title}</h3><p>${b.earned ? '¡Descubrimiento conseguido!' : b.hint}</p></article>`).join('');
    function list(target, collection, mode) {
      get(target).replaceChildren();
      collection.forEach(story => {
        const record = saved.stories[story.id];
        const card = document.createElement('article'); card.className = 'journey-card';
        const image = document.createElement('img'); image.src = story.cover_image; image.alt = ''; image.width = 70; image.height = 100;
        const body = document.createElement('div');
        const title = document.createElement('h3'); title.textContent = story.title;
        const description = document.createElement('p'); description.textContent = mode === 'continue' ? `${record.chapters.length} de ${story.chapters} capítulos terminados` : record.completedAt ? 'Cuento terminado · ¡Una aventura para recordar!' : 'Guardado entre tus favoritos';
        const actions = document.createElement('div'); actions.className = 'journey-actions';
        const read = document.createElement('a'); read.href = mode === 'continue' ? `${story.chapterPrefix}${record.lastChapter}.html` : story.href;
        read.textContent = mode === 'continue' ? 'Continuar leyendo →' : 'Volver al cuento →'; actions.append(read);
        if (mode === 'finished') {
          const quiz = document.createElement('a'); quiz.href = `actividades.html?cuento=${story.id}#misterio`;
          quiz.textContent = saved.activities[`quiz:${story.id}`] ? 'Misterio resuelto · Volver a jugar' : 'Resolver su misterio →'; actions.append(quiz);
        }
        body.append(title, description, actions); card.append(image, body); get(target).append(card);
      });
    }
    list('finished-list', finished, 'finished'); list('continue-list', ongoing, 'continue'); list('favorites-list', favorites, 'favorite');
    get('empty-journey').hidden = finished.length > 0;
    get('continue-section').hidden = ongoing.length === 0;
    get('favorites-section').hidden = favorites.length === 0;
    get('activities-section').hidden = activities.length === 0;
    get('completed-activities').replaceChildren();
    activities.forEach(id => {
      const item = document.createElement('li');
      item.textContent = id.startsWith('word:') ? `Palabra descubierta: ${id.slice(5)}` : `Misterio resuelto: ${stories.find(s => s.id === id.slice(5)).title}`;
      get('completed-activities').append(item);
    });
    get('storage-note').textContent = (saved.persistent ? 'Tu recorrido se guarda en este navegador, sin vincularse todavía a una cuenta.' : 'El navegador no permite guardar el recorrido. Tus avances se conservarán solo mientras permanezcas en esta página.') + ' Cada cuento y cada actividad cuentan una sola vez, aunque vuelvas a disfrutarlos.';
  }
  window.addEventListener('wow:progress', render);
  render();
})();
