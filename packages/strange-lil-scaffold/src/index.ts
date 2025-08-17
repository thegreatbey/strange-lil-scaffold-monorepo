// packages/strange-lil-scaffold/src/index.ts
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

// Status of a write operation
type FileWriteStatus = "created" | "skipped" | "overwritten" | "none";

export interface Options {
  projectDir?: string;
  esm?: boolean | null;
  yes?: boolean;
  name?: string;
  owner?: string;
  repo?: string;

  // Optional scaffolding features
  jest?: boolean;           // if true, create jest.config.cjs and set "test": "jest"
  testCommand?: string;     // overrides Jest if provided
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers (declare BEFORE use)
// ─────────────────────────────────────────────────────────────────────────────

function ask(q: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(q, (ans) => { rl.close(); resolve(ans); }));
}

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

function writeFileSafely(
  dest: string,
  contents: string,
  overwrite = false
): FileWriteStatus {
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (fs.existsSync(dest)) {
    if (!overwrite) return "skipped";
    fs.writeFileSync(dest, contents, "utf8");
    return "overwritten";
  }
  fs.writeFileSync(dest, contents, "utf8");
  return "created";
}

function pkgJsonTemplate(opts: {
  name: string;
  type: "commonjs" | "module";
  testCommand?: string;
}) {
  return JSON.stringify({
    name: opts.name,
    version: "0.0.0",
    description: "Scaffolded npm package",
    type: opts.type,
    bin: { [opts.name]: "dist/cli.js" },
    main: "dist/cli.js",
    files: ["dist", "README*", "LICENSE*"],
    scripts: {
      build: "tsc -p tsconfig.json",
      prepublishOnly: "npm run build",
      start: "node dist/cli.js --help",
      test: opts.testCommand || "echo \"no tests configured\" && exit 0"
    },
    license: "MIT",
    engines: { node: ">=18" }
  }, null, 2) + "\n";
}

function tsconfigTemplate(opts: { esm: boolean }) {
  const base: any = {
    compilerOptions: {
      target: "ES2020",
      outDir: "dist",
      rootDir: "src",
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true
    },
    include: ["src"],
    exclude: ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
  };
  if (opts.esm) {
    base.compilerOptions.module = "ESNext";
    base.compilerOptions.moduleResolution = "NodeNext";
  } else {
    base.compilerOptions.module = "CommonJS";
  }
  return JSON.stringify(base, null, 2) + "\n";
}

function badgesBlock(pkg: string, owner: string, repo: string) {
  return [
    `[![Install](https://img.shields.io/badge/Install-npm%20i%20--g%20${pkg}-CB3837?logo=npm)](https://www.npmjs.com/package/${pkg})`,
    `[![npm](https://img.shields.io/npm/v/${pkg}?logo=npm)](https://www.npmjs.com/package/${pkg})`,
    `[![Publish](https://img.shields.io/github/actions/workflow/status/${owner}/${repo}/publish.yml?branch=main&logo=github)](https://github.com/${owner}/${repo}/actions/workflows/publish.yml)`,
    `[![Install size](https://packagephobia.com/badge?p=${pkg})](https://packagephobia.com/result?p=${pkg})`,
    `[![Downloads](https://img.shields.io/npm/dm/${pkg})](https://www.npmjs.com/package/${pkg})`,
    `[![License](https://img.shields.io/github/license/${owner}/${repo})](https://github.com/${owner}/${repo}/blob/main/LICENSE)`
  ].join("\n") + "\n\n";
}

// Jest config written when options.jest is true
const JEST_CONFIG_CJS = `/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  transform: { "^.+\\\\.(ts|tsx)$": ["ts-jest", { tsconfig: "tsconfig.json" }] },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"]
};
`;

// Default .gitignore for generated projects
const GITIGNORE = `# Dependencies
node_modules/
# Build outputs
dist/
# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
# Environment files
.env
.env.local
# OS/editor
.DS_Store
Thumbs.db
.vscode/
`;

// CI workflow (clipcopy-style) written into .github/workflows/publish.yml
// Note: \${{ }} escaped so TS template string doesn't interpolate.
const PUBLISH_YML = `
name: Publish

on:
  push:
    branches: [main]
    tags:
      - "v*"
  workflow_dispatch:

jobs:
  build-and-publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: "https://registry.npmjs.org"
          cache: npm

      - name: Install
        run: npm ci

      - name: Build
        run: npm run build

      - name: Skip if version already published
        id: check
        run: |
          PKG=$(node -p "require('./package.json').name")
          VER=$(node -p "require('./package.json').version")
          PUB=$(npm view "$PKG" version || echo "0.0.0")
          echo "local=$VER published=$PUB"
          if [ "$VER" = "$PUB" ]; then echo "skip=true" >> $GITHUB_OUTPUT; fi

      - name: Publish package
        if: \${{ github.event_name == 'push' && startsWith(github.ref, 'refs/tags/v') && steps.check.outputs.skip != 'true' }}
        run: npm publish --access public --provenance
        env:
          NODE_AUTH_TOKEN: \${{ secrets.NPM_TOKEN }}
`;

