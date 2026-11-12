# Mundo de Letras: ejecución local

El sitio usa PHP 8.1+, MySQL 8+ y PDO MySQL. Las páginas HTML llaman a `api/index.php`; por eso deben servirse desde Apache/PHP y no abrirse directamente como archivos.

1. Inicia MySQL y ejecuta `database.sql` en el servidor.
2. Configura las variables de entorno de PHP/Apache: `DB_HOST` (por defecto `127.0.0.1`), `DB_NAME` (por defecto `mundo_de_letras`), `DB_USER` (por defecto `root`) y `DB_PASS` (por defecto vacío).
3. Coloca `experimento` dentro del directorio público de Apache o configura el virtual host para servir esta carpeta.
4. Abre `http://localhost/experimento/`.

El endpoint `api/index.php` ofrece la biblioteca publicada, registro e inicio/cierre de sesión, favoritos y avance de lectura. Los cuentos de ejemplo solo tienen resumen; al agregar texto en `stories.story_text`, el modal lo mostrará automáticamente.

## Cuentos, actividades y recorrido del experimento

La biblioteca incluye Luna (prólogo y cinco capítulos), Bruno (prólogo y cuatro capítulos), La expedición al corazón de la montaña (prólogo y diez capítulos), El misterio de las campanas desaparecidas (prólogo y ocho capítulos) y `cuentoemma.html`: **Emma y el bosque que había desaparecido**, libro 1 de una saga de cinco libros, con prólogo y diez capítulos. El texto completo original de Emma se conserva en `content/emma-libro1.md` y en sus páginas de lectura; el libro está disponible en español. La ficha presenta el segundo título anunciado en el manuscrito y deja los libros 3–5 pendientes, sin inventar su contenido.

`actividades.html` ofrece tres actividades, todas con selección de cuento o libro desde el catálogo compartido:

- **Letras traviesas**: seis palabras por cuento y diez para Emma (34 en total), con pistas y narración opcional. Admite tildes y palabras de hasta 14 letras.
- **Detectives de cuentos**: seis preguntas por historia (30 en total), con explicaciones y nuevos intentos sin penalización.
- **Imagina…**: tres situaciones de respuesta abierta por cuento y seis para Emma (18 en total). Incluye la carta de disculpa de Simón, enlaces al capítulo relacionado y criterios de autoevaluación. Las propuestas de Emma orientan por edades (5–7, 8–10 y 11–14). No asigna calificaciones automáticas: invita a explicar las ideas usando el texto y a revisarlas con una persona acompañante.

Los borradores de Imagina se guardan al escribir, al cambiar de propuesta y al cerrar el diálogo. **Guardar respuesta terminada** registra cada propuesta una sola vez en Mi recorrido y permite volver a abrirla para mejorarla. Los escritos se guardan únicamente en este navegador, en el contexto local del lector; si no hay almacenamiento disponible, permanecen en memoria durante la página actual y se indica que deben copiarse para conservarlos. No se envían al servicio PHP.

La portada de Emma se recreó con la herramienta integrada `image_gen` a partir de la referencia compartida en el chat. Se guarda en `assets/cuentoemma-portada.png`; el prompt está en `assets/cuentoemma-portada.prompt.txt`.

`recorrido.html` muestra cuentos terminados, capítulos por continuar, favoritos, actividades y descubrimientos. Se termina un capítulo al pulsar **Siguiente capítulo** y el último con **Terminar cuento**; visitar una página no completa la lectura. Se requiere terminar todos los capítulos para contar el cuento. Cada palabra y cada cuestionario se cuentan una sola vez.

Estas funciones usan archivos estáticos y no necesitan MySQL. Pueden probarse sirviendo esta carpeta con cualquier servidor HTTP. La autenticación existente sigue dependiendo del servicio PHP.

### Preparación para sesiones de tutor y menor

- `story-data.js`: catálogo estable, preguntas y palabras de los cuentos completos.
- `progress-store.js`: única interfaz de lectura y escritura del recorrido. Usa `localStorage` con un esquema `version: 1`, sin enviar información a un servidor. Si el almacenamiento no está disponible, mantiene los datos solo en la página actual.
- `WowProgress.snapshot()` devuelve una copia del avance: `stories`, `activities`, `responses`, `updatedAt`, contexto y disponibilidad del almacenamiento. `saveResponse('imagine:<cuento>:<propuesta>', texto, terminada)` guarda un borrador o registra su finalización explícita. Mantiene el esquema `version: 1` y lee recorridos anteriores que no contienen escritos. El evento `wow:progress` avisa de cambios para actualizar las pantallas; también se escuchan cambios desde otras pestañas.
- `WowProgress.setContext(tutorId, learnerId)` selecciona un espacio local independiente para ese tutor y ese menor. Ambos deben ser IDs estables; sin argumentos vuelve al invitado. No traslada el avance del invitado a una cuenta ni autentica al usuario.
- La futura integración debe validar la sesión y la relación tutor/menor en el servidor, conectar esta interfaz al servicio de progreso y definir la sincronización. Los IDs locales no son una autorización. Todavía no hay sincronización con cuentas ni base de datos.

Verificación local: `node --test tests/experimento.test.cjs` desde la raíz del repositorio. Si el entorno restringido de Windows impide resolver la ruta de inicio, usar `node --preserve-symlinks-main --test tests/experimento.test.cjs`.

### Diseño compartido

`site-shell.css` y `site-shell.js` unifican la navegación, el menú móvil, la selección de página y el pie. Todas las páginas muestran Inicio, Cuentos, Actividades, Mi recorrido y Acceso; al entrar en un capítulo permanece seleccionado Cuentos. Las anclas internas del inicio no cambian la selección de navegación.

Al añadir páginas, reutilizar el encabezado `.site-header` y el pie `.site-footer`, e incluir ambos archivos compartidos. Usar el pie completo con contacto solo en páginas para personas adultas, como Inicio y Acceso; la biblioteca, los prólogos, los capítulos, Actividades y Mi recorrido usan `.site-footer-compact`, con enlaces para seguir leyendo y jugando.

El inicio utiliza `story-data.js`, igual que la biblioteca, por lo que las nuevas historias completas se incorporan a ambas vistas desde el catálogo. Sus paneles enlazan a las funciones disponibles y describen su alcance actual. La portada definitiva de Bruno es `assets/cuentobruno-portada-v2.png`; el prompt y las referencias de edición se documentan en el archivo `.prompt.txt` del mismo nombre.
