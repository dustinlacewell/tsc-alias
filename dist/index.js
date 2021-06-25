"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceTscAliasPaths = void 0;
const chokidar_1 = require("chokidar");
const fs_1 = require("fs");
const globby_1 = require("globby");
const normalizePath = require("normalize-path");
const path_1 = require("path");
const helpers_1 = require("./helpers");
const utils_1 = require("./utils");
function replaceTscAliasPaths(options = {
    watch: false,
    silent: false
}) {
    const output = new utils_1.Output(options.silent);
    output.info('=== tsc-alias starting ===');
    if (!options.configFile) {
        options.configFile = path_1.resolve(process.cwd(), 'tsconfig.json');
    }
    else {
        if (!path_1.isAbsolute(options.configFile)) {
            options.configFile = path_1.resolve(process.cwd(), options.configFile);
        }
    }
    const configFile = options.configFile;
    const assert = (claim, message) => claim || output.error(message, true);
    assert(fs_1.existsSync(configFile), `Invalid file path => ${configFile}`);
    let { baseUrl, outDir, paths } = helpers_1.loadConfig(configFile);
    if (options.outDir) {
        outDir = options.outDir;
    }
    assert(baseUrl, 'compilerOptions.baseUrl is not set');
    assert(paths, 'compilerOptions.paths is not set');
    assert(outDir, 'compilerOptions.outDir is not set');
    const configDir = normalizePath(path_1.dirname(configFile));
    const outPath = normalizePath(path_1.normalize(configDir + '/' + outDir));
    const confDirParentFolderName = path_1.basename(configDir);
    let hasExtraModule = false;
    let configDirInOutPath = null;
    let relConfDirPathInOutPath;
    const aliases = Object.keys(paths)
        .map((alias) => {
        const _paths = paths[alias].map((path) => {
            path = path.replace(/\*$/, '').replace('.t', '.j');
            if (path_1.isAbsolute(path)) {
                path = path_1.relative(configDir, path);
            }
            return path;
        });
        const path = _paths[0];
        const isExtra = null;
        const basePath = null;
        if (path_1.normalize(path).includes('..')) {
            if (!configDirInOutPath) {
                configDirInOutPath = helpers_1.getProjectDirPathInOutDir(outPath, confDirParentFolderName);
                if (configDirInOutPath) {
                    hasExtraModule = true;
                }
                if (configDirInOutPath) {
                    const stepsbackPath = path_1.relative(configDirInOutPath, outPath);
                    const splitStepBackPath = normalizePath(stepsbackPath).split('/');
                    const nbOfStepBack = splitStepBackPath.length;
                    const splitConfDirInOutPath = configDirInOutPath.split('/');
                    let i = 1;
                    const splitRelPath = [];
                    while (i <= nbOfStepBack) {
                        splitRelPath.unshift(splitConfDirInOutPath[splitConfDirInOutPath.length - i]);
                        i++;
                    }
                    relConfDirPathInOutPath = splitRelPath.join('/');
                }
            }
        }
        let prefix = alias.replace(/\*$/, '');
        if (prefix[prefix.length - 1] === '/') {
            prefix = prefix.substring(0, prefix.length - 1);
        }
        return {
            prefix,
            basePath,
            path,
            paths: _paths,
            isExtra
        };
    })
        .filter(({ prefix }) => prefix);
    aliases.forEach((alias) => {
        if (path_1.normalize(alias.path).includes('..')) {
            const tempBasePath = normalizePath(path_1.normalize(`${configDir}/${outDir}/${hasExtraModule && relConfDirPathInOutPath
                ? relConfDirPathInOutPath
                : ''}/${baseUrl}`));
            const absoluteBasePath = normalizePath(path_1.normalize(`${tempBasePath}/${alias.path}`));
            if (helpers_1.existsResolvedAlias(absoluteBasePath)) {
                alias.isExtra = false;
                alias.basePath = tempBasePath;
            }
            else {
                alias.isExtra = true;
                alias.basePath = absoluteBasePath;
            }
        }
        else if (hasExtraModule) {
            alias.isExtra = false;
            alias.basePath = normalizePath(path_1.normalize(`${configDir}/${outDir}/${relConfDirPathInOutPath}/${baseUrl}`));
        }
        else {
            alias.basePath = normalizePath(path_1.normalize(`${configDir}/${outDir}`));
            alias.isExtra = false;
        }
    });
    const replaceImportStatement = ({ orig, file, alias }) => {
        var _a, _b;
        const requiredModule = (_b = (_a = orig.match(utils_1.newStringRegex())) === null || _a === void 0 ? void 0 : _a.groups) === null || _b === void 0 ? void 0 : _b.path;
        assert(typeof requiredModule == 'string', `Unexpected import statement pattern ${orig}`);
        const index = orig.indexOf(alias.prefix);
        const isAlias = requiredModule.includes('/')
            ? requiredModule.startsWith(alias.prefix + '/')
            : requiredModule.startsWith(alias.prefix);
        if (index > -1 && isAlias) {
            let absoluteAliasPath = helpers_1.getAbsoluteAliasPath(alias.basePath, alias.path);
            let relativeAliasPath = normalizePath(path_1.relative(path_1.dirname(file), absoluteAliasPath));
            if (!relativeAliasPath.startsWith('.')) {
                relativeAliasPath = './' + relativeAliasPath;
            }
            const newImportScript = orig.substring(0, index) +
                relativeAliasPath +
                '/' +
                orig.substring(index + alias.prefix.length);
            const modulePath = newImportScript.match(utils_1.newStringRegex()).groups.path;
            return newImportScript.replace(modulePath, normalizePath(modulePath));
        }
        return orig;
    };
    const replaceAlias = (file, resolveFullPath) => {
        const code = fs_1.readFileSync(file, 'utf8');
        let tempCode = code;
        for (const alias of aliases) {
            const replacementParams = {
                file,
                alias
            };
            tempCode = utils_1.replaceSourceImportPaths(tempCode, file, (orig) => replaceImportStatement(Object.assign({ orig }, replacementParams)));
        }
        if (resolveFullPath) {
            tempCode = utils_1.resolveFullImportPaths(tempCode, file);
        }
        if (code !== tempCode) {
            fs_1.writeFileSync(file, tempCode, 'utf8');
            return true;
        }
        return false;
    };
    const globPattern = [
        `${outPath}/**/*.{js,jsx,d.ts,d.tsx}`,
        `!${outPath}/**/node_modules`
    ];
    const files = globby_1.sync(globPattern, {
        dot: true,
        onlyFiles: true
    });
    const flen = files.length;
    let replaceCount = 0;
    for (let i = 0; i < flen; i += 1) {
        const file = files[i];
        if (replaceAlias(file, options === null || options === void 0 ? void 0 : options.resolveFullPaths)) {
            replaceCount++;
        }
    }
    output.info(`${replaceCount} files were affected!`);
    if (options.watch) {
        output.info('[Watching for file changes...]');
        const filesWatcher = chokidar_1.watch(globPattern);
        const tsconfigWatcher = chokidar_1.watch(configFile);
        filesWatcher.on('change', (file) => {
            replaceAlias(file, options === null || options === void 0 ? void 0 : options.resolveFullPaths);
        });
        tsconfigWatcher.on('change', (_) => {
            output.clear();
            filesWatcher.close();
            tsconfigWatcher.close();
            replaceTscAliasPaths(options);
        });
    }
}
exports.replaceTscAliasPaths = replaceTscAliasPaths;
//# sourceMappingURL=index.js.map