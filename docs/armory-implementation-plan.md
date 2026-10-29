# Plan de implementación de la Armería

Documento de trabajo para dividir la Armería en sesiones pequeñas y reanudables sin
releer todo el repositorio. La fuente de verdad del proyecto sigue siendo `AGENTS.md`;
este documento solo registra el plan, las decisiones y el estado de la sesión.

- Fecha de creación: 2026-10-26
- Rama de implementación: `feat/armory` (PR #2 mergeado; rama avanzada a `origin/main`
  para la Sesión 3)
- Worktree de implementación: `..\Calc-Talents DgBlitz-armory` (activo en la Sesión 3)
- Worktree principal: `..\Calc-Talents DgBlitz`

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
pnpm install --frozen-lockfile
pnpm check
```

`pnpm install --frozen-lockfile` instala dependencias en el worktree; no copiar `node_modules` entre worktrees.
Anotar en el estado si `pnpm check` falla antes de tocar código, para no confundir
errores previos con errores de la Armería.

### Trabajo diario

- Implementar en `feat/armory`, dentro del worktree de la Armería.
- Usar el worktree principal para revisar, comparar y preparar el merge.
- No tener dos sesiones escribiendo a la vez en el mismo worktree.
- Si se necesitan sesiones paralelas, crear worktrees separados por fase
  (`-armory-data`, `-armory-ui`) y fusionar en `feat/armory`; no compartir el mismo
  directorio de trabajo.
- El dump del juego sigue siendo externo y de solo lectura:
  `..\dungeon-blitz\src\client\content\localhost\p`
- FFDec oficial: `..\dungeon-blitz\tools\ffdec\ffdec.bat`
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
- 64 jefes, 53 claves reino+nivel, 65 mazmorras y 293 misiones; 130 filas de misión
  caen dentro de las mazmorras de equipo y producen 67 nombres únicos.
- 920 valores únicos de `CustomArt`; 1.183 combinaciones de arte; 3.466 combinaciones
  únicas de arte+color. Hay 1.430 variantes con alguna capa secundaria y 1.424 si se
  exigen al menos dos capas.
- Hat: 405/459 variantes con arte; 54 sin `CustomArt` primario: 48 Rogue con
  `CustomArt2+3` y 6 Paladín solo con `CustomArt2`. No hay variantes sin ninguna capa;
  se conservan las capas secundarias y el fallback se decide en la Sesión 4.
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
- `UI_0_3.swf`: paneles de clase `am_PaladinDesc` (306), `am_RogueDesc` (309) y
  `am_MageDesc` (313), e iconos reales de clase Paladín (282), Rogue (290) y Mage (274).
  Los iconos de `UI_1.swf` usados en el spike eran máscaras/glows y se sustituyeron en
  la Sesión 2.
- `UI_Library.swf`: `_DoodadArmoryItemWrapperMain`, `_DoodadArmoryButtonMask01`,
  `_DoodadArmoryStoneFill01`, `_DoodadItemPlateBronze01`, `_DoodadItemPlateSilver01`,
  `_DoodadItemPlateGold01`, `_DoodadRarityChest01`–`03`, `_DoodadGearHolderStub`,
  `_DoodadGearSelectedTall`, `_DoodadIconForArmoryTab`, `_DoodadItemDisplay01`,
  `_DoodadItemPlateBlankIcon01`, `_DoodadWindowBorderPiece01`,
  `_ButtonFrameStandard*`, `_ButtonFrameOver*`.
- Los assets se exportan como PNG/WebP con transparencia; los marcos se usan con
  `border-image` o piezas de esquina, no como captura completa de la ventana. El panel
  de clase sí se exporta como pieza completa: se eliminan los textos `am_ClassName` y
  `am_ClassDescription` del XML del SWF, se recorta el marco limpio y se compone con el
  icono real en un lienzo común.

### Rutas y estado de URL

- ES: `/equipo`
- EN: `/en/gear`
- Parámetros: `clase`, `q`, `ranura`, `tipo`, `rareza`, `fuente`.
- Clase por defecto: Paladín; valores `paladin|rogue|mage`.
- Slugs de ranura: `weapon|offhand|head|armor|gloves|boots`.
- `useLocale` debe conservar `location.search` además del hash.
- El selector de clase va arriba y siempre visible; no se oculta en un menú.

### Esquema de datos implementado

```ts
type Rarity = 'M' | 'R' | 'L'
type Slot = 'weapon' | 'offhand' | 'head' | 'armor' | 'gloves' | 'boots'

