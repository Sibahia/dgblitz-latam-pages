# AGENTS.md

## Project
Dungeon Blitz (2012) fan/reference site: documentary and guide content plus a talent calculator. The home page starts with a Hero and the calculator is the main interactive page. Spanish (`es`) is the default locale; English (`en`) is required. The visual direction must follow the game, not a generic SaaS template.

## Current state
- Greenfield repo: only `.agents/skills/` and `skills-lock.json`. There is no `package.json`, source code, README, or git history yet.
- Visual/content reference: `https://github.com/Sibahia/dg-latam`. It was not accessible (404) when this file was written, so do not guess its structure or invent game data; use it once attached.
- `.agents/skills/` and `skills-lock.json` are installed skill assets, not app code. Do not edit or delete them.

## Stack and commands
- Stack: Vite + React + TypeScript. Frontend-only; the build must be static and deployable to both GitHub Pages and Vercel.
- Scaffolding in this non-empty directory can delete the skills: create the Vite app in a temp folder and merge it, or choose "Ignore files and continue" if prompted.
- After scaffold: `npm install`, `npm run dev`, `npm run build`, `npm run preview`.
- There are no lint/test scripts yet. Do not assume `npm run lint` or `npm test` works until they are added.

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
