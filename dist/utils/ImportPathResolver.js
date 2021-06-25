"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newStringRegex = exports.replaceSourceImportPaths = exports.newImportStatementRegex = exports.resolveFullImportPaths = void 0;
const fs_1 = require("fs");
const normalizePath = require("normalize-path");
const path_1 = require("path");
const anyQuote = '["\']';
const pathStringContent = `[^"'\r\n]+`;
const importString = `(?:${anyQuote}${pathStringContent}${anyQuote})`;
const funcStyle = `(?:\\b(?:import|require)\\s*\\(\\s*${importString}\\s*\\))`;
const globalStyle = `(?:\\bimport\\s+${importString})`;
const fromStyle = `(?:\\bfrom\\s+${importString})`;
const importRegexString = `(?:${[funcStyle, globalStyle, fromStyle].join('|')})`;
class ImportPathResolver {
    constructor(source, sourcePath) {
        this.source = source;
        this.sourcePath = sourcePath;
    }
    get sourceDir() {
        return path_1.dirname(this.sourcePath);
    }
    replaceSourceImportPaths(replacer) {
        this.source = this.source.replace(ImportPathResolver.newImportStatementRegex('g'), replacer);
        return this;
    }
    resolveFullImportPaths() {
        this.replaceSourceImportPaths((importStatement) => {
            const importPathMatch = importStatement.match(ImportPathResolver.newStringRegex());
            if (!importPathMatch) {
                return importStatement;
            }
            const { path, pathWithQuotes } = importPathMatch.groups;
            const fullPath = normalizePath(this.resolveFullPath(path));
            return importStatement.replace(pathWithQuotes, pathWithQuotes.replace(path, fullPath));
        });
        return this;
    }
    resolveFullPath(importPath) {
        if (importPath.match(/\.js$/)) {
            return importPath;
        }
        if (!importPath.match(/[/\\]$/)) {
            const asFilePath = `${importPath}.js`;
            if (fs_1.existsSync(path_1.resolve(this.sourceDir, asFilePath))) {
                return asFilePath;
            }
        }
        const asFilePath = path_1.join(importPath, 'index.js');
        if (fs_1.existsSync(path_1.resolve(this.sourceDir, asFilePath))) {
            return asFilePath;
        }
        return importPath;
    }
    static newStringRegex() {
        return new RegExp(`(?<pathWithQuotes>${anyQuote}(?<path>${pathStringContent})${anyQuote})`);
    }
    static newImportStatementRegex(flags = '') {
        return new RegExp(importRegexString, flags);
    }
    static resolveFullImportPaths(code, path) {
        return new ImportPathResolver(code, path).resolveFullImportPaths().source;
    }
    static replaceSourceImportPaths(code, path, replacer) {
        return new ImportPathResolver(code, path).replaceSourceImportPaths(replacer)
            .source;
    }
}
exports.resolveFullImportPaths = ImportPathResolver.resolveFullImportPaths;
exports.newImportStatementRegex = ImportPathResolver.newImportStatementRegex;
exports.replaceSourceImportPaths = ImportPathResolver.replaceSourceImportPaths;
exports.newStringRegex = ImportPathResolver.newStringRegex;
//# sourceMappingURL=ImportPathResolver.js.map