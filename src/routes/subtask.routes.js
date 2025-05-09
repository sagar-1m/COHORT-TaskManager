import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { validate } from "../middlewares/validator.middlewares.js";
import { createSubtaskValidator } from "../validators/subtask.validators.js";
import { createSubtask } from "../controllers/subtask.controllers.js";

const router = Router();

router.use(authMiddleware);

router
  .route("/:projectId/:taskId/create-subtask")
  .post(createSubtaskValidator(), validate, createSubtask);

export default router;
