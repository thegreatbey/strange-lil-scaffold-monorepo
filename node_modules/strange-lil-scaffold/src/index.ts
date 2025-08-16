// packages/strange-lil-scaffold/src/index.ts
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

type FileWriteStatus = "created" | "skipped" | "overwritten" | "none";

export interface Options {
  projectDir?: string;
  esm?: boolean | null;
  yes?: boolean;
  name?: string;
  owner?: string;
  repo?: string;

  // NEW:
  jest?: boolean;           // if true, create jest.config.cjs and set "test": "jest"
  testCommand?: string;     // if provided, set "test" to this exact string (overrides jest)
}

// ─────────────────────────────────────────────────────────────────────────────
// helpers
// ─────────────────────────────────────────────────────────────────────────────

function ask(q: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(q, (ans) => { rl.close(); resolve(ans); }));
}

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

function writeFileSafely(dest: string, contents: string, overwrite = false): FileWriteStatus {
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
      // if no testCommand provided, default to a harmless no-op
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

// paste your exact publish.yml in here later
const PUBLISH_YML = `name: Publish
on:
  workflow_dispatch:
jobs:
  placeholder:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Replace with your real publish.yml"
`;

// minimal Jest config that works with TS via ts-jest (install deps yourself)
const JEST_CONFIG_CJS = `/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  transform: { "^.+\\\\.(ts|tsx)$": ["ts-jest", { tsconfig: "tsconfig.json" }] },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"]
};
`;

// ─────────────────────────────────────────────────────────────────────────────
// top-level export (what cli.ts imports)
// ─────────────────────────────────────────────────────────────────────────────
export async function runScaffold(options: Options = {}) {
  // track statuses for summary
  let jestConfigStatus: FileWriteStatus = "none";

  const cwd = process.cwd();
  const projectDir = options.projectDir || cwd;
  ensureDir(projectDir);

  const inferredName = options.name || path.basename(projectDir);
  const owner = options.owner || "thegreatbey";
  const repo = options.repo || inferredName;

  // decide ESM vs CJS
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

  // resolve test command precedence
  // 1) explicit testCommand flag wins
  // 2) else if jest flag, use "jest"
  // 3) else default no-op
  let testCommand = options.testCommand?.trim();
  if (!testCommand && options.jest) testCommand = "jest";

  // Paths
  const pkgPath = path.join(projectDir, "package.json");
  const tsPath = path.join(projectDir, "tsconfig.json");
  const srcDir = path.join(projectDir, "src");
  const readmePath = path.join(projectDir, "README.md");
  const ghDir = path.join(projectDir, ".github", "workflows");
  const publishPath = path.join(ghDir, "publish.yml");
  const jestPath = path.join(projectDir, "jest.config.cjs");

  ensureDir(srcDir);
  ensureDir(ghDir);

  // Write core files
  const pkgRes = writeFileSafely(pkgPath, pkgJsonTemplate({ name: inferredName, type: pkgType, testCommand }), false);
  const tsRes = writeFileSafely(tsPath, tsconfigTemplate({ esm }), false);

  // Seed a tiny src/cli.ts
  const cliTs = path.join(srcDir, "cli.ts");
  if (!fs.existsSync(cliTs)) {
    fs.writeFileSync(
      cliTs,
      `#!/usr/bin/env node
console.log("${inferredName}: hello from ${esm ? "ESM" : "CJS"} scaffold");
`
    );
  }

  // Jest (if requested)
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
        fs.writeFileSync(readmePath, lines.join("\n"));
      } else {
        fs.writeFileSync(readmePath, badgesBlock(inferredName, owner, repo) + current);
      }
    }
  } else {
    fs.writeFileSync(readmePath, `# ${inferredName}\n\n` + badgesBlock(inferredName, owner, repo));
  }

  // CI
  writeFileSafely(publishPath, PUBLISH_YML, false);

  // Summary
  console.log([
    `Scaffolded at: ${projectDir}`,
    `→ Module system: ${esm ? "ESM (type=module; tsconfig.module=ESNext, moduleResolution=NodeNext)" : "CJS (type=commonjs; tsconfig.module=CommonJS)"}`,
    `package.json: ${pkgRes}`,
    `tsconfig.json: ${tsRes}`,
    options.jest ? `jest.config.cjs: ${jestConfigStatus}  (remember to: npm i -D jest ts-jest @types/jest)` : `jest: not configured`,
    `.github/workflows/publish.yml: ${fs.existsSync(publishPath) ? "created" : "skipped"}`,
    `test script: ${testCommand ? `"${testCommand}"` : "(no-op)"}`
  ].join("\n"));
}
