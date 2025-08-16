#!/usr/bin/env node
import { runScaffold } from "./index";
import path from "node:path";

async function main() {
  const projectDir = process.argv[2] ? path.resolve(String(process.argv[2])) : process.cwd();
  await runScaffold({ projectDir });
}

main().catch((err) => {
  console.error(err?.stack || err);
  process.exit(1);
});