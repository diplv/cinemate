import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import { convertRoutes } from "./routes/convert.js";
import { isArtCmdAvailable } from "./services/art-cmd.service.js";
import { cleanupOrphaned } from "./utils/temp-files.js";

const PORT = parseInt(process.env.PORT || "8080", 10);
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ?
  process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim()) : "*";
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || "50", 10) * 1024 * 1024;

async function start(): Promise<void> {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || "info",
    },
    requestTimeout: 5 * 60 * 1000, // 5 minutes for conversions
  });

  // CORS
  await app.register(cors, {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
  });

  // Rate limiting
  await app.register(rateLimit, {
    max: 10,
    timeWindow: "1 minute",
  });

  // Multipart file uploads
  await app.register(multipart, {
    limits: {
      fileSize: MAX_FILE_SIZE,
      files: 1,
    },
  });

  // Health check
  app.get("/health", async () => {
    const artStatus = await isArtCmdAvailable();
    return {
      status: "ok",
      artCmd: artStatus.available ? "available" : "not found",
      artError: artStatus.error || null,
    };
  });

  // Register routes
  await app.register(convertRoutes);

  // Periodic cleanup of orphaned temp directories (every hour)
  const cleanupInterval = setInterval(() => {
    cleanupOrphaned().catch((err) => {
      app.log.error(err, "Failed to cleanup orphaned temp directories");
    });
  }, 60 * 60 * 1000);

  // Initial cleanup on startup
  await cleanupOrphaned();

  // Graceful shutdown
  const shutdown = async () => {
    clearInterval(cleanupInterval);
    await app.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  // Start server
  await app.listen({ port: PORT, host: "0.0.0.0" });
  app.log.info(`Server running on port ${PORT}`);

  const artStatus = await isArtCmdAvailable();
  if (artStatus.available) {
    app.log.info("ART CMD is available");
  } else {
    app.log.warn(`ART CMD not found - conversions will fail until it is installed. Error: ${artStatus.error}`);
  }
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