interface GearVariant {
  name: string
  rarity: Rarity
  level: number | null
  artKey: string
  iconKey: string
  sourceId: string
}

interface GearItem {
  id: number
  name: string
  slot: Slot
  subtype: 'axe' | 'mace' | 'sword' | 'saber' | 'scepter' | 'rapier' | 'staff' | null
  variants: GearVariant[]
}

interface DungeonRef {
  key: string
  levelName: string
  name: string
}

type GearSource =
  | { kind: 'boss'; boss: string; dungeon: DungeonRef; missions: string[] }
  | { kind: 'realm'; realm: string; level: number; dungeon: DungeonRef; missions: string[] }
  | { kind: 'starter'; label: 'Starter' }
  | { kind: 'global'; label: 'Special' }
```

- Las fuentes viven una sola vez en `sources.json`, indexadas por `sourceId`; cada
  variante guarda solo ese ID.
- IDs: `boss:<BossName>`, `realm:<Realm>:<level>`, `starter:<GearID>`,
  `global:<GearID>`.
- `sourceId` iniciales: M usa `starter:<id>`; R/L usan `realm:Ghost:5` (nivel 5,
  mazmorra `DreamDragonDungeon`, “The Dragon's Dream”).
- Los 24 especiales usan `global:<id>`, nivel `null`; el filtro global suma iniciales
  y especiales (30 IDs / 78 variantes).
- `sources.json` contiene 147 registros: 64 jefes, 53 reinos, 6 iniciales y 24
  globales. Los globales/iniciales no tienen mazmorra ni misiones.
- `artKey = CustomArt|CustomArt2|CustomArt3`; `iconKey = artKey#ColorSwap1|...|ColorSwap10`.
  Se normalizan hex y se conservan capas vacías.
- Los nombres de ítems se guardan exactamente como aparecen en `Login.swz`; solo se
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

### Sesión 1 — Dataset (completada)

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

Implementación:

- Script: `dungeon-blitz/src/server/scripts/export_armory_site_data.ts` (one-off,
  fuera del build del sitio).
- Comando:
  `npx ts-node scripts/export_armory_site_data.ts --out "..\..\..\Calc-Talents DgBlitz-armory\src\features\armory\data"`
  desde `dungeon-blitz/src/server`.
- Los mapas jefe/reino se extraen de `DungeonBlitz.swf` con los opcodes
  `0x60/0x2c/0x2c/0x61` y los nombres de multiname `var_22`/`var_32`.
- `LevelTypes` se normaliza quitando `A_Level_` y `Hard`; se prefiere la entrada normal.
- `MissionTypes` se deduplica por mazmorra y nombre; se descartan las 125 misiones sin
  `Dungeon`.
- `GearTypes` se agrupa por `GearID`; las 20 plantillas `GearID=0` se ignoran.

Criterio de salida:

- 1.182 bases, 3.546 variantes, 394/1.182 por clase.
- 30 globales, 78 variantes globales.
- 0 fuentes sin resolver.
- JSON tipado y tests verdes.

### Sesión 2 — Rutas, i18n y shell (completada)

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
- `pnpm typecheck` y tests de rutas/i18n pasan.

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

1. `pnpm check`.
2. Tests de filtros, agrupación, URL, i18n y dataset.
3. QA con Playwright/`webapp-testing` en 1440, 768 y 390.
4. Si el skill ofrece inspector de navegador, usarlo para revisar la UI; documentar las
   excepciones de marca del juego que no se deban corregir.
5. Verificar build estático, `base` de GitHub Pages, 404 SPA y Vercel.
6. Actualizar `README.md` con la Armería, fuentes y proceso de assets.
7. Cerrar el estado de sesión y preparar el merge.

Criterio de salida:

- `pnpm check` en verde.
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

- `..\dungeon-blitz\src\server\scripts\export_armory_site_data.ts`
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
pnpm install --frozen-lockfile
pnpm check

# Desarrollo
pnpm dev
pnpm lint
pnpm typecheck
pnpm test:run
pnpm build

