import express from "express";
import multer from "multer";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import path from "path";
import { fileURLToPath } from "url";

import healthCheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import projectRouter from "./routes/project.routes.js";
import taskRouter from "./routes/task.routes.js";
import boardRouter from "./routes/board.routes.js";
import subtaskRouter from "./routes/subtask.routes.js";
import noteRouter from "./routes/note.routes.js";
import { ApiError } from "./utils/api-error.js";
import logger from "./utils/logger.js";
import {
  apiLimiter,
  authLimiter,
} from "./middlewares/rateLimit.middlewares.js";
import swaggerSpec from "./utils/swagger.js";

const app = express();

// Security: Set HTTP headers
app.use(helmet());

// Security: Restrictive CORS policy (future-proofed for production)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ],
    credentials: true, // allow cookies if needed
  }),
);

// Request logging middleware (colorful, concise)
app.use(
  morgan("dev", {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  }),
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/public", express.static(path.join(__dirname, "../public")));

// Swagger API docs (available at /api-docs)
if (process.env.NODE_ENV !== "production") {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// Apply global API rate limiter to all API routes
app.use("/api/v1", apiLimiter);

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authLimiter, authRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/boards", boardRouter);
app.use("/api/v1/subtasks", subtaskRouter);
app.use("/api/v1/notes", noteRouter);

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err);
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    return res
      .status(400)
      .json({ message: "Multer error", error: err.message });
  }
  if (err.message && err.message.toLowerCase().includes("cloudinary")) {
    // Cloudinary-specific errors
    return res
      .status(500)
      .json({ message: "Cloudinary error", error: err.message });
  }
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message,
      errors: err.errors || [],
      success: false,
    });
  }

  return res.status(500).json({
    status: 500,
    message: err.message || "Internal Server Error",
    success: false,
  });
});

export default app;
