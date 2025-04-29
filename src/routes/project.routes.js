import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { validate } from "../middlewares/validator.middlewares.js";
import {
  addMemberValidator,
  createProjectValidator,
  deleteProjectValidator,
  getProjectByIdValidator,
  getProjectStatusValidator,
  projectIdValidator,
  removeMemberValidator,
  updateMemberRoleValidator,
  updateProjectMembersValidator,
  updateProjectValidator,
} from "../validators/project.validators.js";
import {
  addMemberToProject,
  createProject,
  deleteProject,
  getProjectById,
  getProjectMembers,
  getProjects,
  getProjectStatus,
  removeMemberFromProject,
  updateMemberRole,
  updateProject,
  updateProjectMembers,
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
  .post(addMemberValidator(), validate, addMemberToProject)
  .patch(updateProjectMembersValidator(), validate, updateProjectMembers);

router
  .route("/:projectId/members/:memberId/role")
  .patch(updateMemberRoleValidator(), validate, updateMemberRole);

router.route("/get-projects").get(getProjects);

router
  .route("/:projectId")
  .get(getProjectByIdValidator(), validate, getProjectById)
  .patch(updateProjectValidator(), validate, updateProject)
  .delete(deleteProjectValidator(), validate, deleteProject);

router
  .route("/:projectId/members/:memberId")
  .delete(removeMemberValidator(), validate, removeMemberFromProject);

router
  .route("/:projectId/status")
  .get(getProjectStatusValidator(), validate, getProjectStatus);

export default router;
