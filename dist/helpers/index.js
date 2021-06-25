"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAbsoluteAliasPath = exports.existsResolvedAlias = exports.getProjectDirPathInOutDir = exports.resolveTsConfigExtendsPath = exports.loadConfig = exports.mapPaths = void 0;
const FileUtils = require("@jfonx/file-utils");
const findNodeModulesPath = require("find-node-modules");
const fs = require("fs");
const globby_1 = require("globby");
const path_1 = require("path");
const mapPaths = (paths, mapper) => {
    const dest = {};
    Object.keys(paths).forEach((key) => {
        dest[key] = paths[key].map(mapper);
    });
    return dest;
};
exports.mapPaths = mapPaths;
const loadConfig = (file) => {
    const { extends: ext, compilerOptions: { baseUrl, outDir, paths } = {
        baseUrl: undefined,
        outDir: undefined,
        paths: undefined
    } } = FileUtils.toObject(file);
    const config = {};
    if (baseUrl) {
        config.baseUrl = baseUrl;
    }
    if (outDir) {
        config.outDir = outDir;
    }
    if (paths) {
        config.paths = paths;
    }
    if (ext) {
        let parentConfig;
        if (ext.startsWith('.')) {
            parentConfig = exports.loadConfig(path_1.join(path_1.dirname(file), ext));
        }
        else {
            parentConfig = exports.loadConfig(resolveTsConfigExtendsPath(ext, file));
        }
        return Object.assign(Object.assign({}, parentConfig), config);
    }
    return config;
};
exports.loadConfig = loadConfig;
function resolveTsConfigExtendsPath(ext, file) {
    const tsConfigDir = path_1.dirname(file);
    const node_modules = findNodeModulesPath({ cwd: tsConfigDir })[0];
    const targetPath = path_1.join(tsConfigDir, node_modules, ext);
    if (ext.endsWith('.json')) {
        return targetPath;
    }
    let isDirectory = false;
    try {
        isDirectory = fs.lstatSync(targetPath).isDirectory();
    }
    catch (err) { }
    return isDirectory ? path_1.join(targetPath, 'tsconfig.json') : `${targetPath}.json`;
}
exports.resolveTsConfigExtendsPath = resolveTsConfigExtendsPath;
function getProjectDirPathInOutDir(outDir, projectDir) {
    const dirs = globby_1.sync([
        `${outDir}/**/${projectDir}`,
        `!${outDir}/**/${projectDir}/**/${projectDir}`,
        `!${outDir}/**/node_modules`
    ], {
        dot: true,
        onlyDirectories: true
    });
    dirs.sort((dirA, dirB) => {
        return dirB.split('/').length - dirA.split('/').length;
    });
    return dirs[0];
}
exports.getProjectDirPathInOutDir = getProjectDirPathInOutDir;
function existsResolvedAlias(path) {
    if (fs.existsSync(path))
        return true;
    const globPattern = [`${path}.{js,jsx}`];
    const files = globby_1.sync(globPattern, {
        dot: true,
        onlyFiles: true
    });
    if (files.length)
        return true;
    return false;
}
exports.existsResolvedAlias = existsResolvedAlias;
function getAbsoluteAliasPath(basePath, aliasPath) {
    const aliasPathParts = aliasPath
        .split('/')
        .filter((part) => !part.match(/^\.$|^\s*$/));
    let aliasPathPart = aliasPathParts.shift() || '';
    let pathExists;
    while (!(pathExists = fs.existsSync(path_1.join(basePath, aliasPathPart))) &&
        aliasPathParts.length) {
        aliasPathPart = aliasPathParts.shift();
    }
    return path_1.join(basePath, pathExists ? aliasPathPart : '', aliasPathParts.join('/'));
}
exports.getAbsoluteAliasPath = getAbsoluteAliasPath;
//# sourceMappingURL=index.js.map