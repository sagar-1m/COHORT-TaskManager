import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { UserRolesEnum } from "../utils/constants.js";
import ProjectMember from "../models/projectMember.models.js";

// Middleware: Require user to be a global admin
export const requireAdmin = asyncHandler(async (req, res, next) => {
  if (req.user?.role !== UserRolesEnum.ADMIN) {
    throw new ApiError(403, "Admin access required");
  }
  next();
});

// Middleware: Require user to be a project admin (or global admin)
export const requireProjectAdmin = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;
  const projectId = req.params.projectId || req.body.projectId;

  if (!projectId) {
    throw new ApiError(400, "Project ID is required");
  }

  // Allow global admin
  if (req.user?.role === UserRolesEnum.ADMIN) {
    return next();
  }

  // Check if user is a project admin for this project
  const membership = await ProjectMember.findOne({
    projectId,
    userId,
    role: UserRolesEnum.PROJECT_ADMIN,
  });

  if (!membership) {
    throw new ApiError(403, "Project admin access required");
  }
  next();
});
