# AGENTS.md

## Project
Dungeon Blitz (2012) fan/reference site: documentary and guide content plus a talent calculator. The home page starts with a Hero and the calculator is the main interactive page. Spanish (`es`) is the default locale; English (`en`) is required. The visual direction must follow the game, not a generic SaaS template.

## Current state
- Implemented static site: Vite + React + TypeScript with a home page, talent calculator (9 disciplines, 90 points, 42 talentstones each, shareable build links), bilingual guides, light/dark theme, tests, and GitHub Pages deployment. `README.md` documents setup, data/assets, deployment, and licensing.
- Visual/content reference: the local game asset dump described in **Game assets** is the primary source for the game's look and data. `https://github.com/Sibahia/dg-latam` was not accessible (404) when this file was written; do not guess its structure or invent game data.
- `.agents/skills/` and `skills-lock.json` are installed skill assets, not app code. Do not edit or delete them.
- Multi-session Armory plan: `docs/armory-implementation-plan.md`. Read it before an Armory session and update its session state before stopping.

## Game assets (external, read-only)
- All Dungeon Blitz sprites, UI art, animations, music, SFX, and game XML live outside this repo at:
  `dungeon-blitz\src\client\content\localhost\p`
  It is the client asset dump. Treat it as read-only: never edit, move, reorganize, or commit it here.
- Verified inventory: subfolders `caa`, `caf`, `cag`, `cam`, `cbo`, `cbp`, `cbq`, `cbw`, `mp3`; 73 `.swf`, 120 `.mp3`, 7 `.xml`, plus `.swz` (compressed SWF) and `.bak*` backups that the site does not need.
- UI/design assets are the `UI*.swf` files; use them as the reference for the site's frames, buttons, panels, icons, and overall game chrome:
  - `cbp/UI_0.swf` (master/`Required`), `cbp/UI_1.swf`, `cbp/UI_2.swf`, `cbp/UI_4.swf`, `cbp/UI_0_1.swf`–`UI_0_3.swf`
  - `caa/UI_Library.swf` (shared UI library), `caa/UI_3.swf`, `cbo/UI_Seasonal.swf`
- Class art/animations: `caf/Animation_Paladin.swf` + `caf/Animation_Paladin_1.swf` + `cbp/Gfx_Paladin_1.swf`; `cbp/Animation_Rogue.swf` + `cbp/Gfx_Rogue_1.swf`; `cbp/Animation_Mage.swf` + `cbp/Animation_Mage_1.swf` + `cbp/Gfx_Mage_1.swf`. The files are named `Mage`, not "Mague".
- `cbq/masterFileList.xml` (also `cbw/`) maps logical asset names to their `Version` folder and load stage (`Required`, `Init`, `Login`, `Lib`, `Core`, `Game`). Consult it when resolving names.
- Music is in `mp3/`; sound effects are `cbp/SFX_1…3.swf` and `cbp/sounds/Sound.swf`.
- To extract sprites/icons/audio, use JPEXS FFDec already installed at `dungeon-blitz\tools\ffdec` (`ffdec-cli.exe` / `ffdec.bat`, Java 17+). Export only the assets the site uses, optimize them, and add them to this repo's asset folder keeping original names where possible.
- The static build must be self-contained: do not hotlink or runtime-load the external path, and do not copy the full dump; copy only the files the site ships.

## Stack and commands
- Stack: Vite + React + TypeScript. Frontend-only; the build must be static and deployable to both GitHub Pages and Vercel.
- Package manager: pnpm (`pnpm-lock.yaml`). Do not use npm or yarn.
- The app is already scaffolded in the repo root. Do not re-scaffold or run generators that could overwrite `.agents/` or `skills-lock.json`.
- Commands: `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm preview`.
- Quality commands: `pnpm lint` (Oxlint), `pnpm typecheck`, `pnpm test`, `pnpm test:run`, and `pnpm check` (lint + typecheck + tests + build). CI runs these before deployment.

## Deployment constraints
- GitHub Pages project sites live under a subpath. Make Vite `base` configurable via env and use relative asset URLs; never hardcode `/`-rooted assets.
- With `BrowserRouter`, add a GitHub Pages `404.html` SPA fallback; otherwise use hash routing. Keep the same static build working on Vercel.
- Do not add server-only features (SSR, API routes, filesystem access) while the project is static.

## Conventions
- Localization: all user-visible copy goes through locale files. Keep `es` and `en` in parity; Spanish is the default. Do not hardcode strings in components.
- Theme: implement dark/light with CSS custom properties, honor `prefers-color-scheme`, and persist the user choice. Avoid hardcoded colors in components.
- Calculator: client-side only. Put game data and formulas in typed modules and keep components presentational. Never invent stats; verify against the reference source.
- UI work: consult `.agents/skills/frontend-design/SKILL.md`, `.agents/skills/design-taste-frontend/SKILL.md`, or `.agents/skills/ui-ux-pro-max/SKILL.md`; use `.agents/skills/webapp-testing/` for browser checks.
- The workspace path contains a space (`Calc-Talents DgBlitz`); quote paths in shell commands.
