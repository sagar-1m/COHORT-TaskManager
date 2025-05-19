import express from "express";
import multer from "multer";
import cookieParser from "cookie-parser";

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

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/public", express.static(path.join(__dirname, "../public")));

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/boards", boardRouter);
app.use("/api/v1/subtasks", subtaskRouter);
app.use("/api/v1/notes", noteRouter);

// Global error handler
app.use((err, req, res, next) => {
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
