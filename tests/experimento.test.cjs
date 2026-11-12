const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..', 'experimento');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');

function session(storage = new Map(), unavailable = false) {
  const events = new EventTarget();
  const context = vm.createContext({
    window: { addEventListener: events.addEventListener.bind(events), dispatchEvent: events.dispatchEvent.bind(events) },
    CustomEvent: class extends Event { constructor(type, init) { super(type); this.detail = init.detail; } },
    localStorage: {
      getItem(key) { if (unavailable) throw new Error('Storage denied'); return storage.get(key) || null; },
      setItem(key, value) { if (unavailable) throw new Error('Storage denied'); storage.set(key, value); }
    }
  });
  vm.runInContext(read('story-data.js'), context);
  vm.runInContext(read('progress-store.js'), context);
  return { store: context.window.WowProgress, stories: context.window.WowStories, events, context };
}

test('Opening a chapter does not complete it; all chapters are required', () => {
  const { store } = session();
  store.openChapter('bruno', 4);
  assert.equal(store.snapshot().stories.bruno.chapters.length, 0);
  assert.equal(store.finishChapter('bruno', 4), false);
  for (const n of [1, 2, 3]) store.finishChapter('bruno', n);
  const completedAt = store.snapshot().stories.bruno.completedAt;
  assert.ok(completedAt);
  store.finishChapter('bruno', 4);
  assert.equal(store.snapshot().stories.bruno.chapters.length, 4);
  assert.equal(store.snapshot().stories.bruno.completedAt, completedAt);
});

test('Progress survives a page reload; favorites and activities are unique', () => {
  const storage = new Map();
  const { store } = session(storage);
  store.toggleFavorite('luna');
  store.openChapter('luna', 2);
  store.finishChapter('luna', 1);
  store.completeActivity('word:ZORRO');
  store.completeActivity('word:ZORRO');
  store.completeActivity('quiz:bruno');
  store.completeActivity('quiz:unknown');
  const reloaded = session(storage).store.snapshot();
  assert.equal(reloaded.stories.luna.favorite, true);
  assert.equal(reloaded.stories.luna.lastChapter, 2);
  assert.equal(reloaded.stories.luna.chapters.join(), '1');
  assert.equal(Object.keys(reloaded.activities).length, 2);
  const copy = store.snapshot(); copy.stories.luna.favorite = false;
  assert.equal(store.snapshot().stories.luna.favorite, true);
  assert.equal(store.toggleFavorite('luna'), false);
});

test('Tutor and learner contexts do not mix with guest or other profiles', () => {
  const { store } = session();
  store.completeActivity('word:LUNA');
  store.setContext('tutor-1', 'child-1');
  assert.equal(Object.keys(store.snapshot().activities).length, 0);
  store.completeActivity('quiz:luna');
  store.setContext('tutor-1', 'child-2');
  assert.equal(Object.keys(store.snapshot().activities).length, 0);
  store.setContext('tutor-1', 'child-1');
  assert.equal(Object.keys(store.snapshot().activities).join(), 'quiz:luna');
  store.setContext();
  assert.equal(Object.keys(store.snapshot().activities).join(), 'word:LUNA');
  assert.throws(() => store.setContext('tutor-1'), /ambos/);
});

test('Unavailable and corrupt storage do not break reading or activities', () => {
  const { store } = session(new Map(), true);
  store.completeActivity('word:MAPA');
  assert.equal(store.snapshot().persistent, false);
  assert.ok(store.snapshot().activities['word:MAPA']);
  store.setContext('a', 'b'); store.setContext();
  assert.ok(store.snapshot().activities['word:MAPA']);
  const corrupted = new Map([['wow:progress:v1:[null,null]', '{broken-json']]);
  assert.equal(Object.keys(session(corrupted).store.snapshot().stories).length, 0);
});

test('Stored values are validated; invalid chapters cannot complete a story', () => {
  const raw = { version: 1, stories: { bruno: { chapters: [4, 4, 99, '1', -1], lastChapter: 99, completedAt: 'fake', favorite: 'true' } }, activities: { 'quiz:fake': 'fake' } };
  const storage = new Map([['wow:progress:v1:[null,null]', JSON.stringify(raw)]]);
  const { store } = session(storage);
  assert.equal(store.snapshot().stories.bruno.chapters.join(), '4');
  assert.equal(store.snapshot().stories.bruno.completedAt, null);
  assert.equal(store.snapshot().stories.bruno.favorite, false);
  assert.equal(store.finishChapter('bruno', 0), false);
  assert.equal(store.finishChapter('bruno', 5), false);
  assert.equal(store.finishChapter('unknown', 1), false);
  assert.equal(Object.keys(store.snapshot().activities).length, 0);
});

