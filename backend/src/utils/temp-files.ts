import { randomUUID } from "node:crypto";
import { mkdir, rm, readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const TEMP_BASE = process.env.TEMP_DIR || "/tmp/lut";
const EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export async function createTempDir(): Promise<{ id: string; path: string }> {
  const id = randomUUID();
  const path = join(TEMP_BASE, id);
  await mkdir(path, { recursive: true });
  return { id, path };
}

export async function removeTempDir(id: string): Promise<void> {
  const path = join(TEMP_BASE, id);
  await rm(path, { recursive: true, force: true });
}

export function scheduleCleanup(id: string, delayMs: number = EXPIRY_MS): void {
  setTimeout(() => {
    removeTempDir(id).catch(() => {});
  }, delayMs);
}

export function getTempFilePath(id: string, filename: string): string {
  return join(TEMP_BASE, id, filename);
}

export async function cleanupOrphaned(): Promise<void> {
  try {
    await mkdir(TEMP_BASE, { recursive: true });
    const entries = await readdir(TEMP_BASE);
    const now = Date.now();

    for (const entry of entries) {
      const entryPath = join(TEMP_BASE, entry);
      try {
        const stats = await stat(entryPath);
        if (now - stats.mtimeMs > EXPIRY_MS) {
          await rm(entryPath, { recursive: true, force: true });
        }
      } catch {
        // ignore stat errors
      }
    }
  } catch {
    // ignore if base dir doesn't exist yet
  }
}
