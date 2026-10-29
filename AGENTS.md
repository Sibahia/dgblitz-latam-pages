# AGENTS.md

## Project
Dungeon Blitz (2012) fan/reference site: documentary and guide content plus a talent calculator. The home page starts with a Hero and the calculator is the main interactive page. Spanish (`es`) is the default locale; English (`en`) is required. The visual direction must follow the game, not a generic SaaS template.

## Current state
- Implemented static site: Vite + React + TypeScript with a home page, talent calculator (9 disciplines, 90 points, 42 talentstones each, shareable build links), bilingual guides, an Armory vertical slice (Paladin/weapons, filters, source dialog), light/dark theme, tests, and GitHub Pages deployment. `README.md` documents setup, data/assets, deployment, and licensing.
- Asset optimization is complete: the shipped build uses 140 WebP (1,408.0 KB), no PNG/JPG or inline image data, and `pnpm check` passes (39 tests). See **Asset pipeline** for details.
- Visual/content reference: the local game asset dump described in **Game assets** is the primary source for the game's look and data. `https://github.com/Sibahia/dg-latam` was not accessible (404) when this file was written; do not guess its structure or invent game data.
- `.agents/skills/` and `skills-lock.json` are installed skill assets, not app code. Do not edit or delete them.
- Multi-session Armory plan: `docs/armory-implementation-plan.md`. Read it before an Armory session and update its session state before stopping.

## Game assets (external, read-only)
- All Dungeon Blitz sprites, UI art, animations, music, SFX, and game XML live outside this repo in the sibling checkout at:
  `..\dungeon-blitz\src\client\content\localhost\p` (relative to this repo root)
  It is the client asset dump. Treat it as read-only: never edit, move, reorganize, or commit it here.
- Verified inventory: subfolders `caa`, `caf`, `cag`, `cam`, `cbo`, `cbp`, `cbq`, `cbw`, `mp3`; 73 `.swf`, 120 `.mp3`, 7 `.xml`, plus `.swz` (compressed SWF) and `.bak*` backups that the site does not need.
- UI/design assets are the `UI*.swf` files; use them as the reference for the site's frames, buttons, panels, icons, and overall game chrome:
  - `cbp/UI_0.swf` (master/`Required`), `cbp/UI_1.swf`, `cbp/UI_2.swf`, `cbp/UI_4.swf`, `cbp/UI_0_1.swf`–`UI_0_3.swf`
  - `caa/UI_Library.swf` (shared UI library), `caa/UI_3.swf`, `cbo/UI_Seasonal.swf`
- Class art/animations: `caf/Animation_Paladin.swf` + `caf/Animation_Paladin_1.swf` + `cbp/Gfx_Paladin_1.swf`; `cbp/Animation_Rogue.swf` + `cbp/Gfx_Rogue_1.swf`; `cbp/Animation_Mage.swf` + `cbp/Animation_Mage_1.swf` + `cbp/Gfx_Mage_1.swf`. The files are named `Mage`, not "Mague".
- `cbq/masterFileList.xml` (also `cbw/`) maps logical asset names to their `Version` folder and load stage (`Required`, `Init`, `Login`, `Lib`, `Core`, `Game`). Consult it when resolving names.
- Music is in `mp3/`; sound effects are `cbp/SFX_1…3.swf` and `cbp/sounds/Sound.swf`.
- To extract sprites/icons/audio, use JPEXS FFDec already installed at `..\dungeon-blitz\tools\ffdec` (`ffdec-cli.exe` / `ffdec.bat`, Java 17+). Export only the assets the site uses, optimize them, and add them to this repo's asset folder keeping original names where possible.
- The static build must be self-contained: do not hotlink or runtime-load the external path, and do not copy the full dump; copy only the files the site ships.

## UI chrome from `cbp/UI_0_3.swf` (mandatory)
- The website's visual chrome comes from `cbp/UI_0_3.swf`. All visible containers and surfaces — page sections, cards, panels, nav/sidebar, modals, tooltips, dropdowns, buttons, and class badges — must be skinned with these sprites. Layout-only wrappers may stay invisible. Do not replace them with generic flat/SaaS cards or invented CSS chrome, and do not ship the full SWF.
- Verified FFDec character IDs (checked 2026-10-26):

| Purpose | IDs | Notes |
| --- | --- | --- |
| Stone containers / frame | 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26 | 26 is the full 1405×919 stone frame for large surfaces; 4/8/10/12/14/20/24 are panel fills, 6 is a vertical edge, 16/22 are corner/cap pieces, and 18 is a horizontal ledge. Build 9-slice/layered backgrounds; do not just stretch one image. |
| Gold trim / button borders | 42, 44, 46, 48, 50, 53, 57 | 42–50 are corner/rail pieces (44 is the horizontal rail); 53/57 are button frame variants. Prefer `border-image` or layered backgrounds over approximated CSS borders. |
| Class icons without badge | 281 Paladin, 289 Rogue, 273 Mage | Transparent class art for headers, lists, and icon-only controls. |
| Class icons with badge | 282 Paladin, 290 Rogue, 274 Mage | Built-in game badge for selected/active class controls. |
| UI font | font ID 1 (`a_Font_BasicUI`, `HelveticaRounded LT Std Bd`) | Export to local WOFF2/WOFF and load with `@font-face`. Use it as the primary UI typeface (headings, labels, controls, body copy); no external font CDN. |