test('Progress events refresh consumers and other-tab changes reload storage', () => {
  const storage = new Map();
  const { store, events } = session(storage);
  let updates = 0;
  events.addEventListener('wow:progress', () => updates++);
  store.completeActivity('word:FARO');
  session(storage).store.completeActivity('quiz:bruno');
  const changed = new Event('storage'); changed.key = 'wow:progress:v1:[null,null]'; events.dispatchEvent(changed);
  assert.equal(updates, 2);
  assert.ok(store.snapshot().activities['quiz:bruno']);
});

test('Every story has expanded questions, playable vocabulary and grounded writing prompts', () => {
  const { stories } = session();
  const words = new Set();
  for (const story of stories) {
    assert.equal(story.questions.length, 6);
    for (const q of story.questions) {
      assert.equal(q.options.length, 3);
      assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 3);
      assert.equal(new Set(q.options).size, 3);
      assert.ok(q.explanation.length > 0);
    }
    assert.ok(story.words.length >= 6);
    for (const { word, hint } of story.words) {
      assert.match(word, /^[A-ZÁÉÍÓÚÜÑ]{3,14}$/u); assert.ok(hint); assert.ok(!words.has(word)); words.add(word);
    }
    assert.ok(story.imagination.length >= 3);
    assert.equal(new Set(story.imagination.map(p => p.id)).size, story.imagination.length);
    for (const prompt of story.imagination) {
      assert.ok(prompt.prompt && prompt.title && prompt.checklist.length >= 3);
      assert.ok(prompt.chapter >= 1 && prompt.chapter <= story.chapters);
    }
  }
});

test('Imagina drafts and completed responses survive reload without duplicate credit', () => {
  const storage = new Map();
  const { store } = session(storage);
  const id = 'imagine:campanas:carta-simon';
  const text = 'Queridos habitantes de Robledal: pido disculpas por tomar las campanas. Prometo ayudar a reparar la torre.';
  store.completeActivity(id);
  assert.equal(store.snapshot().activities[id], undefined);
  assert.equal(store.saveResponse(id, text), true);
  assert.equal(store.snapshot().activities[id], undefined);
  let reloaded = session(storage).store;
  assert.equal(reloaded.snapshot().responses[id].text, text);
  reloaded.saveResponse(id, text, true);
  const completedAt = reloaded.snapshot().activities[id];
  assert.ok(completedAt);
  reloaded.saveResponse(id, text + '\nHe aprendido a ser honesto.', true);
  assert.equal(reloaded.snapshot().activities[id], completedAt);
  reloaded = session(storage).store;
  assert.equal(Object.keys(reloaded.snapshot().activities).length, 1);
  assert.ok(reloaded.snapshot().responses[id].text.includes('\nHe aprendido'));
  const copy = reloaded.snapshot(); copy.responses[id].text = 'changed';
  assert.notEqual(reloaded.snapshot().responses[id].text, 'changed');
});

test('Imagina rejects empty completion, unknown prompts and oversized or malformed responses', () => {
  const { store } = session();
  const id = 'imagine:emma:plan';
  for (const text of ['', '   ', '\n\t']) assert.equal(store.saveResponse(id, text, true), false);
  assert.equal(store.saveResponse('imagine:emma:unknown', 'Hola', true), false);
  assert.equal(store.saveResponse(id, {}, true), false);
  assert.equal(store.saveResponse(id, 'x'.repeat(10001), true), false);
  assert.equal(Object.keys(store.snapshot().activities).length, 0);
  store.saveResponse(id, 'Ayudaremos al bosque en equipo.', true);
  store.saveResponse(id, '');
  assert.equal(store.snapshot().activities[id], undefined);
  const key = 'wow:progress:v1:[null,null]';
  const raw = { version: 1, activities: { [id]: 'date', 'imagine:emma:unknown': 'date' }, responses: { [id]: { text: 42 }, 'imagine:emma:unknown': { text: 'not a prompt' } } };
  const cleaned = session(new Map([[key, JSON.stringify(raw)]])).store.snapshot();
  assert.equal(Object.keys(cleaned.activities).length, 0);
  assert.equal(Object.keys(cleaned.responses).length, 0);
});

test('Writing stays within learner contexts and works in memory when storage is unavailable', () => {
  for (const unavailable of [false, true]) {
    const { store } = session(new Map(), unavailable);
    const id = 'imagine:emma:especialistas';
    store.saveResponse(id, 'Primero consultaría a los especialistas.', true);
    store.setContext('tutor', 'a');
    assert.equal(store.snapshot().responses[id], undefined);
    store.saveResponse(id, 'Hay seres vivos en el manantial.');
    store.setContext('tutor', 'b');
    assert.equal(store.snapshot().responses[id], undefined);
    store.setContext('tutor', 'a');
    assert.equal(store.snapshot().responses[id].text, 'Hay seres vivos en el manantial.');
    store.setContext();
    assert.ok(store.snapshot().activities[id]);
    assert.equal(store.snapshot().responses[id].text, 'Primero consultaría a los especialistas.');
    assert.equal(store.snapshot().persistent, !unavailable);
  }
});

