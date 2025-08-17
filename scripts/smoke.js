// scripts/smoke.js
const { mkdtempSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join } = require("node:path");
const { spawnSync } = require("node:child_process");

function sh(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: true, ...opts });
  if (r.status !== 0) {
    console.error(`Command failed: ${cmd} ${args.join(" ")}`);
    process.exit(r.status || 1);
  }
}

function main() {
  const tmp = mkdtempSync(join(tmpdir(), "sls-"));
  const appDir = join(tmp, "smoke-app");
  const wrapperCli = join(process.cwd(), "packages", "create-strange-lil-scaffold", "dist", "cli.js");

  console.log("→ temp dir:", tmp);
  console.log("→ scaffold:", appDir);

  // 1) scaffold a new project (non-interactive)
  sh("node", [wrapperCli, appDir, "--yes"]);

  // 2) build the generated project
  sh("npm", ["run", "build"], { cwd: appDir });

  console.log("\n✅ Smoke test passed");
}

main();