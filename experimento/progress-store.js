/* Persistencia local. La interfaz pública no depende de las pantallas ni de PHP. */
(() => {
  const catalog = window.WowStories;
  const activityIds = new Set(catalog.flatMap(s => [`quiz:${s.id}`, ...s.words.map(w => `word:${w.word}`)]));
  let context = { tutorId: null, learnerId: null };
  const key = () => 'wow:progress:v1:' + JSON.stringify([context.tutorId, context.learnerId]);
  const fresh = () => ({ version: 1, stories: {}, activities: {}, updatedAt: null });
  let data = fresh();
  let persistent = true;
  const memory = new Map();
  function clean(raw) {
    const result = fresh();
    if (!raw || raw.version !== 1) return result;
    catalog.forEach(s => {
      const record = raw.stories?.[s.id];
      if (!record || typeof record !== 'object') return;
      const chapters = [...new Set((Array.isArray(record.chapters) ? record.chapters : []).filter(n => Number.isInteger(n) && n > 0 && n <= s.chapters))];
      result.stories[s.id] = {
        chapters, lastChapter: Number.isInteger(record.lastChapter) && record.lastChapter > 0 && record.lastChapter <= s.chapters ? record.lastChapter : null,
        favorite: record.favorite === true, completedAt: chapters.length === s.chapters && typeof record.completedAt === 'string' ? record.completedAt : null
      };
    });
    for (const id of activityIds) {
      if (typeof raw.activities?.[id] === 'string') result.activities[id] = raw.activities[id];
    }
    result.updatedAt = typeof raw.updatedAt === 'string' ? raw.updatedAt : null;
    return result;
  }
  function load() {
    persistent = true;
    try { data = clean(JSON.parse(localStorage.getItem(key()) || 'null')); }
    catch { data = clean(memory.get(key())); persistent = false; }
  }
  const snapshot = () => JSON.parse(JSON.stringify({ ...data, context, persistent }));
  function save() {
    data.updatedAt = new Date().toISOString();
    memory.set(key(), JSON.parse(JSON.stringify(data)));
    try { localStorage.setItem(key(), JSON.stringify(data)); persistent = true; }
    catch { persistent = false; }
    window.dispatchEvent(new CustomEvent('wow:progress', { detail: snapshot() }));
  }
  function record(id) {
    if (!catalog.some(s => s.id === id)) throw new Error('Cuento desconocido.');
    return data.stories[id] ||= { chapters: [], lastChapter: null, favorite: false, completedAt: null };
  }
  function validChapter(id, chapter) {
    const story = catalog.find(s => s.id === id);
    return story && Number.isInteger(chapter) && chapter >= 1 && chapter <= story.chapters;
  }
  window.WowProgress = {
    snapshot,
    // El futuro inicio de sesión debe llamar esto con IDs estables del tutor y del menor.
    // Los avances de invitado no se mezclan ni se asignan automáticamente a una cuenta.
    setContext(tutorId = null, learnerId = null) {
      if ((tutorId === null) !== (learnerId === null)) throw new Error('Se necesitan ambos identificadores.');
      context = { tutorId: tutorId === null ? null : String(tutorId), learnerId: learnerId === null ? null : String(learnerId) };
      load();
      window.dispatchEvent(new CustomEvent('wow:progress', { detail: snapshot() }));
    },
    openChapter(id, chapter) { if (validChapter(id, chapter)) { record(id).lastChapter = chapter; save(); } },
    finishChapter(id, chapter) {
      if (!validChapter(id, chapter)) return false;
      const value = record(id);
      if (!value.chapters.includes(chapter)) value.chapters.push(chapter);
      const story = catalog.find(s => s.id === id);
      if (value.chapters.length === story.chapters) value.completedAt ||= new Date().toISOString();
      save();
      return Boolean(value.completedAt);
    },
    toggleFavorite(id) { const value = record(id); value.favorite = !value.favorite; save(); return value.favorite; },
    completeActivity(id) { if (activityIds.has(id) && !data.activities[id]) { data.activities[id] = new Date().toISOString(); save(); } }
  };
  load();
  window.addEventListener('storage', event => {
    if (event.key === key() || event.key === null) {
      load();
      window.dispatchEvent(new CustomEvent('wow:progress', { detail: snapshot() }));
    }
  });
})();
