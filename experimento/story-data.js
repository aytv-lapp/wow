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
  }
];
