#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
const __1 = require("..");
const { version } = require('../../package.json');
program
    .name('tsc-alias')
    .version(version)
    .option('-p, --project <file>', 'path to tsconfig.json')
    .option('-w, --watch', 'Observe file changes')
    .option('--dir, --directory <dir>', 'Run in a folder leaving the "outDir" of the tsconfig.json (relative path to tsconfig)')
    .option('-f, --resolve-full-paths', 'Attempt to fully resolve import paths if the corresponding .js file can be found')
    .option('-s, --silent', 'reduced terminal output')
    .parse(process.argv);
__1.replaceTscAliasPaths({
    configFile: program.project,
    watch: !!program.watch,
    outDir: program.directory,
    silent: program.silent,
    resolveFullPaths: program.resolveFullPaths
});
//# sourceMappingURL=index.js.map