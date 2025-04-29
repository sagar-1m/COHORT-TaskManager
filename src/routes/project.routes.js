import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { validate } from "../middlewares/validator.middlewares.js";
import {
  addMemberValidator,
  createProjectValidator,
  projectIdValidator,
  updateMemberRoleValidator,
} from "../validators/project.validators.js";
import {
  addMemberToProject,
  createProject,
  getProjectMembers,
  getProjects,
  updateMemberRole,
} from "../controllers/project.controllers.js";

const router = Router();

// All routes related to projects require authentication
router.use(authMiddleware);

// Project routes
router
  .route("/create-project")
  .post(createProjectValidator(), validate, createProject);

router
  .route("/:projectId/members")
  .get(projectIdValidator(), validate, getProjectMembers)
  .post(addMemberValidator(), validate, addMemberToProject);

router
  .route("/:projectId/members/:memberId/role")
  .patch(updateMemberRoleValidator(), validate, updateMemberRole);

router.route("/get-projects").get(getProjects);

export default router;