test('Emma preserves the supplied prologue and all ten complete chapter texts', () => {
  const source = read('content/emma-libro1.md').replaceAll('\r\n', '\n');
  const decode = text => text.replaceAll('&quot;', '"').replaceAll('&gt;', '>').replaceAll('&lt;', '<').replaceAll('&amp;', '&');
  const textOf = html => [...html.matchAll(/<p>([\s\S]*?)<\/p>/g)].map(m => decode(m[1])).join('\n\n');
  const normalize = text => text.trim().replace(/\s+/g, ' ');
  const prologue = source.match(/## Una niña, una brújula y muchos secretos\n([\s\S]*?)\n---/)[1];
  const prologueHtml = read('cuentoemma.html').match(/<h2 id="prologue-title">[^<]+<\/h2>([\s\S]*?)<\/section>/)[1];
  assert.equal(normalize(textOf(prologueHtml)), normalize(prologue));
  const chapters = [...source.matchAll(/^# CAPÍTULO (\d+)\. [^\n]+\n([\s\S]*?)(?=\n---)/gm)];
  assert.equal(chapters.length, 10);
  for (const [, n, text] of chapters) {
    const html = read(`cuentoemma_cap${n}.html`).match(/<div class="chapter-text">([\s\S]*?)<\/div>/)[1];
    assert.equal(normalize(textOf(html)), normalize(text), `Chapter ${n} must preserve the supplied text`);
  }
  const { stories, store } = session();
  const emma = stories.find(s => s.id === 'emma');
  assert.equal(emma.series.book, 1); assert.equal(emma.series.total, 5);
  for (let n = 1; n < 10; n++) assert.equal(store.finishChapter('emma', n), false);
  assert.equal(store.finishChapter('emma', 10), true);
});

test('Local page links, scripts, images and fragment targets exist; IDs are unique', () => {
  for (const file of fs.readdirSync(root).filter(name => name.endsWith('.html'))) {
    const html = read(file);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(new Set(ids).size, ids.length, `${file}: duplicate IDs`);
    for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(https?:|mailto:|tel:|data:)/.test(url)) continue;
      const [pathname, fragment] = url.split('#');
      const target = pathname.split('?')[0];
      if (target) assert.ok(fs.existsSync(path.join(root, target)), `${file}: missing ${url}`);
      if (fragment && !target) assert.ok(ids.includes(fragment), `${file}: missing fragment ${url}`);
    }
  }
});

test('All stories connect prologues, chapter completion and the shared progress store', () => {
  const { stories } = session();
  for (const story of stories) {
    const prologue = read(story.href);
    assert.match(prologue, /id="prologo"/); assert.match(prologue, /data-favorite/); assert.match(prologue, /data-resume/);
    for (let n = 1; n <= story.chapters; n++) {
      const html = read(`${story.chapterPrefix}${n}.html`);
      assert.ok(html.includes(`data-story-id="${story.id}"`)); assert.ok(html.includes(`data-chapter="${n}"`));
      assert.match(html, /reader-progress\.js/);
      assert.match(html, /href="actividades.html"/); assert.match(html, /href="recorrido.html"/);
      assert.ok(html.includes(n === story.chapters ? 'data-finish-story' : 'data-chapter-next'));
    }
  }
  assert.match(read('cuentobruno_cap1.html'), /¡No le gustaba compartir!/);
  assert.match(read('cuentobruno_cap4.html'), /¡La felicidad se hace más grande!/);
});

test('All experiment scripts parse successfully', () => {
  for (const file of fs.readdirSync(root).filter(name => name.endsWith('.js'))) new vm.Script(read(file), { filename: file });
});

test('Finishing out of order offers a visible link to the missing chapter in the selected language', () => {
  for (const locale of ['es', 'en']) {
    const { context } = session();
    let click;
    const finish = { addEventListener: (type, listener) => { click = listener; } };
    const note = { replaceChildren() {}, append(...children) { this.children = children; }, focus() {} };
    context.document = {
      body: { dataset: { storyId: 'luna', chapter: '5', readerLocale: locale } },
      querySelectorAll: () => [],
      querySelector: selector => selector === '[data-finish-story]' ? finish : selector === '[data-reading-status]' ? note : null,
      createElement: () => ({})
    };
    vm.runInContext(read('reader-progress.js'), context);
    click();
    const link = note.children[1];
    assert.equal(link.textContent, 'Leer capítulo 1 →');
    assert.equal(link.href, 'cuentoluna_cap1.html' + (locale === 'en' ? '?idioma=en' : ''));
  }
});

test('Emma fallback cards keep the catalog title and summary without encoding loss', () => {
  const story = session().stories.find(s => s.id === 'emma');
  for (const page of ['index.html', 'cuentos.html']) {
    assert.ok(read(page).includes(story.title), page);
    assert.ok(read(page).includes(story.summary), page);
  }
});
