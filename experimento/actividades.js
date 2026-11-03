(() => {
  const stories = window.WowStories;
  const store = window.WowProgress;
  const dialog = document.getElementById('activity-dialog');
  const content = document.getElementById('game-content');
  const kind = document.getElementById('game-kind');
  const select = document.getElementById('quiz-story');
  const requested = new URLSearchParams(location.search).get('cuento');
  if (stories.some(s => s.id === requested)) select.value = requested;
  const words = stories.flatMap(story => story.words.map(word => ({ ...word, story })));
  let wordIndex = 0, tiles = [], chosen = [], solved = false, quizStory, questionIndex = 0, answered = false;
  function stopSpeech() { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }
  function show() { if (!dialog.open) dialog.showModal(); content.querySelector('h2').focus(); }
  function feedback(message, retry = false) {
    const node = document.getElementById('game-feedback');
    node.textContent = message; node.classList.toggle('retry', retry);
  }
  document.getElementById('close-game').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', stopSpeech);
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
  document.getElementById('start-word').onclick = () => { newWord(); show(); };
  document.getElementById('start-quiz').onclick = () => { quizStory = stories.find(s => s.id === select.value); questionIndex = 0; renderQuiz(); show(); };
})();
