

<p align="center">
  <img src="assets/sls-logo.svg" width="720" alt="Strange Lil Scaffold">
</p>

# Strange Lil Scaffold Monorepo

[![Install](https://img.shields.io/badge/Install-npx%20create--strange--lil--scaffold-CB3837?logo=npm)](https://www.npmjs.com/package/create-strange-lil-scaffold)
[![npm](https://img.shields.io/npm/v/create-strange-lil-scaffold?logo=npm)](https://www.npmjs.com/package/create-strange-lil-scaffold)
[![Publish](https://img.shields.io/github/actions/workflow/status/thegreatbey/strange-lil-scaffold-monorepo/publish.yml?branch=main&logo=github)](https://github.com/thegreatbey/strange-lil-scaffold-monorepo/actions/workflows/publish.yml)
[![Install size](https://packagephobia.com/badge?p=create-strange-lil-scaffold)](https://packagephobia.com/result?p=create-strange-lil-scaffold)
[![Downloads](https://img.shields.io/npm/dm/create-strange-lil-scaffold)](https://www.npmjs.com/package/create-strange-lil-scaffold)
[![License](https://img.shields.io/github/license/thegreatbey/strange-lil-scaffold-monorepo)](https://github.com/thegreatbey/strange-lil-scaffold-monorepo/blob/main/LICENSE)

> Monorepo for **Strange Lil Scaffold** — a tiny TypeScript CLI scaffolder.  
> Packages: **strange-lil-scaffold** (core) and **create-strange-lil-scaffold** (wrapper).

## What is this?

- **Core (`strange-lil-scaffold`)** – library + CLI that scaffolds a TS CLI project (writes `package.json`, `tsconfig.json`, `src/cli.ts`, `.gitignore`, README badges, and `.github/workflows/publish.yml`).
- **Wrapper (`create-strange-lil-scaffold`)** – the user-facing CLI you run with `npx`; it gathers flags/answers and calls the core.

## Quick start

```bash
# interactive
npx create-strange-lil-scaffold@latest my-app

# non-interactive defaults (CJS)
npx create-strange-lil-scaffold@latest my-app --yes

# choose module system
npx create-strange-lil-scaffold@latest my-app --module esm
npx create-strange-lil-scaffold@latest my-app --module cjs

# add Jest or custom test script
npx create-strange-lil-scaffold@latest my-app --jest
npx create-strange-lil-scaffold@latest my-app --test "vitest run"
```

## What it generates

- `package.json` with `bin: dist/cli.js`, scripts, and sensible defaults
- `tsconfig.json` (CJS or ESM settings)
- `src/cli.ts` (hello-world CLI)
- `.gitignore` (Node/TS basics)
- `README.md` (injects badges if a heading exists, or creates a new README)
- `.github/workflows/publish.yml` (tag-push → npm publish with `NPM_TOKEN`)

## Publish via GitHub Actions

1. Add repo secret **`NPM_TOKEN`** (Settings → Secrets and variables → Actions).
2. Bump & tag:
   ```bash
   npm version patch   # creates git tag vX.Y.Z
   git push --follow-tags
   ```
3. The workflow builds and publishes to npm (with provenance if supported).

## Monorepo layout

```
packages/
  strange-lil-scaffold/         # core engine (exports runScaffold)
  create-strange-lil-scaffold/  # wrapper CLI (npx entry)
```

## Local development

```bash
# build both packages
npm run build

# smoke test (scaffolds a temp app and builds it)
npm run smoke
```

## License

MIT © thegreatbey
