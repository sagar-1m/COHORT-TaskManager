import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { validate } from "../middlewares/validator.middlewares.js";
import { createProjectValidator } from "../validators/project.validators.js";
import { createProject } from "../controllers/project.controllers.js";

const router = Router();

// All routes related to projects require authentication
router.use(authMiddleware);

// Project routes
router
  .route("/create-project")
  .post(createProjectValidator(), validate, createProject);

export default router;
