export interface IRawTSConfig {
    extends?: string;
    compilerOptions?: {
        baseUrl?: string;
        outDir?: string;
        paths?: {
            [key: string]: string[];
        };
    };
}
export interface ITSConfig {
    baseUrl?: string;
    outDir?: string;
    paths?: {
        [key: string]: string[];
    };
}
export declare const mapPaths: (paths: {
    [key: string]: string[];
}, mapper: (x: string) => string) => {
    [key: string]: string[];
};
export declare const loadConfig: (file: string) => ITSConfig;
export declare function resolveTsConfigExtendsPath(ext: string, file: string): string;
export declare function getProjectDirPathInOutDir(outDir: string, projectDir: string): string | undefined;
export declare function existsResolvedAlias(path: string): boolean;
export declare function getAbsoluteAliasPath(basePath: string, aliasPath: string): string;
