import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import { constants } from "node:fs";
const ART_CMD_PATH = process.env.ART_CMD_PATH || "art-cmd";
const LOOK_BUILDER_PATH = process.env.LOOK_BUILDER_PATH || "look-builder";
const TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes per command
export async function isArtCmdAvailable() {
    try {
        await access(ART_CMD_PATH, constants.X_OK);
        return true;
    }
    catch {
        // Try running it directly (might be in PATH)
        return new Promise((resolve) => {
            const proc = spawn(ART_CMD_PATH, ["--help"], { timeout: 5000 });
            proc.on("error", () => resolve(false));
            proc.on("close", (code) => resolve(code === 0));
        });
    }
}
export function runArtCmd(args, cwd) {
    return runTool(ART_CMD_PATH, args, cwd);
}
export function runLookBuilder(args, cwd) {
    return runTool(LOOK_BUILDER_PATH, args, cwd);
}
function runTool(toolPath, args, cwd) {
    return new Promise((resolve, reject) => {
        const proc = spawn(toolPath, args, {
            cwd,
            timeout: TIMEOUT_MS,
        });
        let stdout = "";
        let stderr = "";
        proc.stdout.on("data", (data) => {
            stdout += data.toString();
        });
        proc.stderr.on("data", (data) => {
            stderr += data.toString();
        });
        proc.on("error", (err) => {
            reject(new Error(`${toolPath} execution failed: ${err.message}`));
        });
        proc.on("close", (code) => {
            resolve({ stdout, stderr, exitCode: code ?? 1 });
        });
    });
}
//# sourceMappingURL=art-cmd.service.js.map