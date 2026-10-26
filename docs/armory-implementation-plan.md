# Plan de implementación de la Armería

Documento de trabajo para dividir la Armería en sesiones pequeñas y reanudables sin
releer todo el repositorio. La fuente de verdad del proyecto sigue siendo `AGENTS.md`;
este documento solo registra el plan, las decisiones y el estado de la sesión.

- Fecha de creación: 2026-10-26
- Rama de implementación: `feat/armory`
- Worktree activo: `C:\Users\danie\Downloads\Daniel\Dev\Code\Calc-Talents DgBlitz-armory`
- Worktree principal: `C:\Users\danie\Downloads\Daniel\Dev\Code\Calc-Talents DgBlitz`

## 1. Regla de trabajo entre sesiones

Cada sesión debe empezar leyendo, en este orden:

1. `AGENTS.md`
2. Este documento
3. `git status --short` y `git diff --stat`
4. Solo los archivos indicados en la fase activa

No se debe reexplorar todo `src/`, volcar XML completos ni repetir la investigación de
assets ya cerrada. Los hallazgos nuevos se anotan aquí, no solo en el chat.

Cada sesión termina actualizando la sección **Estado de sesión** con:

- fase terminada o en curso;
- último commit de `feat/armory`;
- archivos tocados;
- comandos ejecutados y resultado;
- decisiones nuevas;
- bloqueos;
- siguiente tarea concreta.

Si una sesión no puede terminar una fase, debe dejar el worktree en un estado compilable
y anotar exactamente dónde continuar.

## 2. Estado del repositorio antes de crear el worktree

Al crear este documento, el worktree principal tenía cambios sin commitear:

```text
 M AGENTS.md
 M LICENSE
?? README.md
```

Además, este documento nace sin commitear. Un `git worktree add` parte de un commit,
no del working tree, así que **el worktree nuevo no incluirá esos cambios**. Antes de
crear `feat/armory`, elegir una de estas opciones:

### Opción A, recomendada

Con autorización del usuario, hacer un commit en `main` con `AGENTS.md`, `LICENSE`,
`README.md` y este plan. Después crear el worktree desde `main`.

```powershell
git add AGENTS.md LICENSE README.md docs/armory-implementation-plan.md
git commit -m "docs: add armory implementation plan"
git worktree add -b feat/armory "..\Calc-Talents DgBlitz-armory" main
```

### Opción B

Crear el worktree desde `main` y copiar manualmente `AGENTS.md`, `README.md` y este plan
al worktree. Quedarán sin seguimiento hasta que se commiteen.

No crear el worktree y asumir que los cambios sin commitear aparecerán allí.

## 3. Worktree y rama

### Crear

Desde el worktree principal:

```powershell
git worktree add -b feat/armory "..\Calc-Talents DgBlitz-armory" main
```

La ruta contiene espacios; citarla siempre. Si la rama ya existe:

```powershell
git worktree add "..\Calc-Talents DgBlitz-armory" feat/armory
```

### Preparar dependencias

```powershell
npm ci
npm run check
```

`npm ci` instala dependencias en el worktree; no copiar `node_modules` entre worktrees.
Anotar en el estado si `npm run check` falla antes de tocar código, para no confundir
errores previos con errores de la Armería.

### Trabajo diario

- Implementar en `feat/armory`, dentro del worktree de la Armería.
- Usar el worktree principal para revisar, comparar y preparar el merge.
- No tener dos sesiones escribiendo a la vez en el mismo worktree.
- Si se necesitan sesiones paralelas, crear worktrees separados por fase
  (`-armory-data`, `-armory-ui`) y fusionar en `feat/armory`; no compartir el mismo
  directorio de trabajo.
- El dump del juego sigue siendo externo y de solo lectura:
  `C:\Users\danie\Downloads\Daniel\Dev\Code\dungeon-blitz\src\client\content\localhost\p`
- FFDec oficial: `C:\Users\danie\Downloads\Daniel\Dev\Code\dungeon-blitz\tools\ffdec\ffdec.bat`
- No copiar el dump completo ni enlazarlo en runtime. Solo assets exportados y
  optimizados dentro de `src/assets/game/armory/`.

### Limpiar al terminar

Solo después del merge:

```powershell
git worktree remove "..\Calc-Talents DgBlitz-armory"
git branch -d feat/armory
git worktree list
```

No borrar manualmente la carpeta del worktree ni su metadata en `.git/worktrees`.

