<p align="center">
  <img src="https://raw.githubusercontent.com/thegreatbey/strange-lil-scaffold-monorepo/main/assets/sls-logo.svg" width="720" alt="Strange Lil Scaffold">
</p>

# strange-lil-scaffold

[![Install](https://img.shields.io/badge/Install-npm%20i%20strange--lil--scaffold-CB3837?logo=npm)](https://www.npmjs.com/package/strange-lil-scaffold)
[![npm](https://img.shields.io/npm/v/strange-lil-scaffold?logo=npm)](https://www.npmjs.com/package/strange-lil-scaffold)
[![Publish](https://img.shields.io/github/actions/workflow/status/thegreatbey/strange-lil-scaffold-monorepo/publish.yml?branch=main&logo=github)](https://github.com/thegreatbey/strange-lil-scaffold-monorepo/actions/workflows/publish.yml)
[![Install size](https://packagephobia.com/badge?p=strange-lil-scaffold)](https://packagephobia.com/result?p=strange-lil-scaffold)
[![Downloads](https://img.shields.io/npm/dm/strange-lil-scaffold)](https://www.npmjs.com/package/strange-lil-scaffold)
[![License](https://img.shields.io/github/license/thegreatbey/strange-lil-scaffold-monorepo)](https://github.com/thegreatbey/strange-lil-scaffold-monorepo/blob/main/LICENSE)

Core engine (library + CLI) used by the wrapper. Exports `runScaffold(options)` and also ships a bin.

## Install

```bash
npm i strange-lil-scaffold
# or global CLI (optional)
npm i -g strange-lil-scaffold
```

## Programmatic usage

```ts
import { runScaffold } from "strange-lil-scaffold";

await runScaffold({
  projectDir: "my-app",
  esm: false,         // or true
  yes: true,          // skip questions
  name: "my-app",
  owner: "thegreatbey",
  repo: "my-app",
  jest: false,
  testCommand: undefined
});
```

## CLI (optional)

```bash
# if installed globally
strange-lil-scaffold --help
```

## What it writes

- `package.json` + `tsconfig.json` + `src/cli.ts`
- `.gitignore` (includes archives like *.zip, *.tar.gz)
- `README.md` with badges (creates or injects)
- `.github/workflows/publish.yml` (tag‑push → npm publish with `NPM_TOKEN`)

## Types

This package ships types:
```jsonc
// package.json
"types": "dist/index.d.ts"
```
