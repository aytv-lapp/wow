/* Catálogo compartido por la biblioteca, las actividades y el recorrido. */
window.WowStories = [
  {
    id: 'luna', slug: 'luna-y-el-planeta-de-colores', title: 'Luna y el planeta de colores',
    categories: ['Aventura', 'Fantasía'], chapters: 5, href: 'cuentoluna.html', chapterPrefix: 'cuentoluna_cap',
    summary: 'Una estrella sin brillo, un mapa secreto y cinco capítulos para descubrir los colores del universo.',
    cover_image: 'assets/cuentoluna-portada-v2.png', cover_emoji: '🪐',
    questions: [
      { question: '¿Cómo se llama la estrella que visita a Luna?', options: ['Nilo', 'Chispa', 'Sol'], answer: 1, explanation: 'Chispa llega a la ventana de Luna con un mapa.' },
      { question: '¿Qué necesita Nilo para encontrar a su familia?', options: ['Una bicicleta', 'Una cesta de frutas', 'Recordar su canción'], answer: 2, explanation: 'Luna escucha a Nilo y lo ayuda a recuperar su canción.' },
      { question: '¿Cómo consiguen encender el faro?', options: ['Colaborando entre todos', 'Escondiendo el mapa', 'Cerrando las ventanas'], answer: 0, explanation: 'Cada amistad aporta algo para que el faro vuelva a brillar.' }
    ],
    words: [
      { word: 'LUNA', hint: 'Es el nombre de la niña que viaja con Chispa.' },
      { word: 'MAPA', hint: 'Chispa trae uno para encontrar el camino entre los colores.' },
      { word: 'FARO', hint: 'Su luz ayuda a encontrar el camino y Luna quiere encenderlo.' }
    ]
  },
  {
    id: 'bruno', slug: 'bruno-el-zorro-que-aprendio-a-compartir', title: 'Bruno, el zorro que aprendió a compartir',
    categories: ['Animales', 'Aprende'], chapters: 4, href: 'cuentobruno.html', chapterPrefix: 'cuentobruno_cap',
    summary: 'Una cesta de manzanas, dos buenos amigos y un gran descubrimiento: compartir hace crecer la felicidad.',
    cover_image: 'assets/cuentobruno-portada-v2.png', cover_emoji: '🦊',
    questions: [
      { question: '¿Qué fruta comparte Bruno con Tina?', options: ['Una pera', 'Una manzana', 'Un plátano'], answer: 1, explanation: 'Bruno le da una manzana a Tina cuando ella tiene hambre.' },
      { question: '¿Quiénes ayudan a Bruno a salir del arroyo?', options: ['Tina y Coco', 'Luna y Chispa', 'Bruno sale solo'], answer: 0, explanation: 'Tina sostiene una rama y Coco ayuda a tirar de ella.' },
      { question: '¿Qué aprende Bruno al final del cuento?', options: ['A esconder todas las frutas', 'A comer siempre solo', 'Que compartir hace crecer la felicidad'], answer: 2, explanation: 'Bruno disfruta la merienda con sus amigos y aprende a ser generoso.' }
    ],
    words: [
      { word: 'ZORRO', hint: 'Bruno es este animal de cola larga y pelaje anaranjado.' },
      { word: 'RAMA', hint: 'Tina sostiene una larga para ayudar a Bruno a salir del agua.' },
      { word: 'CESTA', hint: 'Bruno guarda en ella las manzanas que recoge en el bosque.' }
    ]
  },
  {
    id: 'expedicion', slug: 'la-expedicion-al-corazon-de-la-montana', title: 'La expedición al corazón de la montaña',
    categories: ['Aventura', 'Animales'], chapters: 10, href: 'cuentoexpedicion.html', chapterPrefix: 'cuentoexpedicion_cap',
    summary: 'Un mapa secreto guía a Álex y sus amigos hacia el Monte Susurrante, donde esperan encontrar una forma de salvar su bosque.',
    cover_image: 'assets/cuentoexpedicion-portada.png', cover_emoji: '⛰️',
    questions: [
      { question: '¿Dónde encontró Álex la caja con el mapa?', options: ['Dentro de la montaña', 'Entre las raíces de un árbol', 'En el viejo roble de Olivia'], answer: 1, explanation: 'Álex vio la caja entre las raíces de un árbol caído mientras buscaba piedras.' },
      { question: '¿Quién construía inventos en el bosque?', options: ['Timo', 'Nora', 'Olivia'], answer: 0, explanation: 'Timo, el conejo, estaba fabricando una máquina para recoger frutos.' },
      { question: '¿Qué prometieron los amigos para ayudar al corazón de la montaña?', options: ['Llevarse el cristal', 'Guardar el bosque en un mapa', 'Cuidar el bosque y respetar a los seres vivos'], answer: 2, explanation: 'Los cuatro prometieron proteger su hogar y compartir la responsabilidad de cuidarlo.' }
    ],
    words: [
      { word: 'CAJA', hint: 'Álex la encuentra entre las raíces y dentro de ella hay un mapa, una brújula y una nota.' },
      { word: 'CUEVA', hint: 'En este lugar bajo la roca, los exploradores se encuentran con sus recuerdos.' },
      { word: 'BOSQUE', hint: 'Así se llama el lugar lleno de árboles que Álex y sus amigos quieren salvar.' }
    ]
  }
];
