# Mundo de Letras: ejecución local

El sitio usa PHP 8.1+, MySQL 8+ y PDO MySQL. Las páginas HTML llaman a `api/index.php`; por eso deben servirse desde Apache/PHP y no abrirse directamente como archivos.

1. Inicia MySQL y ejecuta `database.sql` en el servidor.
2. Configura las variables de entorno de PHP/Apache: `DB_HOST` (por defecto `127.0.0.1`), `DB_NAME` (por defecto `mundo_de_letras`), `DB_USER` (por defecto `root`) y `DB_PASS` (por defecto vacío).
3. Coloca `experimento` dentro del directorio público de Apache o configura el virtual host para servir esta carpeta.
4. Abre `http://localhost/experimento/`.

El endpoint `api/index.php` ofrece la biblioteca publicada, registro e inicio/cierre de sesión, favoritos y avance de lectura. Los cuentos de ejemplo solo tienen resumen; al agregar texto en `stories.story_text`, el modal lo mostrará automáticamente.
