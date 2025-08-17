<p align="center">
  <img src="https://raw.githubusercontent.com/thegreatbey/strange-lil-scaffold-monorepo/main/assets/sls-logo.svg" width="720" alt="Strange Lil Scaffold">
</p>

# create-strange-lil-scaffold

[![Install](https://img.shields.io/badge/Install-npx%20create--strange--lil--scaffold-CB3837?logo=npm)](https://www.npmjs.com/package/create-strange-lil-scaffold)
[![npm](https://img.shields.io/npm/v/create-strange-lil-scaffold?logo=npm)](https://www.npmjs.com/package/create-strange-lil-scaffold)
[![Publish](https://img.shields.io/github/actions/workflow/status/thegreatbey/strange-lil-scaffold-monorepo/publish.yml?branch=main&logo=github)](https://github.com/thegreatbey/strange-lil-scaffold-monorepo/actions/workflows/publish.yml)
[![Install size](https://packagephobia.com/badge?p=create-strange-lil-scaffold)](https://packagephobia.com/result?p=create-strange-lil-scaffold)
[![Downloads](https://img.shields.io/npm/dm/create-strange-lil-scaffold)](https://www.npmjs.com/package/create-strange-lil-scaffold)
[![License](https://img.shields.io/github/license/thegreatbey/strange-lil-scaffold-monorepo)](https://github.com/thegreatbey/strange-lil-scaffold-monorepo/blob/main/LICENSE)

User-facing CLI for **Strange Lil Scaffold** — generate a tiny, publish‑ready **TypeScript CLI** project in seconds.

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

## Flags

- `-y, --yes` – accept defaults (non‑interactive)
- `-m, --module <cjs|esm>` – module system (or `--esm`)
- `--jest` – add `jest.config.cjs` and set `"test": "jest"`
- `-t, --test "<script>"` – custom test script (overrides `--jest`)
- `-d, --dir <path>` / `--projectDir <path>` – target directory
- `--owner <name>` / `--repo <name>` – for README badges
- `--ci` – create `.github/workflows/publish.yml`
- `--no-gitignore` – skip writing `.gitignore`
- `-h, --help` – show help

## What you get

- `package.json` (bin → `dist/cli.js`, scripts, MIT, engines)
- `tsconfig.json` (CJS or ESM)
- `src/cli.ts` (hello‑world CLI)
- `.gitignore` (Node/TS basics, archives ignored)
- `README.md` (injects badges or creates one)
- `.github/workflows/publish.yml` (tag‑push → npm publish with `NPM_TOKEN`)

## Publish via GitHub Actions

1. Add repo secret **`NPM_TOKEN`** (Settings → Secrets and variables → Actions).
2. Bump & tag:
   ```bash
   npm version patch   # creates git tag vX.Y.Z
   git push --follow-tags
   ```
3. The workflow builds and publishes to npm (with provenance if run in CI).
