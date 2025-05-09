import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { validate } from "../middlewares/validator.middlewares.js";
import {
  createSubtaskValidator,
  deleteSubtaskValidator,
  getAllSubtasksByTaskIdValidator,
  getSubtaskByIdValidator,
  updateSubtaskValidator,
} from "../validators/subtask.validators.js";
import {
  createSubtask,
  deleteSubtask,
  getAllSubtasksByTaskId,
  getSubtaskById,
  updateSubtask,
} from "../controllers/subtask.controllers.js";

const router = Router();

router.use(authMiddleware);

router
  .route("/:projectId/:taskId/create-subtask")
  .post(createSubtaskValidator(), validate, createSubtask);

router
  .route("/:projectId/:taskId/update-subtask/:subtaskId")
  .patch(updateSubtaskValidator(), validate, updateSubtask);

router
  .route("/:projectId/:taskId/delete-subtask/:subtaskId")
  .delete(deleteSubtaskValidator(), validate, deleteSubtask);

router
  .route("/:projectId/:taskId/get-subtasks")
  .get(getAllSubtasksByTaskIdValidator(), validate, getAllSubtasksByTaskId);

router
  .route("/:projectId/:taskId/get-subtask/:subtaskId")
  .get(getSubtaskByIdValidator(), validate, getSubtaskById);

export default router;
