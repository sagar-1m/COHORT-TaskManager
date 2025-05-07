import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { validate } from "../middlewares/validator.middlewares.js";
import {
  createTaskValidator,
  getTasksValidator,
  assignTaskValidator,
  getBoardTasksValidator,
  updateTaskValidator,
  deleteTaskValidator,
  getTaskByIdValidator,
} from "../validators/task.validators.js";
import {
  createTask,
  getTasks,
  assignTask,
  getBoardTasks,
  updateTask,
  deleteTask,
  getTaskById,
} from "../controllers/task.controllers.js";

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

router
  .route("/:projectId/get-task/:taskId")
  .get(getTaskByIdValidator(), validate, getTaskById);

router
  .route("/:projectId/assign-task/:taskId")
  .patch(assignTaskValidator(), validate, assignTask);

router
  .route("/:boardId/get-board-tasks")
  .get(getBoardTasksValidator(), validate, getBoardTasks);

router
  .route("/:projectId/update-task/:taskId")
  .patch(updateTaskValidator(), validate, updateTask);

router
  .route("/:projectId/delete-task/:taskId")
  .delete(deleteTaskValidator(), validate, deleteTask);

export default router;
