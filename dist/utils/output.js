"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Output = void 0;
const console_utils_1 = require("@jfonx/console-utils");
class Output {
    constructor(silent = false) {
        this.silent = silent;
    }
    static exitProcessWithError() {
        process.exit(1);
    }
    info(message) {
        if (this.silent)
            return;
        console_utils_1.Output.info(message);
    }
    error(message, exitProcess = false) {
        if (!this.silent) {
            console_utils_1.Output.error(message);
        }
        if (exitProcess) {
            Output.exitProcessWithError();
        }
    }
    clear() {
        console_utils_1.Output.clear();
    }
}
exports.Output = Output;
//# sourceMappingURL=output.js.map