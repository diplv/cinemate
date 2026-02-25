import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import { constants } from "node:fs";

const ART_CMD_PATH = process.env.ART_CMD_PATH || "art-cmd";
const LOOK_BUILDER_PATH = process.env.LOOK_BUILDER_PATH || "look-builder";
const TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes per command

export interface ArtCmdResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export async function isArtCmdAvailable(): Promise<{ available: boolean, error?: string }> {
  try {
    await access(ART_CMD_PATH, constants.X_OK);
    return { available: true };
  } catch (err1: any) {
    return new Promise((resolve) => {
      let stderr = "";
      const proc = spawn(ART_CMD_PATH, ["--help"], { timeout: 5000 });
      proc.stderr?.on("data", (data) => stderr += data.toString());
      proc.on("error", (err2) => resolve({ available: false, error: err2.message }));
      proc.on("close", (code) => {
        if (code === 0) resolve({ available: true });
        else resolve({ available: false, error: `Exit code ${code}. Stderr: ${stderr}` });
      });
    });
  }
}

export function runArtCmd(
  args: string[],
  cwd?: string
): Promise<ArtCmdResult> {
  return runTool(ART_CMD_PATH, args, cwd);
}

export function runLookBuilder(
  args: string[],
  cwd?: string
): Promise<ArtCmdResult> {
  return runTool(LOOK_BUILDER_PATH, args, cwd);
}

function runTool(
  toolPath: string,
  args: string[],
  cwd?: string
): Promise<ArtCmdResult> {
  return new Promise((resolve, reject) => {
    const proc = spawn(toolPath, args, {
      cwd,
      timeout: TIMEOUT_MS,
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data: Buffer) => {
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
