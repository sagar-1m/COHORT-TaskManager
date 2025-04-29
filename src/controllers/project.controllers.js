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

const getProjectMembers = asyncHandler(async (req, res) => {
  // 1. Extract the project ID from the request parameters
  const { projectId } = req.params;

  // 2. Get the authenticated user ID
  const userId = req.user._id;

  try {
    // 3. Check if the project exists
    const project = await Project.findById(projectId);
    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    // 4. Check if the user is a member of the project
    const userMembership = await ProjectMember.findOne({
      projectId: project._id,
      userId: userId,
    });

    if (!userMembership) {
      throw new ApiError(403, "You don't have access to this project");
    }

    // 5. Get all members of the project
    const projectMembers = await ProjectMember.find({
      projectId,
    }).populate({
      path: "userId",
      select: "username email avatar role",
    });

    // 6. Format the response data
    const members = projectMembers.map((member) => ({
      _id: member._id,
      user: {
        _id: member.userId._id,
        username: member.userId.username,
        email: member.userId.email,
        avatar: member.userId.avatar,
      },
      role: member.role,
      joinedAt: member.createdAt,
    }));

    // 7. Return the formatted response
    return res.status(200).json(
      new ApiResponse(200, "Project members retrieved successfully", {
        members,
        count: members.length,
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