## 4. Contexto técnico que no hay que reinvestigar

### Orden real de ranuras

Inspeccionado `cbp/UI_4.swf` → `a_ArmoryWindow` → `am_EquipmentSlots`. El orden es:

1. `am_Sword` — Arma
2. `am_Shield` — Escudo / Foco / Mano secundaria
3. `am_Hat` — Casco / Sombrero
4. `am_Armor` — Armadura
5. `am_Gloves` — Guantes
6. `am_Boots` — Botas

Es el mismo orden para las tres clases; cambian las etiquetas. El usuario mencionó
“Paladín empieza por Casco”, pero el juego real empieza por Arma. Decisión pendiente:
mantener el orden real o aplicar la excepción del usuario.

### Datos confirmados

- 1.182 ítems base y 3.546 variantes; 394 ítems base y 1.182 variantes por clase.
- Cada ID base tiene exactamente tres variantes M/R/L.
- Rarezas: `M` = Magic, `R` = Rare, `L` = Legendary.
- 6 IDs iniciales con fuente mixta:
  - Paladin: 1, 13
  - Rogue: 27, 39
  - Mage: 53, 65
- 30 IDs globales/especiales: 6 iniciales + 24 especiales.
- 78 variantes globales: 6 variantes M iniciales + 72 especiales (24 × 3).
- 24 especiales: 8 por clase; mismo nombre en las tres rarezas y `Level` vacío.
- 64 jefes, 53 claves reino+nivel, 65 mazmorras y 293 misiones.
- 920 valores únicos de `CustomArt`; 1.424 variantes multicapa; 1.183 combinaciones de
  arte; 3.466 combinaciones únicas de arte+color.
- Hat: 405/459 variantes con arte; 54 sin `CustomArt` y necesitan fallback.
- No hay iconos oficiales por ítem. `ScreenArmory` usa paperdoll; los thumbnails son una
  reconstrucción del arte.
- `MissionTypes` no contiene recompensas; la relación gear → misión se hace por
  `Dungeon`.

### Fuentes de datos

- `Login.swz`: `GearTypes` y `EntTypes` en inglés.
- `Game.en.swz`: entradas 7 y 12, `LevelTypes` y `MissionTypes`.
- `DungeonBlitz.swf`: mapas jefe/reino → mazmorra y código de `ScreenArmory`.
- `Gfx_Paladin_1.swf`, `Gfx_Mage_1.swf`, `Gfx_Rogue_1.swf`: arte de equipo.
- `Animation_Mage.swf`: símbolos “No…” usados por algunas variantes.
- No usar `gear_catalog.json` para nombres ni `GearTypes.xml` turco.
- SWZ: 4 bytes BE de clave, 4 bytes BE de número de entradas; cada entrada lleva 4 bytes
  BE de longitud y bytes cifrados con XOR contra `key & 0xff`, rotando la clave a la
  derecha por `i & 7`; después `zlib.inflateSync`.

### Assets de UI que se van a usar

- `UI_4.swf`: `a_ArmoryWindow`, `a_EmptyGearSlotMoveable`, `a_ScreenHudTooltip`,
  `a_Icon_Gear`.
- `UI_1.swf`: `a_Icon_paladin`, `a_Icon_rogue`, `a_Icon_mage`.
- `UI_Library.swf`: `_DoodadArmoryItemWrapperMain`, `_DoodadArmoryButtonMask01`,
  `_DoodadArmoryStoneFill01`, `_DoodadItemPlateBronze01`, `_DoodadItemPlateSilver01`,
  `_DoodadItemPlateGold01`, `_DoodadRarityChest01`–`03`, `_DoodadGearHolderStub`,
  `_DoodadGearSelectedTall`, `_DoodadIconForArmoryTab`, `_DoodadItemDisplay01`,
  `_DoodadItemPlateBlankIcon01`, `_DoodadWindowBorderPiece01`,
  `_ButtonFrameStandard*`, `_ButtonFrameOver*`.
- Los assets se exportan como PNG/WebP con transparencia; los marcos se usan con
  `border-image` o piezas de esquina, no como captura completa de la ventana.

### Rutas y estado de URL

- ES: `/equipo`
- EN: `/en/gear`
- Parámetros: `clase`, `q`, `ranura`, `tipo`, `rareza`, `fuente`.
- Clase por defecto: Paladín; valores `paladin|rogue|mage`.
- Slugs de ranura: `weapon|offhand|head|armor|gloves|boots`.
- `useLocale` debe conservar `location.search` además del hash.
- El selector de clase va arriba y siempre visible; no se oculta en un menú.

