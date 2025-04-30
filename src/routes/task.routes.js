import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { validate } from "../middlewares/validator.middlewares.js";
import {
  createTaskValidator,
  getTasksValidator,
} from "../validators/task.validators.js";
import { createTask, getTasks } from "../controllers/task.controllers.js";

const router = Router();

// middleware to check if user is authenticated
router.use(authMiddleware);

// Task routes
router
  .route("/:projectId/create-task")
  .post(createTaskValidator(), validate, createTask);

router
  .route("/:projectId/get-tasks")
  .get(getTasksValidator(), validate, getTasks);

export default router;
