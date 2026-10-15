# wow
world of words project prototypes

## Ramas de trabajo

- `main`: version estable de la pagina en `experimento/`.
- `experimentos`: cambios y pruebas antes de integrarlos a `main`.

Para experimentar, abre este repositorio en VS Code y trabaja en la rama
`experimentos`:

```sh
git switch experimentos
# Modifica los archivos de experimento/.
git add experimento/
git commit -m "Describe tu cambio"
git push
```

Puedes repetir estos pasos para guardar diferentes versiones. Los commits de
`experimentos` no modifican `main`. Cuando quieras incorporar los cambios
estables, abre un pull request en GitHub de `experimentos` hacia `main`.

Para una prueba independiente, crea otra rama desde la version estable:

```sh
git switch main
git pull --ff-only
git switch -c experimento/nueva-idea
git push -u origin experimento/nueva-idea
```
