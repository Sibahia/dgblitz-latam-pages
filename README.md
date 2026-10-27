# DGBLITZ LATAM

Sitio fan y de referencia de **Dungeon Blitz (2012)**: contenido documental, guías y una calculadora de talentos interactiva. Español por defecto, con versión completa en inglés.

- Sitio: <https://sibahia.github.io/dgblitz-latam-pages/>
- Repositorio: <https://github.com/Sibahia/dgblitz-latam-pages>

> Proyecto no oficial. Dungeon Blitz y sus assets pertenecen a sus respectivos titulares. Este proyecto no está afiliado ni respaldado por los desarrolladores o editores originales.

## Características

- **Calculadora de talentos** para las 9 disciplinas (3 por clase: Mage, Rogue y Paladin), con 90 puntos, 42 talentstones por disciplina, 14 tiers y 3 habilidades maestras.
- Reglas de desbloqueo, conexiones entre ranuras, resumen de estadísticas, deshacer y reinicio de build.
- **Enlaces de build compartibles**: el estado se guarda en el hash de la URL y se puede copiar con un botón.
- **Guías** sobre el sistema de talentos, la calculadora, el formato de enlaces, glosario y fuentes.
- **Bilingüe** (`es` por defecto, `en` en rutas `/en`) con paridad de traducciones.
- **Tema claro/oscuro** con variables CSS, preferencia del sistema y elección persistida.
- Interfaz responsive y assets extraídos del cliente original del juego.
- Build **estático y autocontenido**, sin servidor ni llamadas a APIs externas.

## Stack

| Área | Tecnología |
| --- | --- |
| Build | Vite 8 |
| UI | React 19 + TypeScript 6 |
| Rutas | React Router 7 (`BrowserRouter`) |
| i18n | i18next + react-i18next |
| Estilos | CSS Modules + custom properties |
| Tests | Vitest + Testing Library + jsdom |
| Lint | Oxlint |
| Despliegue | GitHub Pages y Vercel |

## Requisitos

- Node.js 22 o superior (ver `.nvmrc`).
- pnpm 11 o superior.

## Inicio rápido

```bash
pnpm install
pnpm dev
```

Abre `http://localhost:5173/`. La calculadora está en `/calculadora` y las guías en `/guias`; las versiones en inglés viven bajo `/en`.

### Variables de entorno

Copia `.env.example` a `.env` solo si necesitas cambiar la ruta base:

```bash
VITE_BASE_PATH=/
```

- Desarrollo local y Vercel: `/`
- GitHub Pages de proyecto: `/nombre-del-repositorio/`

## Scripts

| Comando | Descripción |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo de Vite. |
| `pnpm build` | Typecheck y build estático en `dist/`. |
| `pnpm preview` | Sirve localmente el build de `dist/`. |
| `pnpm lint` | Ejecuta Oxlint. |
| `pnpm typecheck` | Ejecuta TypeScript sin emitir. |
| `pnpm test` | Vitest en modo watch. |
| `pnpm test:run` | Vitest una sola vez. |
| `pnpm check` | Lint + typecheck + tests + build. |

## Estructura del proyecto

```text
src/
  app/                    Rutas, shell, locale, tema y metadatos
  components/             Header y footer compartidos
  features/
    home/                 Hero, roster de disciplinas y contenido de inicio
    calculator/
      components/         Árbol, panel de detalle, stats y bandeja
      data/               Datos tipados por disciplina y árbol de talentos
      model/              Reglas, codificación de builds y tests
    guides/               Guías del sistema de talentos
    not-found/            Página 404
  assets/game/            Assets del juego usados por el sitio
  i18n/                   Traducciones `es` y `en`
  styles/                 Tokens y estilos globales
```

Los imports usan el alias `@/` para referirse a `src/` (configurado en `tsconfig.app.json` y `vite.config.ts`); solo los archivos de la misma carpeta se importan con `./`.

## Datos de la calculadora

Los datos viven en `src/features/calculator/data/`:

- Un JSON por disciplina (`frostwarden.json`, `flameseer.json`, …, `templar.json`) con talentos, habilidades y estadísticas.
- `tree.json` con la geometría del árbol, ranuras, conexiones y límite de puntos.
- `types.ts` con los contratos TypeScript y `meta.ts` como punto de acceso.

La lógica pura está en `src/features/calculator/model/calculator.ts` y cubierta por `calculator.test.ts`: desbloqueo por tiers, conexiones, puntos, habilidades maestras, estadísticas y codificación/decodificación de builds. Los componentes deben mantenerse presentacionales.

**No inventar estadísticas ni valores.** Cualquier dato nuevo debe verificarse contra el cliente original o el volcado de assets del juego.

## Assets del juego