// ─────────────────────────────────────────────────────────────────────────────
// Top-level export consumed by the wrapper CLI
// ─────────────────────────────────────────────────────────────────────────────
export async function runScaffold(options: Options = {}) {
  // track statuses for summary
  let jestConfigStatus: FileWriteStatus = "none";

  // Resolve project location & identity
  const cwd = process.cwd();
  const projectDir = options.projectDir || cwd;
  const inferredName = options.name || path.basename(projectDir);
  const owner = options.owner || "thegreatbey";
  const repo = options.repo || inferredName;

  // Decide module system
  let esm: boolean;
  if (typeof options.esm === "boolean") {
    esm = options.esm;
  } else if (options.yes || !process.stdin.isTTY) {
    esm = false; // default to CJS in non-interactive
  } else {
    const ans = (await ask("Module system? [cjs/esm] (default: cjs): ")).trim().toLowerCase();
    esm = ans === "esm";
  }
  const pkgType = esm ? "module" as const : "commonjs" as const;

  // Test command precedence
  let testCommand = options.testCommand?.trim();
  if (!testCommand && options.jest) testCommand = "jest";

  // Paths (declare ONCE)
  const srcDir = path.join(projectDir, "src");
  const ghDir = path.join(projectDir, ".github", "workflows");
  const publishPath = path.join(ghDir, "publish.yml");
  const jestPath = path.join(projectDir, "jest.config.cjs");
  const pkgPath = path.join(projectDir, "package.json");
  const tsPath = path.join(projectDir, "tsconfig.json");
  const giPath = path.join(projectDir, ".gitignore");
  const readmePath = path.join(projectDir, "README.md");

  // Ensure directories
  ensureDir(srcDir);
  ensureDir(ghDir);

  // Core files
  const pkgRes: FileWriteStatus = writeFileSafely(pkgPath, pkgJsonTemplate({ name: inferredName, type: pkgType, testCommand }), false);
  const tsRes: FileWriteStatus  = writeFileSafely(tsPath,  tsconfigTemplate({ esm }), false);
  const gitignoreStatus: FileWriteStatus = writeFileSafely(giPath, GITIGNORE, false);
  const ciStatus: FileWriteStatus        = writeFileSafely(publishPath, PUBLISH_YML, false);

  // Seed a tiny src/cli.ts (idempotent)
  const cliTs = path.join(srcDir, "cli.ts");
  if (!fs.existsSync(cliTs)) {
    fs.writeFileSync(
      cliTs,
      `#!/usr/bin/env node
console.log("${inferredName}: hello from ${esm ? "ESM" : "CJS"} scaffold");
`,
      "utf8"
    );
  }

  // Jest (optional)
  if (options.jest) {
    jestConfigStatus = writeFileSafely(jestPath, JEST_CONFIG_CJS, false);
  }

  // README + badges
  if (fs.existsSync(readmePath)) {
    const current = fs.readFileSync(readmePath, "utf8");
    if (!current.includes("img.shields.io/npm/v/")) {
      const lines = current.split(/\r?\n/);
      const i = lines.findIndex(l => /^#\s+/.test(l));
      if (i >= 0) {
        lines.splice(i + 1, 0, "", badgesBlock(inferredName, owner, repo));
        fs.writeFileSync(readmePath, lines.join("\n"), "utf8");
      } else {
        fs.writeFileSync(readmePath, badgesBlock(inferredName, owner, repo) + current, "utf8");
      }
    }
  } else {
    fs.writeFileSync(readmePath, `# ${inferredName}\n\n` + badgesBlock(inferredName, owner, repo), "utf8");
  }

  // Summary
  console.log([
    `Scaffolded at: ${projectDir}`,
    `→ Module system: ${esm ? "ESM (type=module; tsconfig.module=ESNext, moduleResolution=NodeNext)" : "CJS (type=commonjs; tsconfig.module=CommonJS)"}`,
    `package.json: ${pkgRes}`,
    `tsconfig.json: ${tsRes}`,
    `.gitignore: ${gitignoreStatus}`,
    `.github/workflows/publish.yml: ${ciStatus}  (requires repo secret NPM_TOKEN)`,
    options.jest ? `jest.config.cjs: ${jestConfigStatus}  (remember to: npm i -D jest ts-jest @types/jest)` : `jest: not configured`,
    `test script: ${testCommand ? `"${testCommand}"` : "(no-op)"}`
  ].join("\n"));
}