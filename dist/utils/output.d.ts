export declare class Output {
    private silent;
    constructor(silent?: boolean);
    private static exitProcessWithError;
    info(message: string): void;
    error(message: string, exitProcess?: boolean): void;
    clear(): void;
}
