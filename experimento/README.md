# Mundo de Letras: ejecución local

El sitio usa PHP 8.1+, MySQL 8+ y PDO MySQL. Las páginas HTML llaman a `api/index.php`; por eso deben servirse desde Apache/PHP y no abrirse directamente como archivos.

1. Inicia MySQL y ejecuta `database.sql` en el servidor.
2. Configura las variables de entorno de PHP/Apache: `DB_HOST` (por defecto `127.0.0.1`), `DB_NAME` (por defecto `mundo_de_letras`), `DB_USER` (por defecto `root`) y `DB_PASS` (por defecto vacío).
3. Coloca `experimento` dentro del directorio público de Apache o configura el virtual host para servir esta carpeta.
4. Abre `http://localhost/experimento/`.

El endpoint `api/index.php` ofrece la biblioteca publicada, registro e inicio/cierre de sesión, favoritos y avance de lectura. Los cuentos de ejemplo solo tienen resumen; al agregar texto en `stories.story_text`, el modal lo mostrará automáticamente.

## Cuentos, actividades y recorrido del experimento

La biblioteca incluye dos cuentos completos: `cuentoluna.html` (prólogo y cinco capítulos) y `cuentobruno.html` (prólogo y cuatro capítulos). Bruno conserva el texto proporcionado, con un prólogo nuevo. Las actividades de `actividades.html` ofrecen seis palabras con pistas escritas y narración opcional, y tres preguntas de opción múltiple por cuento. Se puede volver a intentar sin penalizaciones.

`recorrido.html` muestra cuentos terminados, capítulos por continuar, favoritos, actividades y descubrimientos. Se termina un capítulo al pulsar **Siguiente capítulo** y el último con **Terminar cuento**; visitar una página no completa la lectura. Se requiere terminar todos los capítulos para contar el cuento. Cada palabra y cada cuestionario se cuentan una sola vez.

Estas funciones usan archivos estáticos y no necesitan MySQL. Pueden probarse sirviendo esta carpeta con cualquier servidor HTTP. La autenticación existente sigue dependiendo del servicio PHP.

### Preparación para sesiones de tutor y menor

- `story-data.js`: catálogo estable, preguntas y palabras de los cuentos completos.
- `progress-store.js`: única interfaz de lectura y escritura del recorrido. Usa `localStorage` con un esquema `version: 1`, sin enviar información a un servidor. Si el almacenamiento no está disponible, mantiene los datos solo en la página actual.
- `WowProgress.snapshot()` devuelve una copia del avance: `stories`, `activities`, `updatedAt`, contexto y disponibilidad del almacenamiento. El evento `wow:progress` avisa de cambios para actualizar las pantallas; también se escuchan cambios desde otras pestañas.
- `WowProgress.setContext(tutorId, learnerId)` selecciona un espacio local independiente para ese tutor y ese menor. Ambos deben ser IDs estables; sin argumentos vuelve al invitado. No traslada el avance del invitado a una cuenta ni autentica al usuario.
- La futura integración debe validar la sesión y la relación tutor/menor en el servidor, conectar esta interfaz al servicio de progreso y definir la sincronización. Los IDs locales no son una autorización. Todavía no hay sincronización con cuentas ni base de datos.

Verificación local: `node --test tests/experimento.test.cjs` desde la raíz del repositorio. Si el entorno restringido de Windows impide resolver la ruta de inicio, usar `node --preserve-symlinks-main --test tests/experimento.test.cjs`.

### Diseño compartido

`site-shell.css` y `site-shell.js` unifican la navegación, el menú móvil, la selección de página y el pie. Todas las páginas muestran Inicio, Cuentos, Actividades, Mi recorrido y Acceso; al entrar en un capítulo permanece seleccionado Cuentos. Las anclas internas del inicio no cambian la selección de navegación.

Al añadir páginas, reutilizar el encabezado `.site-header` y el pie `.site-footer`, e incluir ambos archivos compartidos. Usar el pie completo con contacto solo en páginas para personas adultas, como Inicio y Acceso; la biblioteca, los prólogos, los capítulos, Actividades y Mi recorrido usan `.site-footer-compact`, con enlaces para seguir leyendo y jugando.

El inicio utiliza `story-data.js`, igual que la biblioteca, por lo que las nuevas historias completas se incorporan a ambas vistas desde el catálogo. Sus paneles enlazan a las funciones disponibles y describen su alcance actual. La portada definitiva de Bruno es `assets/cuentobruno-portada-v2.png`; el prompt y las referencias de edición se documentan en el archivo `.prompt.txt` del mismo nombre.
