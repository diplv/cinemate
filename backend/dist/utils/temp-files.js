import { randomUUID } from "node:crypto";
import { mkdir, rm, readdir, stat } from "node:fs/promises";
import { join } from "node:path";
const TEMP_BASE = process.env.TEMP_DIR || "/tmp/lut";
const EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
export async function createTempDir() {
    const id = randomUUID();
    const path = join(TEMP_BASE, id);
    await mkdir(path, { recursive: true });
    return { id, path };
}
export async function removeTempDir(id) {
    const path = join(TEMP_BASE, id);
    await rm(path, { recursive: true, force: true });
}
export function scheduleCleanup(id, delayMs = EXPIRY_MS) {
    setTimeout(() => {
        removeTempDir(id).catch(() => { });
    }, delayMs);
}
export function getTempFilePath(id, filename) {
    return join(TEMP_BASE, id, filename);
}
export async function cleanupOrphaned() {
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
            }
            catch {
                // ignore stat errors
            }
        }
    }
    catch {
        // ignore if base dir doesn't exist yet
    }
}
//# sourceMappingURL=temp-files.js.map