# FFDec
& "..\dungeon-blitz\tools\ffdec\ffdec.bat" -help export
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
- El dataset se genera con un script one-off externo y se versiona solo la salida JSON.
- Las fuentes se normalizan en `sources.json`; las variantes guardan `sourceId`.
- Los 6 iniciales M usan `starter`; sus R/L usan `realm:Ghost:5`. Los 24 especiales
  usan `global`; iniciales + especiales forman el filtro global (30 IDs / 78 variantes).
- Los 54 sombreros sin `CustomArt` primario conservan sus capas secundarias; el
  fallback de icono se decide en la Sesión 4.
- `MissionTypes` se deduplica por nombre de misión; no se inventan misiones para
  globales.

## 10. Decisiones pendientes

1. **Orden de ranuras:** el usuario mencionó Paladín/Casco primero, pero el juego real
   empieza por Arma. Confirmar si se mantiene el orden real o se aplica la excepción.
2. **Mapa de rarezas:** verificar en el spike si M/R/L corresponden a bronce/plata/oro
   en las placas del juego.
3. **Tamaño de icono:** 56 px es la primera opción; subir a 64 px solo si el spike
   demuestra que 56 px pierde detalle.
4. **Fallback de 54 sombreros:** decidir entre `_DoodadItemPlateBlankIcon01`, icono de
   ranura o composición de capas secundarias en la Sesión 4.

## 11. Estado de sesión

Actualizar esta sección al final de cada sesión. No borrar el historial; añadir una
entrada nueva arriba.

### 2026-10-29 — Sesión 3: vertical slice Paladín/Arma

- Rama/worktree: `feat/armory` en `..\Calc-Talents DgBlitz-armory`; base
  `origin/main` `c9f6f96`; cambios sin commit.
- Fase: Sesión 3 completada; siguiente es la Sesión 4 (iconos completos).
- Hecho:
  - Exportadas y usadas las piezas de `cbp/UI_0_3.swf` para el chrome:
    `ui03_border_42/44/46/48/50`, `ui03_button_53/57`, `ui03_sprite_8/10/20` y
    `ui03_font.woff`.
  - Exportados los iconos reales de la muestra: `AxeStarter1` (ID 1,
    `Farmer's Axe`), `GoblinChopperM` (ID 2, `Goblin's Chopper`) e `IllyricAxeM`
    (ID 3, `Illyric Axe`), a 56 y 112 px.
  - Añadidos `data/constants.ts`, `data/meta.ts` y `data/load.ts`; la carga de
    clase es dinámica por import y `data/index.ts` conserva los JSON estáticos para
    los tests. La shell no importa los tres JSON.
  - `ArmoryPage` con Paladín/Arma por defecto, estante de ranuras en orden real,
    chips de subtipo, buscador, contadores, nota de vista parcial, filas con placa
    de rareza, expansión M/R/L y diálogo nativo de fuente/misiones.
  - Estado en URL: `clase`, `ranura`, `tipo` y `q`; `rareza`/`fuente` quedan
    reservados y se limpian. Cambiar clase conserva `q` y elimina `tipo`; cambiar
    ranura elimina `tipo`; limpiar filtros conserva `clase`.
  - Añadidos `GearItemRow.tsx`, `SourceDialog.tsx`, `visuals.ts` y
    `sourceLabel.ts`; `SourceDialog` usa `showModal()`/`close()` con fallback para
    jsdom.
  - Añadido `@font-face` local para `Dungeon Blitz UI` con
    `ui03_font.woff`; colores de la Armería tokenizados como `--armory-*`.
  - Exportadas las piezas `UI_0_3` usadas; retiradas las no usadas
    (`ui03_frame_26`, `ui03_sprite_4/6/12/14/16/18/22/24`). Los assets de
    `armory/ui` que solo usa `scripts/armory-spike/preview.html` se conservan.
  - Actualizado `scripts/armory-spike/export_armory_spike.py` para usar rutas
    relativas al checkout hermano, sin rutas absolutas.