### Esquema de datos previsto

```ts
type Rarity = 'M' | 'R' | 'L'
type Slot = 'weapon' | 'offhand' | 'head' | 'armor' | 'gloves' | 'boots'

interface GearVariant {
  name: string
  rarity: Rarity
  level: number | null
  artKey: string
  iconKey: string
  source: GearSource
}

interface GearItem {
  id: number
  name: string
  slot: Slot
  subtype: 'axe' | 'mace' | 'sword' | 'saber' | 'scepter' | 'rapier' | 'staff' | null
  variants: GearVariant[]
}

type GearSource =
  | { kind: 'boss'; boss: string; dungeon: string; missions: string[] }
  | { kind: 'realm'; realm: string; level: number; dungeon: string; missions: string[] }
  | { kind: 'starter'; label: string }
  | { kind: 'global'; label: string }
```

Los nombres de ítems se guardan exactamente como aparecen en `Login.swz`; solo se
traducen las etiquetas de la interfaz.

## 5. Dirección visual y reglas de UI

- La Armería es una pantalla de consulta, no una landing page.
- Aplicar `frontend-design` para identidad y `design-taste-frontend` en modo app screen.
- Título de página claro; sin hero genérico ni tarjetas KPI decorativas.
- Usar los assets de UI del juego como marco, placas, ranuras, sellos de clase y
  badges de rareza/fuente.
- Tipografía existente: `Cinzel` para títulos y `Alegreya Sans` para lectura.
- Reutilizar tokens de `src/styles/tokens.css`; añadir solo tokens `--armory-*`.
- Sin gradientes, glows ni sombras nuevas en la Armería. Las superficies se separan por
  tono, borde y los marcos del juego.
- Color solo en datos, rareza, fuente y estado activo; el oro no debe invadir todo.
- Movimiento: feedback de hover/press/focus y apertura de detalles; sin entradas
  animadas.
- Móvil: selector de clase en tres botones, búsqueda full-width, ranuras en scroll
  horizontal y filtros secundarios colapsables.
- Accesibilidad: foco visible, `aria-pressed` en filtros, `aria-live` para el contador,
  diálogo nativo para misiones, contraste y `prefers-reduced-motion`.

## 6. Fases y sesiones

### Sesión 0 — Bootstrap y spike de assets

Objetivo: reducir el riesgo técnico antes de construir la página.

Tareas:

1. Resolver el estado sucio y crear el worktree.
2. Exportar con FFDec una muestra de UI y tres objetos Paladín:
   - arma multicapa,
   - armadura,
   - guantes o botas.
3. Componer con Python/Pillow: `CustomArt`, `CustomArt2`, `CustomArt3`, `LocOffset` y
   `ColorSwap`.
4. Validar origen, escala, orden de capas y color; generar iconos de 56 px.
5. Revisar la muestra en navegador en tema claro y oscuro.
6. Exportar los iconos de clase y 8–12 piezas de UI.
7. Decidir si el pipeline sirve; si no, usar anclas por ranura o la capa visible.

Criterio de salida:

- Tres iconos de muestra que se lean a 48–56 px.
- Marco/placa/ranura del juego integrados en una mini composición.
- Documentada la decisión sobre origen y `ColorSwap`.
- Sin exportar todavía los 3.466 iconos.

Archivos previstos:

- `src/assets/game/armory/ui/`
- `src/assets/game/armory/icons/`
- `scripts/` o script one-off fuera del build
- `docs/armory-implementation-plan.md`

### Sesión 1 — Dataset

Tareas:

1. Crear el script one-off en el repo de datos reutilizando `swfPatchUtils.ts`.
2. Leer `Login.swz`, `Game.en.swz` y los mapas de `DungeonBlitz.swf`.
3. Generar `paladin.json`, `rogue.json`, `mage.json`, `sources.json` y `manifest.json`.
4. Clasificar subtipos con `MeleePower`:
   - Paladín: `AxeMelee`, `MaceMelee`, `SwordMelee`.
   - Pícaro: `SaberMelee`, `ScepterMelee`, `RapierMelee`.
   - Mago: `StaffMelee`.
5. Validar conteos, fuentes, rarezas, niveles y los 6 IDs iniciales mixtos.
6. Añadir tests de integridad del dataset.

Criterio de salida:

- 1.182 bases, 3.546 variantes, 394/1.182 por clase.
- 30 globales, 78 variantes globales.
- 0 fuentes sin resolver.
- JSON tipado y tests verdes.

### Sesión 2 — Rutas, i18n y shell

Tareas:

1. Añadir `armory` a `RouteKey` y `routePath`.
2. Registrar `/equipo` y `/en/gear` en `App.tsx`.
3. Añadir “Armería”/“Armory” al `Header`.
4. Corregir `useLocale` para preservar búsqueda y hash.
5. Añadir claves ES/EN y metadatos de página.
6. Crear `ArmoryPage` con título, selector de clase y estado de URL, sin lista completa.
7. Verificar que el cambio de idioma conserva `?clase=...&q=...`.

Criterio de salida:

- Ambas rutas cargan.
- El selector de clase cambia `?clase=`.
- El idioma no pierde filtros.
- `npm run typecheck` y tests de rutas/i18n pasan.

### Sesión 3 — Vertical slice

Tareas:

1. Paladín por defecto, ranura Arma.
2. Buscador, estante de ranuras y chips de subtipo.
3. Tres objetos reales con iconos del spike.
4. Filas con placa de rareza, fuente y contador de variantes.
5. Expansión M/R/L y diálogo de fuente/misiones.
6. QA visual en 1440 y 390; ajustar la composición antes de escalar.

Criterio de salida:

- La dirección visual queda aprobada.
- La fila y el detalle funcionan con teclado.
- El orden de ranuras es el real.
- Sin datos inventados.

### Sesión 4 — Iconos completos

Tareas:

1. Exportar los 920 valores únicos de `CustomArt`.
2. Componer las 3.466 combinaciones arte+color.
3. Generar atlas WebP de 56 px, 2.048² y 2 px de padding; uno por clase.
4. Si una clase supera 1.225 celdas, generar una segunda atlas.
5. Añadir `icons.json` o manifiesto con atlas, posición y hash.
6. Fallback para los 54 sombreros sin arte con `_DoodadItemPlateBlankIcon01` y el icono
   de ranura.
7. Revisar bleed, halos, escala y peso.

Criterio de salida:

- Todos los iconos disponibles o con fallback honesto.
- Sin hotlinks al dump.
- Peso de atlas aceptable y carga por clase.
- Prueba visual de una muestra por ranura y rareza.

### Sesión 5 — Armería completa

Tareas:

1. Las 3 clases y las 6 ranuras.
2. Búsqueda por nombre, fuente, mazmorra y misión.
3. Filtros combinados: clase, ranura, subtipo, rareza y fuente.
4. Agrupación por ranura; dentro de cada grupo, orden alfabético y variantes M/R/L.
5. Sección/filtro de globales y especiales.
6. Estados vacío, sin resultados, carga y error de datos.
7. Responsive 1440/768/390 y rendimiento de listas largas.
8. Actualizar URL sin recargar y conservar estado al cambiar idioma.

Criterio de salida:

- 394 bases y 1.182 variantes por clase visibles y filtrables.
- Fuente de cada variante verificable.
- Globales sin nivel ni misión inventados.
- Sin strings hardcodeados fuera de i18n.

### Sesión 6 — QA, documentación y entrega

Tareas:

1. `npm run check`.
2. Tests de filtros, agrupación, URL, i18n y dataset.
3. QA con Playwright/`webapp-testing` en 1440, 768 y 390.
4. Si el skill ofrece inspector de navegador, usarlo para revisar la UI; documentar las
   excepciones de marca del juego que no se deban corregir.
5. Verificar build estático, `base` de GitHub Pages, 404 SPA y Vercel.
6. Actualizar `README.md` con la Armería, fuentes y proceso de assets.
7. Cerrar el estado de sesión y preparar el merge.

Criterio de salida:

- `npm run check` en verde.
- Sin requests externos ni assets fuera del build.
- Navegación por teclado y móvil correcta.
- Documentación actualizada.

## 7. Archivos que se van a crear o modificar

### Sitio

- `src/app/paths.ts`
- `src/app/App.tsx`
- `src/app/useLocale.ts`
- `src/components/Header.tsx`
- `src/i18n/es.ts`
- `src/i18n/en.ts`
- `src/features/armory/ArmoryPage.tsx`
- `src/features/armory/armory.module.css`
- `src/features/armory/components/…`
- `src/features/armory/data/{paladin,rogue,mage}.json`
- `src/features/armory/data/sources.json`
- `src/features/armory/data/manifest.json`
- `src/assets/game/armory/ui/…`
- `src/assets/game/armory/icons/…`