Los sprites, UI, animaciones, música y datos originales están fuera de este repositorio, en el volcado del cliente:

```text
dungeon-blitz\src\client\content\localhost\p
```

Ese directorio es **de solo lectura**: no se edita, no se mueve y no se commitea aquí. Solo se copian al repositorio los assets que el sitio realmente usa, dentro de `src/assets/game/`, conservando los nombres originales cuando sea posible.

- Los `UI*.swf` son la referencia de diseño para marcos, botones, paneles e iconos.
- Los assets de clase están en `Animation_Paladin*.swf`, `Animation_Rogue*.swf` y `Animation_Mage*.swf` (el nombre real es `Mage`, no "Mague").
- Para extraer recursos se usa JPEXS FFDec, ya instalado en `dungeon-blitz\tools\ffdec`.

El build final no debe cargar nada desde esa ruta externa ni desde CDNs: los assets se empaquetan con el sitio.

### Pipeline WebP

El sitio importa únicamente `.webp`. Los PNG/JPG originales se conservan como fuente no importada y no se empaquetan.

```bash
pnpm assets:optimize   # regenera los WebP y muestra el reporte de tamaños
pnpm assets:check      # comprueba que todos los WebP esperados existen
pnpm assets:check:dist # audita dist: sin PNG/JPG, sin data:image y sin imágenes >200 KB
```

- UI, sprites e iconos: WebP lossless con alpha.
- Retratos y fondo: WebP lossy q82–85, con alpha lossless en los retratos.
- `master-skills` se divide en 9 hojas de 195×130 (`master-skills-0.webp`…`master-skills-8.webp`) para no cargar el sprite sheet completo.
- Los retratos tienen variantes de 382, 256 y 96 px; la home usa `srcSet`/`sizes` y las miniaturas cargan la de 96 px.
- El fondo tiene variantes de 960 y 1440 px; el CSS elige una según el ancho de viewport.
- Los imports usan `?url&no-inline` para evitar que Vite convierta iconos pequeños en base64 dentro del JS. `vite.config.ts` también excluye `src/assets/game/` del inlining.

## Despliegue

### GitHub Pages

El workflow `.github/workflows/deploy.yml` se ejecuta en cada push a `main`: instala dependencias, ejecuta lint, typecheck, tests y build, calcula `VITE_BASE_PATH` a partir del nombre del repositorio y publica `dist/`. En el repositorio, GitHub Pages debe estar configurado para usar **GitHub Actions** como fuente.

El build genera también `dist/404.html` como fallback SPA para las rutas de React Router.

### Vercel

Importa el repositorio en Vercel. `vercel.json` define el comando de build, el directorio de salida, las reescrituras SPA y las cabeceras de seguridad. No requiere configuración adicional.

## Calidad

Antes de abrir un pull request ejecuta:

```bash
pnpm check
```

Esto valida lint, tipos, tests, assets WebP y build de producción, y audita `dist/` para evitar PNG/JPG o imágenes inline.

## Contribuir

1. Abre un issue para discutir cambios importantes.
2. Crea una rama a partir de `main`.
3. Mantén la paridad entre `src/i18n/es.ts` y `src/i18n/en.ts`; español es el idioma por defecto.
4. Verifica cualquier dato de juego contra el cliente original. No se aceptan valores inventados.
5. Ejecuta `pnpm check` y abre el pull request con una descripción clara.

## Licencia y atribución

El código, las herramientas y la documentación originales de este repositorio son **© 2026 Sibahi** (<https://github.com/Sibahi>), dueño y mantenedor del repositorio, y se distribuyen bajo **GPL-3.0-only**. Consulta [LICENSE](LICENSE) para el texto completo y los términos adicionales.

**Atribución obligatoria:** si usas, copias, bifurcas, modificas o construyes sobre el código, las herramientas o la documentación originales creados por Sibahi, debes:

- dar crédito claro y visible a **Sibahi** como autor original;
- enlazar al repositorio original (<https://github.com/Sibahi/dgblitz-latam-pages>);
- conservar este aviso y la licencia GPL-3.0 en cualquier copia o versión modificada.

Este requisito es un término adicional del artículo 7(b) de la GPLv3 y no reemplaza ni debilita la licencia. Si distribuyes una versión modificada, su código fuente correspondiente debe seguir disponible bajo la GPL-3.0 para que las mejoras puedan volver al proyecto.

**Materiales del juego:** Dungeon Blitz y todos sus materiales (nombre, arte, sprites, animaciones, UI, música, efectos, datos y derivados) pertenecen a sus respectivos titulares y **no son propiedad de Sibahi**. Se incluyen únicamente con fines de preservación, documentación y referencia fan, sin reclamar su propiedad. Este proyecto no está afiliado ni respaldado por los desarrolladores o editores originales.
