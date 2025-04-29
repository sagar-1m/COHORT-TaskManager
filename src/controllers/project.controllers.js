import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js ";
import { ApiResponse } from "../utils/api-response.js";

import Project from "../models/project.models.js";
import ProjectMember from "../models/projectmember.models.js";
import { UserRolesEnum } from "../utils/constants.js";

const createProject = asyncHandler(async (req, res) => {
  // 1. Extract the user ID from the request object
  const userId = req.user._id;

  // 2. Extract the project data from the request body
  const { name, description, priority, status, visibility, tags, dueDate } =
    req.body;

  try {
    // 3. Check if a project with same name already exists for the user
    const existingProject = await Project.findOne({
      name: name.trim(),
      createdBy: userId,
    });

    if (existingProject) {
      throw new ApiError(409, "Project with this name already exists");
    }

    // 4. Create new project object
    const project = await Project.create({
      name: name.trim(),
      description: description.trim(),
      priority: priority || undefined,
      status: status || undefined,
      visibility: visibility || undefined,
      tags: tags || [],
      dueDate: dueDate ? new Date(dueDate) : undefined,
      createdBy: userId,
    });

    // 5. Add the creator of project as a PROJECT_ADMIN role
    await ProjectMember.create({
      projectId: project._id,
      userId: userId,
      role: UserRolesEnum.PROJECT_ADMIN,
    });

    // 6. Return the created project
    return res.status(201).json(
      new ApiResponse(201, "Project created successfully", {
        project,
      }),
    );
  } catch (error) {
    if (error instanceof ApiError) throw error;

    throw new ApiError(
      error.statusCode || 500,
      error.message || "Something went wrong",
    );
  }
});

const getProjects = asyncHandler(async (req, res) => {});

const getProjectById = asyncHandler(async (req, res) => {});

const updateProject = asyncHandler(async (req, res) => {});

const deleteProject = asyncHandler(async (req, res) => {});

const addMemberToProject = asyncHandler(async (req, res) => {});

const getProjectMembers = asyncHandler(async (req, res) => {});

const updateProjectMembers = asyncHandler(async (req, res) => {});

const updateMemberRole = asyncHandler(async (req, res) => {});

const removeMemberFromProject = asyncHandler(async (req, res) => {});

const getProjectStatus = asyncHandler(async (req, res) => {});

export {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMemberToProject,
  getProjectMembers,
  updateProjectMembers,
  updateMemberRole,
  removeMemberFromProject,
  getProjectStatus,
};
