export interface ReplaceTscAliasPathsOptions {
    configFile?: string;
    outDir?: string;
    watch?: boolean;
    silent?: boolean;
    resolveFullPaths?: boolean;
}
export declare function replaceTscAliasPaths(options?: ReplaceTscAliasPathsOptions): void;