- Keep class mappings exact: 273/274 are Mage (staff), 281/282 Paladin (shield), 289/290 Rogue (blades). Do not relabel them.
- Preserve corners at native aspect ratio; stretch/tile only flat stone and rail sections. Keep text contrast and semantic/ARIA content above the decorative sprite layers.
- Export only the pieces used into `src/assets/game/calculator/ui/` with stable names such as `ui03_sprite_8.webp`, `ui03_border_44.webp`, `ui03_button_53.webp`, and `ui03_font.woff2`; optimize them before committing.
- The site imports image assets as WebP only; the UI font is a local WOFF/WOFF2. Keep original PNG/JPG files as unreferenced sources; see **Asset pipeline** for generation, quality settings, current sizes, and verification.

## Asset pipeline
- Source originals stay in `src/assets/game/` as unreferenced PNG/JPG (130 PNG, 9 JPG), plus the `background.webp` source; generated WebP live alongside them. Never import PNG/JPG in app code.
- `sharp` is a devDependency. `scripts/optimize-assets.mjs` generates 149 WebP: 13 UI lossless (including `master-skills-0.webp`…`master-skills-8.webp`, 195×130 each), 10 `UI_0_3` pieces, 78 icons lossless, 9 Armory UI pieces, 10 Armory icons, 27 portrait WebP (9 portraits at 382/256/96; q85/q82/q82), and 2 background WebP (960/1440; q82). Three class-card WebP, three preview-only class-icon WebP, and the background source are authored WebP, not generated.
- `pnpm assets:optimize` regenerates; `pnpm assets:check` verifies all expected files; `node scripts/optimize-assets.mjs --verify` checks lossless/visible pixels. All game imports use `?url&no-inline`, and `vite.config.ts` excludes `src/assets/game/` from `assetsInlineLimit` so icons never become base64 in JS.
- `scripts/check-dist-assets.mjs` rejects PNG/JPG/GIF, `data:image` in JS/CSS, and images >200 KB. `pnpm assets:check:dist` runs after `pnpm build`; `pnpm check` chains lint, typecheck, tests, asset check, build, and dist audit.
- `master-skills` is split by discipline; `getSkillSpritePosition(skillId, unlocked)` returns local coordinates for the 195×130 sheet. The 380px `talent-tree-v5` variant was discarded because the 608px version is smaller; measure before adding another variant.
- Playwright baseline at 1440×1000 and 390×844, DPR 2: initial image payload is 188.5 KB desktop / 174.5 KB mobile on the home page and 371.2 KB desktop / 357.2 KB mobile on the calculator; home loads 18 images, calculator 28; no broken images, legacy raster requests, or console errors. Background selects 1440px desktop / 960px mobile; skill sheets render at 195×130.
- Largest generated asset: `src/assets/game/calculator/ui/discipline-select.webp` at ~149 KB, kept lossless by policy. If its size becomes a problem, evaluate near-lossless/lossy only with visual QA.

## Stack and commands
- Stack: Vite + React + TypeScript. Frontend-only; the build must be static and deployable to both GitHub Pages and Vercel.
- Path aliases: `@/` maps to `src/`. It is configured in `tsconfig.app.json` (`paths`) and `vite.config.ts` (`resolve.alias`); Vitest inherits the Vite alias.
- Package manager: pnpm (`pnpm-lock.yaml`). Do not use npm or yarn.
- The app is already scaffolded in the repo root. Do not re-scaffold or run generators that could overwrite `.agents/` or `skills-lock.json`.
- Commands: `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm preview`, `pnpm assets:optimize`.
- Quality commands: `pnpm lint` (Oxlint), `pnpm typecheck`, `pnpm test`, `pnpm test:run`, `pnpm assets:check`, `pnpm assets:check:dist`, and `pnpm check` (lint + typecheck + tests + asset check + build + dist audit). CI runs these before deployment.

## Deployment constraints
- GitHub Pages project sites live under a subpath. Make Vite `base` configurable via env and use relative asset URLs; never hardcode `/`-rooted assets.
- With `BrowserRouter`, add a GitHub Pages `404.html` SPA fallback; otherwise use hash routing. Keep the same static build working on Vercel.
- Do not add server-only features (SSR, API routes, filesystem access) while the project is static.

## Conventions
- Localization: all user-visible copy goes through locale files. Keep `es` and `en` in parity; Spanish is the default. Do not hardcode strings in components.
- Imports: use the `@/` path alias (`src/`) for every import outside the file's own directory; keep `./...` only for co-located files. Never use `../` chains, including `import.meta.glob` patterns and Vite-resolved CSS `url()` references.
- Theme: implement dark/light with CSS custom properties, honor `prefers-color-scheme`, and persist the user choice. Avoid hardcoded colors in components.
- Calculator: client-side only. Put game data and formulas in typed modules and keep components presentational. Never invent stats; verify against the reference source.
- UI work: consult `.agents/skills/frontend-design/SKILL.md`, `.agents/skills/design-taste-frontend/SKILL.md`, or `.agents/skills/ui-ux-pro-max/SKILL.md`; use `.agents/skills/webapp-testing/` for browser checks.
- Paths: in docs, reference files relative to the repo root (`src/...`, `..\dungeon-blitz\...`); never write absolute paths with a drive letter or user profile. In code, imports use the `@/` alias described in **Stack and commands**.
- The workspace path contains a space (`Calc-Talents DgBlitz`); quote paths in shell commands.
