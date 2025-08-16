#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const node_readline_1 = __importDefault(require("node:readline"));
const minimist_1 = __importDefault(require("minimist"));
const strange_lil_scaffold_1 = require("strange-lil-scaffold");
// small helper for interactive questions
function ask(q) {
    const rl = node_readline_1.default.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => rl.question(q, (ans) => { rl.close(); resolve(ans); }));
}
async function main() {
    const argv = (0, minimist_1.default)(process.argv.slice(2), {
        alias: { y: "yes", d: "dir", m: "module", t: "test" },
        boolean: ["yes", "jest", "esm"],
        string: ["name", "owner", "repo", "dir", "projectDir", "module", "test"],
        default: {}
    });
    // Positional name/dir or --dir/--projectDir, else CWD
    const positional = argv._[0];
    const projectDir = node_path_1.default.resolve(String(argv.projectDir || argv.dir || positional || process.cwd()));
    // Defaults that match the core
    const defaults = {
        name: positional || node_path_1.default.basename(projectDir),
        owner: "thegreatbey",
        repo: positional || node_path_1.default.basename(projectDir),
        esm: typeof argv.esm === "boolean"
            ? argv.esm
            : argv.module === "esm"
                ? true
                : argv.module === "cjs"
                    ? false
                    : undefined, // undefined => we'll ask
        jest: !!argv.jest,
        testCommand: (argv.test && String(argv.test).trim()) || undefined
    };
    const interactive = process.stdin.isTTY && !argv.yes;
    // Banner
    console.log(`
✨ Welcome to Strange Lil Scaffold

This will set up a tiny TypeScript CLI project with a sensible build,
scripts, and folder layout.

We will ask a few quick questions (defaults in brackets). Press Enter to accept. Ctrl+C to quit.
`);
    // Gather values (ask only when interactive and not already provided via flags)
    let name = defaults.name;
    let owner = defaults.owner;
    let repo = defaults.repo;
    let esm = defaults.esm;
    let jest = defaults.jest;
    let testCommand = defaults.testCommand;
    if (interactive) {
        const nameAns = (await ask(`• Project name [${name}]: `)).trim();
        if (nameAns)
            name = nameAns;
        if (typeof esm !== "boolean") {
            const modAns = (await ask(`• Module system (cjs/esm) [cjs]: `)).trim().toLowerCase();
            esm = modAns === "esm" ? true : false;
        }
        if (!Object.prototype.hasOwnProperty.call(argv, "jest")) {
            const jestAns = (await ask(`• Add Jest config and set "test": "jest"? (y/N): `)).trim().toLowerCase();
            jest = jestAns === "y" || jestAns === "yes";
        }
        if (!testCommand) {
            const testAns = (await ask(`• Custom test script (leave blank for ${jest ? "jest" : "no-op"}): `)).trim();
            if (testAns)
                testCommand = testAns;
        }
        const ownerAns = (await ask(`• GitHub owner [${owner}]: `)).trim();
        if (ownerAns)
            owner = ownerAns;
        const repoAns = (await ask(`• GitHub repo name [${repo}]: `)).trim();
        if (repoAns)
            repo = repoAns;
        console.log(`• Project directory [${projectDir}]`);
    }
    else {
        // Non-interactive defaults
        if (typeof esm !== "boolean")
            esm = false;
    }
    // Custom test script overrides jest
    if (testCommand) {
        jest = false;
    }
    await (0, strange_lil_scaffold_1.runScaffold)({
        projectDir,
        name,
        owner,
        repo,
        esm,
        yes: !interactive,
        jest,
        testCommand
    });
}
main().catch((err) => {
    console.error(err?.stack || err);
    process.exit(1);
});
