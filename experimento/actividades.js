(() => {
  const stories = window.WowStories;
  const store = window.WowProgress;
  const dialog = document.getElementById('activity-dialog');
  const content = document.getElementById('game-content');
  const kind = document.getElementById('game-kind');
  const select = document.getElementById('quiz-story');
  const wordSelect = document.getElementById('word-story');
  const imagineSelect = document.getElementById('imagine-story');
  const requested = new URLSearchParams(location.search).get('cuento');
  for (const control of [select, wordSelect, imagineSelect]) {
    control.replaceChildren(...stories.map(story => {
      const option = document.createElement('option'); option.value = story.id; option.textContent = story.title; return option;
    }));
    if (stories.some(s => s.id === requested)) control.value = requested;
  }
  let words = [], imagineStory, promptIndex = 0, activeResponseId = null, responseField = null;
  const responseNote = document.getElementById('response-storage-note');
  function updateStorageNote() {
    responseNote.textContent = store.snapshot().persistent
      ? 'Tus escritos se guardan en este navegador. Puedes volver para continuarlos.'
      : 'Este navegador no permite guardar tus escritos al cerrar la página. Puedes copiarlos para conservarlos.';
  }
  updateStorageNote();
  function saveDraft() {
    if (activeResponseId && responseField) store.saveResponse(activeResponseId, responseField.value);
  }
  let wordIndex = 0, tiles = [], chosen = [], solved = false, quizStory, questionIndex = 0, answered = false;
  function stopSpeech() { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }
  function show() { if (!dialog.open) dialog.showModal(); content.querySelector('h2').focus(); }
  function feedback(message, retry = false) {
    const node = document.getElementById('game-feedback');
    node.textContent = message; node.classList.toggle('retry', retry);
  }
  document.getElementById('close-game').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { stopSpeech(); saveDraft(); activeResponseId = null; responseField = null; });
  dialog.addEventListener('cancel', stopSpeech);
  function newWord() {
    stopSpeech();
    const word = words[wordIndex].word;
    tiles = Array.from(word);
    for (let i = tiles.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [tiles[i], tiles[j]] = [tiles[j], tiles[i]]; }
    if (tiles.join('') === word) tiles.push(tiles.shift());
    chosen = []; solved = false;
    renderWord();
  }
  function renderWord() {
    const entry = words[wordIndex];
    kind.textContent = 'Letras traviesas';
    content.innerHTML = `<p class="eyebrow">Palabra ${wordIndex + 1} de ${words.length} · ${entry.story.title}</p>
      <h2 id="game-title" tabindex="-1">¿Qué palabra se esconde?</h2>
      <div class="word-hint"><p>${entry.hint}</p><button class="tool" id="listen-hint" type="button">Escuchar pista</button></div>
      <div class="letter-slots" role="group" aria-label="Palabra en construcción: ${chosen.map(i => tiles[i]).join(' ') || 'vacía'}">${Array.from(entry.word, (_, i) => `<span class="letter-slot" aria-hidden="true">${chosen[i] === undefined ? '' : tiles[chosen[i]]}</span>`).join('')}</div>
      <div class="letter-tiles" role="group" aria-label="Elige las letras en orden">${tiles.map((letter, i) => `<button type="button" class="letter-tile" data-letter="${i}" aria-label="Añadir letra ${letter}" ${solved || chosen.includes(i) ? 'disabled' : ''}>${letter}</button>`).join('')}</div>
      <div class="game-controls"><button class="tool" id="undo-letter" type="button" ${!chosen.length || solved ? 'disabled' : ''}>Borrar letra</button><button class="tool" id="reset-word" type="button" ${!chosen.length || solved ? 'disabled' : ''}>Empezar de nuevo</button><button class="luna-button" id="check-word" type="button" ${chosen.length !== tiles.length || solved ? 'disabled' : ''}>Comprobar</button></div>
      <p id="game-feedback" class="game-feedback" role="status">${solved ? `¡Lo descubriste! ${entry.word}. Ya está en tu recorrido.` : ''}</p>
      <div class="game-footer"><a href="${entry.story.href}">Encontrarla en el cuento</a><button class="tool" id="another-word" type="button">${solved ? 'Otra palabra' : 'Cambiar palabra'} →</button><a href="recorrido.html">Ver mi recorrido</a></div>`;
    content.querySelectorAll('[data-letter]').forEach(button => button.addEventListener('click', () => {
      chosen.push(Number(button.dataset.letter)); renderWord();
      (content.querySelector('[data-letter]:not(:disabled)') || document.getElementById('check-word')).focus();
    }));
    document.getElementById('undo-letter').onclick = () => {
      const released = chosen.pop(); renderWord(); content.querySelector(`[data-letter="${released}"]`).focus();
    };
    document.getElementById('reset-word').onclick = () => { chosen = []; renderWord(); content.querySelector('[data-letter]').focus(); };
    document.getElementById('check-word').onclick = () => {
      if (chosen.map(i => tiles[i]).join('') !== entry.word) { feedback('Casi. Borra una letra y prueba otro orden. La pista te puede ayudar.', true); return; }
      solved = true; store.completeActivity(`word:${entry.word}`); renderWord(); document.getElementById('another-word').focus();
    };
    document.getElementById('another-word').onclick = () => { wordIndex = (wordIndex + 1) % words.length; newWord(); content.querySelector('h2').focus(); };
    document.getElementById('listen-hint').onclick = () => {
      if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) { feedback('Puedes leer la pista de arriba. Este navegador no tiene narración.'); return; }
      stopSpeech();
      const speech = new SpeechSynthesisUtterance(entry.hint); speech.lang = 'es-MX'; speech.rate = .85;
      speech.onerror = () => feedback('No se pudo escuchar la pista. Puedes leerla arriba.');
      window.speechSynthesis.speak(speech);
    };
  }
  function renderQuiz() {
    kind.textContent = 'Detectives de cuentos';
    answered = false;
    if (questionIndex === quizStory.questions.length) {
      store.completeActivity(`quiz:${quizStory.id}`);
      content.innerHTML = `<div class="game-done"><span class="seal" aria-hidden="true">✦</span><p class="eyebrow">Misterio resuelto</p><h2 id="game-title" tabindex="-1">¡Qué buena aventura!</h2><p>Descubriste los detalles de «${quizStory.title}». Tu actividad ya forma parte de tu recorrido.</p><div class="game-controls"><a class="luna-button" href="recorrido.html">Ver mi recorrido →</a><button class="tool" id="play-again" type="button">Volver a jugar</button></div></div>`;
      document.getElementById('play-again').onclick = () => { questionIndex = 0; renderQuiz(); content.querySelector('h2').focus(); };
      return;
    }
    const question = quizStory.questions[questionIndex];
    content.innerHTML = `<p class="eyebrow">Pregunta ${questionIndex + 1} de ${quizStory.questions.length} · ${quizStory.title}</p><h2 id="game-title" tabindex="-1">${question.question}</h2>
      <div class="quiz-choices" role="group" aria-labelledby="game-title">${question.options.map((option, i) => `<button class="choice" type="button" data-answer="${i}"><b aria-hidden="true">${'ABC'[i]}</b><span>${option}</span></button>`).join('')}</div>
      <p id="game-feedback" class="game-feedback" role="status"></p>
      <div class="game-footer"><a href="${quizStory.href}">Volver al cuento para buscar una pista</a><button id="quiz-next" class="luna-button" type="button" disabled>${questionIndex === quizStory.questions.length - 1 ? 'Terminar actividad' : 'Siguiente pregunta'} →</button></div>`;
    content.querySelectorAll('[data-answer]').forEach(button => button.onclick = () => {
      if (answered) return;
      content.querySelectorAll('[data-answer]').forEach(b => b.classList.remove('wrong'));
      if (Number(button.dataset.answer) !== question.answer) { button.classList.add('wrong'); feedback('Casi. Recuerda el cuento y prueba otra respuesta. Puedes volver a leerlo para encontrar una pista.', true); return; }
      answered = true; button.classList.add('correct');
      content.querySelectorAll('[data-answer]').forEach(b => { b.disabled = true; });
      feedback('¡Lo descubriste! ' + question.explanation);
      const next = document.getElementById('quiz-next'); next.disabled = false; next.focus();
    });
    document.getElementById('quiz-next').onclick = () => { if (!answered) return; questionIndex++; renderQuiz(); content.querySelector('h2').focus(); dialog.scrollTop = 0; };
  }
  function renderImagine() {
    const prompt = imagineStory.imagination[promptIndex];
    activeResponseId = `imagine:${imagineStory.id}:${prompt.id}`;
    const saved = store.snapshot();
    kind.textContent = 'Imagina…';
    content.innerHTML = `<p class="eyebrow">Propuesta ${promptIndex + 1} de ${imagineStory.imagination.length} · ${imagineStory.title}${prompt.age ? ` · ${prompt.age}` : ''}</p>
      <h2 id="game-title" tabindex="-1">${prompt.title}</h2><p class="imagine-prompt">${prompt.prompt}</p>
      <label class="response-label" for="imagine-response">Tu respuesta</label><p id="response-help">Puedes escribir con tus palabras. Apoya tus ideas en lo que ocurre en la historia.</p>
      <textarea id="imagine-response" rows="9" maxlength="10000" aria-describedby="response-help response-count" placeholder="Imagina que estás allí…"></textarea>
      <p id="response-count" class="response-count"></p><p id="draft-status" class="response-note" role="status"></p>
      <details class="response-review"><summary>Antes de terminar, revisa tu respuesta</summary><ul>${prompt.checklist.map(item => `<li>${item}</li>`).join('')}</ul><p>No hay una única respuesta. Revisa si explicaste tus ideas y las relacionaste con el cuento. Puedes compartir tu escrito con alguien que te acompañe en la lectura.</p></details>
      <div class="game-controls"><button class="luna-button" id="save-imagine" type="button">Guardar respuesta terminada</button></div>
      <p id="game-feedback" class="game-feedback" role="status"></p>
      <div class="game-footer"><a href="${imagineStory.chapterPrefix}${prompt.chapter}.html">Volver al capítulo ${prompt.chapter}</a><button class="tool" id="previous-prompt" type="button" ${promptIndex === 0 ? 'disabled' : ''}>← Anterior</button><button class="tool" id="next-prompt" type="button" ${promptIndex === imagineStory.imagination.length - 1 ? 'disabled' : ''}>Otra situación →</button><a href="recorrido.html">Ver mi recorrido</a></div>`;
    responseField = document.getElementById('imagine-response');
    responseField.value = saved.responses[activeResponseId]?.text || '';
    function updateResponseState() {
      document.getElementById('response-count').textContent = `${responseField.value.length} / 10000 caracteres`;
      document.getElementById('save-imagine').disabled = !responseField.value.trim();
    }
    responseField.addEventListener('input', () => {
      saveDraft(); updateResponseState(); updateStorageNote();
      document.getElementById('draft-status').textContent = store.snapshot().persistent ? 'Borrador guardado en este navegador.' : 'Borrador disponible mientras esta página siga abierta. Copia tu texto para conservarlo.';
      feedback('');
    });
    updateResponseState();
    if (saved.activities[activeResponseId]) feedback('Esta respuesta ya forma parte de tu recorrido. Puedes revisarla y mejorarla.');
    document.getElementById('save-imagine').onclick = () => {
      if (!store.saveResponse(activeResponseId, responseField.value, true)) return;
      updateStorageNote();
      feedback(store.snapshot().persistent ? '¡Guardaste tu respuesta! Ya forma parte de tu recorrido. Puedes volver a mejorarla cuando quieras.' : 'Tu respuesta cuenta en el recorrido durante esta sesión. Copia tu escrito para conservarlo antes de salir.');
    };
    function movePrompt(offset) { saveDraft(); promptIndex += offset; renderImagine(); content.querySelector('h2').focus(); dialog.scrollTop = 0; }
    document.getElementById('previous-prompt').onclick = () => movePrompt(-1);
    document.getElementById('next-prompt').onclick = () => movePrompt(1);
  }
  window.addEventListener('wow:progress', updateStorageNote);
  document.getElementById('start-word').onclick = () => { const story = stories.find(s => s.id === wordSelect.value); words = story.words.map(word => ({ ...word, story })); wordIndex = 0; newWord(); show(); };
  document.getElementById('start-quiz').onclick = () => { quizStory = stories.find(s => s.id === select.value); questionIndex = 0; renderQuiz(); show(); };
  document.getElementById('start-imagine').onclick = () => { imagineStory = stories.find(s => s.id === imagineSelect.value); promptIndex = 0; renderImagine(); show(); };
  const requestedPrompt = new URLSearchParams(location.search).get('imagina');
  const requestedStory = stories.find(s => s.id === requested);
  const requestedIndex = requestedStory?.imagination.findIndex(prompt => prompt.id === requestedPrompt) ?? -1;
  if (requestedIndex >= 0) { imagineStory = requestedStory; promptIndex = requestedIndex; renderImagine(); show(); }
})();