### Script one-off de datos

- `C:\Users\danie\Downloads\Daniel\Dev\Code\dungeon-blitz\src\server\scripts\export_armory_site_data.ts`
- Reutiliza `swfPatchUtils.ts`.
- No se incluye en el build del sitio.

### Documentación

- `docs/armory-implementation-plan.md`
- `README.md` al final de la implementación.

## 8. Comandos de referencia

```powershell
# Estado
git status --short
git diff --stat
git worktree list

# Worktree
git worktree add -b feat/armory "..\Calc-Talents DgBlitz-armory" main
npm ci
npm run check

# Desarrollo
npm run dev
npm run lint
npm run typecheck
npm run test:run
npm run build

# FFDec
& "C:\Users\danie\Downloads\Daniel\Dev\Code\dungeon-blitz\tools\ffdec\ffdec.bat" -help export
```

## 9. Decisiones cerradas

- La Armería es una única página de consulta con selector de clase.
- Paladín es la clase por defecto.
- El selector de clase va arriba, visible, y actualiza la URL.
- Los filtros de ranura siguen el orden real del juego.
- Los subtipos de arma se filtran con chips.
- Los nombres de ítems se muestran en inglés desde `Login.swz`.
- La UI se traduce a ES/EN.
- Se extrae todo el arte; no hay iconos oficiales.
- No se inventan estadísticas, niveles, jefes ni misiones.
- El build es estático y autocontenido.

## 10. Decisiones pendientes

1. **Orden de ranuras:** el usuario mencionó Paladín/Casco primero, pero el juego real
   empieza por Arma. Confirmar si se mantiene el orden real o se aplica la excepción.
2. **Mapa de rarezas:** verificar en el spike si M/R/L corresponden a bronce/plata/oro
   en las placas del juego.
3. **Tamaño de icono:** 56 px es la primera opción; subir a 64 px solo si el spike
   demuestra que 56 px pierde detalle.
4. **Estado sucio de `main`:** decidir si se commitea antes del worktree o se copian
   manualmente los archivos.
5. **Globales:** confirmar que van en una sección al final y también en el filtro
   `fuente=global`.

## 11. Estado de sesión

Actualizar esta sección al final de cada sesión. No borrar el historial; añadir una
entrada nueva arriba.

### 2026-10-26 — Sesión 0: worktree preparado

- Rama/worktree: `feat/armory` en
  `C:\Users\danie\Downloads\Daniel\Dev\Code\Calc-Talents DgBlitz-armory`.
- `main`: commit `970482e` (`docs: add armory implementation plan`).
- Fase: Sesión 0 iniciada; spike de assets pendiente.
- Hecho:
  - Commit en `main` con `AGENTS.md`, `LICENSE`, `README.md` y este plan.
  - Worktree creado desde `main` en la ruta indicada.
  - `npm ci` y `npm run check` en verde: 15 tests y build correcto.
- Siguiente tarea: exportar UI y tres iconos de muestra; validar origen,
  capas, `ColorSwap` y legibilidad a 56 px.
- Bloqueos:
  - Confirmar si se mantiene el orden real de ranuras o la excepción
    Paladín/Casco.
  - Verificar el mapa de placas M/R/L a bronce/plata/oro en el spike.

### 2026-10-26 — Plan documentado

- Rama/worktree: `main`, sin worktree de Armería creado todavía.
- Fase: planificación cerrada; implementación no iniciada.
- Hecho:
  - Investigación de datos y assets completada.
  - Orden real de ranuras confirmado.
  - Dirección visual y fases definidas.
  - Este documento creado.
- Commit: este documento se incluye en el commit de preparación del worktree.
- Bloqueos:
  - El worktree nuevo no incluirá `AGENTS.md`, `LICENSE`, `README.md` ni este plan
    hasta que se commiteen o se copien.
  - Falta confirmar el orden de ranuras si se quiere la excepción de Paladín/Casco.
- Siguiente tarea: Sesión 0, bootstrap del worktree y spike de assets.

## 12. Plantilla de handoff

Copiar al final de cada sesión:

```md
### YYYY-MM-DD — Sesión N

- Rama/worktree:
- Último commit:
- Fase:
- Hecho:
- En curso:
- Siguiente:
- Archivos tocados:
- Comandos ejecutados:
- Tests/build:
- Decisiones:
- Bloqueos:
- Riesgos:
```
