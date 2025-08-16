#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const node_path_1 = __importDefault(require("node:path"));
async function main() {
    const projectDir = process.argv[2] ? node_path_1.default.resolve(String(process.argv[2])) : process.cwd();
    await (0, index_1.runScaffold)({ projectDir });
}
main().catch((err) => {
    console.error(err?.stack || err);
    process.exit(1);
});
