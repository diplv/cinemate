import { join } from "node:path";
import { writeFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { createTempDir, scheduleCleanup, getTempFilePath } from "../utils/temp-files.js";
import { executePipeline } from "../services/pipeline.service.js";
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || "50", 10) * 1024 * 1024;
export async function convertRoutes(app) {
    // POST /api/convert - Upload AML or CUBE file and run conversion pipeline
    app.post("/api/convert", async (request, reply) => {
        const data = await request.file();
        if (!data) {
            return reply.status(400).send({
                success: false,
                error: "No file uploaded",
                code: "NO_FILE",
            });
        }
        const filename = data.filename;
        const ext = filename.toLowerCase();
        if (!ext.endsWith(".aml") && !ext.endsWith(".cube")) {
            return reply.status(400).send({
                success: false,
                error: "Only .aml and .cube files are accepted",
                code: "INVALID_FILE_TYPE",
            });
        }
        // Read file into buffer
        const chunks = [];
        let totalSize = 0;
        for await (const chunk of data.file) {
            totalSize += chunk.length;
            if (totalSize > MAX_FILE_SIZE) {
                return reply.status(413).send({
                    success: false,
                    error: `File exceeds maximum size of ${process.env.MAX_FILE_SIZE_MB || 50}MB`,
                    code: "FILE_TOO_LARGE",
                });
            }
            chunks.push(chunk);
        }
        const fileBuffer = Buffer.concat(chunks);
        // Create temp directory and save file
        const { id, path: tempDir } = await createTempDir();
        const inputPath = join(tempDir, filename);
        try {
            await writeFile(inputPath, fileBuffer);
            // Execute pipeline
            const result = await executePipeline(inputPath, tempDir, filename);
            // Schedule cleanup after 5 minutes
            scheduleCleanup(id);
            return reply.send({
                success: true,
                files: {
                    cube: {
                        name: result.cubeLogC3.name,
                        size: result.cubeLogC3.size,
                    },
                    lookFile: {
                        name: result.lookFile.name,
                        size: result.lookFile.size,
                        format: result.lookFile.format,
                    },
                },
                downloadToken: id,
            });
        }
        catch (err) {
            // Clean up immediately on error
            scheduleCleanup(id, 0);
            const message = err instanceof Error ? err.message : "Unknown error";
            return reply.status(500).send({
                success: false,
                error: message,
                code: "CONVERSION_ERROR",
            });
        }
    });
    // GET /api/download/:token/:filename - Download a converted file
    app.get("/api/download/:token/:filename", async (request, reply) => {
        const { token, filename } = request.params;
        // Validate token format (UUID)
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) {
            return reply.status(400).send({
                success: false,
                error: "Invalid download token",
                code: "INVALID_TOKEN",
            });
        }
        // Sanitize filename (prevent directory traversal)
        const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, "");
        if (sanitized !== filename || filename.includes("..")) {
            return reply.status(400).send({
                success: false,
                error: "Invalid filename",
                code: "INVALID_FILENAME",
            });
        }
        const filePath = getTempFilePath(token, filename);
        try {
            const stream = createReadStream(filePath);
            let contentType = "application/octet-stream";
            if (filename.endsWith(".cube")) {
                contentType = "text/plain";
            }
            else if (filename.endsWith(".alf4c") || filename.endsWith(".alf4")) {
                contentType = "application/octet-stream";
            }
            return reply
                .header("Content-Type", contentType)
                .header("Content-Disposition", `attachment; filename="${filename}"`)
                .send(stream);
        }
        catch {
            return reply.status(404).send({
                success: false,
                error: "File not found or expired",
                code: "FILE_NOT_FOUND",
            });
        }
    });
}
//# sourceMappingURL=convert.js.map