- Archivos tocados:
  - `src/features/armory/ArmoryPage.tsx`
  - `src/features/armory/GearItemRow.tsx`
  - `src/features/armory/SourceDialog.tsx`
  - `src/features/armory/visuals.ts`
  - `src/features/armory/sourceLabel.ts`
  - `src/features/armory/armory.module.css`
  - `src/features/armory/ArmoryPage.test.tsx`
  - `src/features/armory/data/constants.ts`
  - `src/features/armory/data/meta.ts`
  - `src/features/armory/data/load.ts`
  - `src/features/armory/data/index.ts`
  - `src/i18n/es.ts`
  - `src/i18n/en.ts`
  - `src/styles/tokens.css`
  - `src/styles/global.css`
  - `src/assets/game/calculator/ui/ui03_*`
  - `src/assets/game/armory/icons/AxeStarter1-*`,
    `GoblinChopperM-*`, `IllyricAxeM-*`
  - `scripts/optimize-assets.mjs`
  - `scripts/armory-spike/export_armory_slice.py`
  - `scripts/armory-spike/export_armory_spike.py`
  - `docs/armory-implementation-plan.md`
  - `AGENTS.md`
- Comandos ejecutados:
  - `pnpm install --frozen-lockfile`
  - `pnpm assets:optimize`
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm test:run`
  - `pnpm assets:check`
  - `pnpm build`
  - `pnpm assets:check:dist`
  - QA Playwright con Chromium en 1440×1000 y 390×844, DPR 2, claro/oscuro,
    expansión y diálogo; comprobación de teclado (Enter/Escape), header sticky y
    overflow.
- Tests/build: 39/39 tests en 5 archivos; typecheck y lint verdes; build de 242
  módulos; `assets:check` verde; dist con 140 imágenes WebP (1.408,0 KB). QA sin
  overflow, imágenes rotas, errores de consola/página ni peticiones fallidas; el
  header queda en `top=0` al hacer scroll, Enter abre la expansión y el diálogo,
  el foco entra en el diálogo y Escape lo cierra.
- Decisiones:
  - La vista por defecto es Paladín/Arma; el orden de ranuras es el real del juego.
  - La muestra se limita a tres objetos y muestra `Vista parcial: 3 de 157`; el
    buscador solo compara nombres de objeto y variante (fuente/mazmorra/misión en
    la Sesión 5).
  - M/R/L se representan como bronce/plata/oro; el mapeo final contra
    `ScreenArmory` se verifica en la Sesión 4.
  - El fallback de icono de la muestra es `a_EmptyGearSlotMoveable`; el fallback de
    los 54 sombreros sin arte queda para la Sesión 4.
  - Se usa WOFF en lugar de WOFF2 porque la conversión WOFF2 está bloqueada por la
    ausencia de `brotli`.
  - El diálogo usa `<dialog>` nativo y conserva un fallback para jsdom.
- Bloqueos:
  - WOFF2 bloqueado por falta de `brotli`; se acepta `ui03_font.woff`.
  - Verificación final del mapeo M/R/L contra `ScreenArmory`: Sesión 4.
  - Los 54 sombreros sin `CustomArt` primario y los iconos completos: Sesión 4.
- Riesgos:
  - Las capturas full-page en móvil muestran el header sticky a media página; es
    un artefacto de la captura. La QA de viewport confirma `top=0` al hacer scroll.
  - La muestra usa solo tres iconos reales; la cobertura completa aún no existe.
- Siguiente: Sesión 4 — exportar los 920 `CustomArt`, componer las 3.466
  combinaciones, generar atlas WebP de 56 px por clase y resolver el fallback de
  los 54 sombreros.

### 2026-10-26 — Sesión 2: iconos de clase y tarjetas del selector

- Rama/worktree: `feat/armory` en
  `..\Calc-Talents DgBlitz-armory`; cambios sin
  commit.
- Fase: refinamiento de la Sesión 2; la Sesión 3 sigue pendiente.
- Hecho:
  - Exportados los iconos reales de `p/cbp/UI_0_3.swf`: Paladín 282, Rogue 290 y Mage
    274, a 4× y normalizados a WebP 256×256.
  - Exportados los paneles 306/309/313 sin texto editando el XML y usando `xml2swf`;
    el marco limpio resultante es idéntico en las tres clases (411×201, 822×402 a 2×).
  - Generadas tres tarjetas de clase de 900×500 en WebP componiendo el marco común y
    el icono real; el selector las usa como botones con nombre, recuentos, estado
    activo (título dorado y rombo) y filtro de saturación para las inactivas.
  - Sustituidos los antiguos `a_Icon_*.png` (máscaras/glows) por los `a_Icon_*.webp`
    reales; `scripts/armory-spike/preview.html` apunta a los nuevos assets.
  - Añadidas claves `basesShort`/`variantsShort` en ES/EN para la línea de recuentos.
- Archivos tocados: `src/features/armory/ArmoryPage.tsx`,
  `src/features/armory/armory.module.css`, `src/i18n/es.ts`, `src/i18n/en.ts`,
  `src/assets/game/armory/ui/a_ClassCard*.webp`,
  `src/assets/game/armory/ui/a_Icon_*.webp`,
  `scripts/armory-spike/preview.html`, `docs/armory-implementation-plan.md`.
- Comandos: `pnpm check` (lint, typecheck, 32/32 tests, build); QA Playwright con
  Chromium en 1440 y 390, claro y oscuro, español e inglés; sin errores de consola ni
  peticiones fallidas.
- Decisiones:
  - Un marco común sin el glow de clase: el color de clase lo aporta el icono.
  - Las tarjetas muestran los recuentos como apoyo; la shell conserva el detalle.
  - WebP para reducir peso: iconos 16–19 KB y tarjetas ~26–28 KB.
- Bloqueos: ninguno.
- Siguiente: Sesión 3 — vertical slice Paladín/Arma con buscador, estante de ranuras y
  tres objetos reales.

### 2026-10-26 — Sesión 2: rutas, i18n y shell

- Rama/worktree: `feat/armory` en
  `..\Calc-Talents DgBlitz-armory`.
- Último commit: `d752c84` (base `origin/main`); los cambios de esta sesión quedan
  sin commit.
- Fase: Sesión 2 completada; siguiente es Sesión 3 (vertical slice).
- Hecho:
  - Rama `feat/armory` avanzada a `origin/main` (`d752c84`) y worktree recreado.
  - `armory` añadido a `RouteKey`/`routePath`: `/equipo` y `/en/gear`.
  - Rutas registradas en `App.tsx` con carga lazy de `ArmoryPage`.
  - “Armería”/“Armory” añadido a la navegación superior.
  - `useLocale` conserva `location.search` y `location.hash`, y mapea
    `/equipo` ↔ `/en/gear`.
  - Claves ES/EN de la Armería y metadatos de página.
  - `ArmoryPage`: título, selector de clase con tres botones, `aria-pressed` y
    `?clase=` en la URL; conserva el resto de parámetros.
  - La shell no importa los JSON de clase; solo `manifest.json` para los recuentos.
  - Tests nuevos de rutas, `useLocale` y `ArmoryPage` (32 tests en total).
  - QA de navegador en 1440 y 390, tema claro y oscuro; sin errores de consola.
- En curso: nada; handoff.
- Siguiente: Sesión 3 — vertical slice Paladín/Arma con buscador, estante de
  ranuras y tres objetos reales.
- Archivos tocados:
  - `src/app/paths.ts`
  - `src/app/useLocale.ts`
  - `src/app/App.tsx`
  - `src/components/Header.tsx`
  - `src/i18n/es.ts`
  - `src/i18n/en.ts`
  - `src/features/armory/ArmoryPage.tsx`
  - `src/features/armory/armory.module.css`
  - `src/features/armory/ArmoryPage.test.tsx`
  - `src/app/paths.test.ts`
  - `src/app/useLocale.test.tsx`
  - `src/test/setup.ts`
  - `docs/armory-implementation-plan.md`
- Comandos ejecutados:
  - `pnpm install --frozen-lockfile`
  - `pnpm check` (línea base antes de tocar código)
  - `pnpm typecheck`
  - `pnpm test:run`
  - `pnpm lint`
  - QA Playwright con `webapp-testing` en 1440 y 390, claro y oscuro.
- Tests/build: línea base 24/24; ahora 32/32, typecheck y lint verdes.
- Decisiones:
  - Se reutiliza `feat/armory` avanzándola a `origin/main`; no se crea una rama
    nueva.
  - El selector escribe `clase` con `replace` para no llenar el historial.
  - Al cambiar de clase se conservan el resto de parámetros de búsqueda.
  - Los recuentos usan solo `manifest.json` para evitar cargar ~1,59 MB de JSON de
    clase en la shell.
- Bloqueos: ninguno.
- Riesgos:
  - El contenido de la shell es provisional hasta las Sesiones 3 y 5.
  - La QA visual se hizo con Chromium headless; falta la revisión final de la
    Sesión 6.

### 2026-10-26 — Cierre Sesión 1: PR #2 mergeado

- PR: https://github.com/Sibahia/dgblitz-latam-pages/pull/2
- Merge commit: `f1bb99c8d4f1aff71c1297c73ff92c9142179845`
- `main` actualizado y subido a `origin/main`; checks de CI en verde.
- Worktree `..\Calc-Talents DgBlitz-armory` eliminado; `git worktree list` solo muestra
  el worktree principal.
- Rama `feat/armory` mergeada; sin cambios pendientes.
- Siguiente: Sesión 2 — rutas `/equipo` y `/en/gear`, i18n y shell de la Armería.

### 2026-10-26 — Sesión 1: dataset generado

- Rama/worktree: `feat/armory` en
  `..\Calc-Talents DgBlitz-armory`.
- Último commit de implementación: `a571323` (Sesión 0 + Sesión 1); esta entrada se
  actualiza en el commit de cierre documental.
- Fase: Sesión 1 completada; siguiente es Sesión 2 (rutas, i18n y shell).
- Hecho:
  - Creado el script one-off externo
    `dungeon-blitz/src/server/scripts/export_armory_site_data.ts`; reutiliza
    `parseSwz`, `parseSwf`, `parseAbc` y `disassemble`.
  - Generados `paladin.json`, `rogue.json`, `mage.json`, `sources.json` y
    `manifest.json` en `src/features/armory/data/`.
  - Añadidos `src/features/armory/types.ts` y `src/features/armory/data/index.ts`.
  - Añadidos tests de integridad en
    `src/features/armory/data/armoryData.test.ts`.
  - Dataset validado: 1.182 bases / 3.546 variantes; 394 / 1.182 por clase.
  - Fuentes: 147 registros (64 jefes, 53 reinos, 6 iniciales, 24 globales); 0 sin
    resolver; 65 mazmorras.
  - Misiones: 293 totales, 168 con mazmorra, 130 dentro de mazmorras de equipo y 67
    nombres únicos.
  - Arte: 920 `CustomArt` únicos, 1.183 `artKey`, 3.466 `iconKey`, 54 variantes sin
    capa primaria y 0 sin ninguna capa.
  - Añadidos hashes SHA-256 de las tres fuentes a `manifest.json`.
- En curso: nada; handoff.
- Siguiente: Sesión 2 — rutas `/equipo` y `/en/gear`, i18n y shell de la Armería.
- Archivos tocados:
  - `src/features/armory/types.ts`
  - `src/features/armory/data/index.ts`
  - `src/features/armory/data/armoryData.test.ts`
  - `src/features/armory/data/paladin.json`
  - `src/features/armory/data/rogue.json`
  - `src/features/armory/data/mage.json`
  - `src/features/armory/data/sources.json`
  - `src/features/armory/data/manifest.json`
  - `docs/armory-implementation-plan.md`
- Comandos ejecutados:
  - `npx ts-node scripts/export_armory_site_data.ts --out "...\src\features\armory\data"`
  - `pnpm typecheck`
  - `pnpm test:run`
  - `pnpm lint`
  - `pnpm check`
- Tests/build: `pnpm check` correcto; 24/24 tests, typecheck, lint y build.
- Decisiones:
  - El script no se versiona en el sitio; solo se versiona la salida JSON.
  - `sources.json` normaliza las fuentes; las variantes guardan `sourceId`.
  - Iniciales M → `starter`; R/L → `realm:Ghost:5`. Especiales → `global`.
  - `artKey` conserva las tres capas; `iconKey` añade los diez `ColorSwap`.
  - Las misiones se deduplican por nombre dentro de cada mazmorra.
- Bloqueos:
  - Fallback de los 54 sombreros sin `CustomArt` primario: Sesión 4.
  - Mapeo M/R/L a placas y orden real de capas: verificar en Sesión 3/4.
- Riesgos:
  - Los JSON de clase suman ~1,59 MB; importar las tres clases en el bundle inicial
    puede inflarlo. La Sesión 2/3 debe cargar por clase o lazy.

### 2026-10-26 — Sesión 0: spike de assets validado

- Rama/worktree: `feat/armory` en
  `..\Calc-Talents DgBlitz-armory`.
- Último commit: `cbbc21a`; los cambios de esta sesión quedan sin commit.
- Fase: Sesión 0 completada; siguiente es Sesión 1 (dataset).
- Hecho:
  - Exportados y compuestos tres iconos Paladín con FFDec + Pillow:
    `AxeStarter1` (M, bronce), `ArmorStore3R` (R, plata) y `BracersStore6L`
    (L, oro), a 56 px y 112 px.
  - Confirmado que `ArmorLion04$Female` usa
    `a_Torso2_ArmorLion04Female` (3948); la clase 3600 no la referencia ningún
    `Gear`.
  - Resuelto `ColorSwap` con colores con nombre de `DungeonBlitz.as`; probado
    `ArmorStore3-M` con `gPaleBrown`/`gPaleBrownDk`.
  - Elegido guante sobre botas para la tercera muestra: icono cuadrado y
    legible; las botas eran alargadas.
  - Copiadas 12 piezas de UI a `src/assets/game/armory/ui/`.
  - Creados `scripts/armory-spike/export_armory_spike.py` y
    `scripts/armory-spike/preview.html`; el preview tiene tema claro/oscuro.
  - Revisado el preview en Chromium headless a 1440 px y 390 px, en claro y
    oscuro; corregido el layout de la sección de decisiones.
  - `pnpm check` en verde: 15 tests, typecheck, lint y build.
- En curso: nada; handoff.
- Siguiente: Sesión 1 — generar el dataset desde `Login.swz`, `Game.en.swz` y
  los mapas de `DungeonBlitz.swf`.
- Archivos tocados:
  - `scripts/armory-spike/export_armory_spike.py`
  - `scripts/armory-spike/preview.html`
  - `scripts/armory-spike/out/` (placas, ranuras y verificación)
  - `src/assets/game/armory/icons/`
  - `src/assets/game/armory/ui/`
  - `.gitignore` (`scripts/armory-spike/out/raw/`)
  - este plan
- Comandos ejecutados:
  - `python scripts/armory-spike/export_armory_spike.py`
  - `pnpm check`
  - capturas con Playwright/Chromium del preview en claro, oscuro y móvil.
- Tests/build: `pnpm check` correcto; 15/15 tests.
- Decisiones:
  - Icono de equipo a 56 px (112 px como 2x); no exportar aún los 3.466.
  - Orden visual de capas: arma grip + hoja; guantes mano + tres capas del
    brazo izquierdo. La animación real puede usar otras poses.
  - M/R/L = Magic/Rare/Legendary; bronce/plata/oro como decisión de spike.
  - `out/raw/` se ignora; `out/plates` y `out/verify` se conservan para el
    preview.
- Bloqueos:
  - El orden real de capas en la animación no está verificado; la composición
    es representativa.
  - El mapeo M/R/L a placas no está verificado en el código de `ScreenArmory`.
  - El parser de bounds no está preparado para los 3.466 iconos
    (rendimiento/rotación/multiframe).
  - Nombres finales en inglés pendientes de `Login.swz` en la Sesión 1.
- Riesgos:
  - El preview depende de `out/plates/` y `out/verify/`; si se regeneran, hay
    que mantener esos nombres.
  - `a_ArmoryWindow` es una captura de referencia, no un frame reutilizable.

### 2026-10-26 — Sesión 0: worktree preparado

- Rama/worktree: `feat/armory` en
  `..\Calc-Talents DgBlitz-armory`.
- `main`: commit `970482e` (`docs: add armory implementation plan`).
- Fase: Sesión 0 iniciada; spike de assets pendiente.
- Hecho:
  - Commit en `main` con `AGENTS.md`, `LICENSE`, `README.md` y este plan.
  - Worktree creado desde `main` en la ruta indicada.
  - `pnpm install --frozen-lockfile` y `pnpm check` en verde: 15 tests y build correcto.
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
