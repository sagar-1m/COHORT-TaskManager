import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js ";
import { ApiResponse } from "../utils/api-response.js";

import User from "../models/user.models.js";
import Project from "../models/project.models.js";
import ProjectMember from "../models/projectMember.models.js";
import { UserRolesEnum } from "../utils/constants.js";
import Task from "../models/task.models.js";
import ProjectNote from "../models/note.models.js";

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

const addMemberToProject = asyncHandler(async (req, res) => {
  // 1. Extract project ID from req params
  const { projectId } = req.params;

  // 2. Extract user ID to be added and role from req body
  const { userId: newMemberId, role } = req.body;

  // 3. Get the authenticated user ID
  const requestingUserId = req.user._id;

  try {
    // 4. Check if the project exists
    const project = await Project.findById(projectId);
    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    // 5. Check if the requesting user is a PROJECT_ADMIN of this project
    const requestingUserMembership = await ProjectMember.findOne({
      projectId: project._id,
      userId: requestingUserId,
      role: UserRolesEnum.PROJECT_ADMIN,
    });

    if (!requestingUserMembership) {
      throw new ApiError(
        403,
        "You don't have permission to add members to this project",
      );
    }

    // 6. Check if the user to be added exists
    const userToAdd = await User.findById(newMemberId);
    if (!userToAdd) {
      throw new ApiError(404, "User not found");
    }

    // 7. Check if the user is already a member of the project
    const existingMembership = await ProjectMember.findOne({
      projectId: project._id,
      userId: newMemberId,
    });

    if (existingMembership) {
      throw new ApiError(409, "User is already a member of this project");
    }

    // 8. If role is not provided or invalid, set it to default MEMBER role
    const memberRole =
      role && Object.values(UserRolesEnum).includes(role)
        ? role
        : UserRolesEnum.MEMBER;

    // 9. Add the new member to the project
    const projectMember = await ProjectMember.create({
      projectId: project._id,
      userId: newMemberId,
      role: memberRole,
    });

    // 10. Return the created project member with user details
    const addedMember = await ProjectMember.findById(
      projectMember._id,
    ).populate({
      path: "userId",
      select: "username email avatar role",
    });

    // 11. Format the response data
    const member = {
      _id: addedMember._id,
      user: {
        _id: addedMember.userId._id,
        username: addedMember.userId.username,
        email: addedMember.userId.email,
        avatar: addedMember.userId.avatar,
      },
      role: addedMember.role,
      joinedAt: addedMember.createdAt,
    };

    return res.status(201).json(
      new ApiResponse(201, "Member added to project successfully", {
        member,
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

const updateMemberRole = asyncHandler(async (req, res) => {
  // 1. Extract project ID and member ID from req params
  const { projectId, memberId } = req.params;

  // 2. Extract new role from req body
  const { role } = req.body;

  // 3. Get the authenticated user ID
  const requestingUserId = req.user._id;

  try {
    // 4. Check if the project exists
    const project = await Project.findById(projectId);
    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    // 5. Check if the requesting user is a PROJECT_ADMIN of this project
    const requestingUserMembership = await ProjectMember.findOne({
      projectId: project._id,
      userId: requestingUserId,
      role: UserRolesEnum.PROJECT_ADMIN,
    });

    if (!requestingUserMembership) {
      throw new ApiError(
        403,
        "You don't have permission to update member roles in this project",
      );
    }

    // 6. Check if the member exists in the project
    const memberToUpdate = await ProjectMember.findOne({
      projectId: project._id,
      _id: memberId,
    });

    if (!memberToUpdate) {
      throw new ApiError(404, "Member not found in this project");
    }

    // 7. Check if the new role is valid
    if (!Object.values(UserRolesEnum).includes(role)) {
      throw new ApiError(400, "Invalid role provided");
    }

    // 8. Update the member's role in the project
    memberToUpdate.role = role;
    await memberToUpdate.save();

    // 9. Return the updated member details
    const updatedMember = await ProjectMember.findById(
      memberToUpdate._id,
    ).populate({
      path: "userId",
      select: "username email avatar role",
    });

    const member = {
      _id: updatedMember._id,
      user: {
        _id: updatedMember.userId._id,
        username: updatedMember.userId.username,
        email: updatedMember.userId.email,
        avatar: updatedMember.userId.avatar,
      },
      role: updatedMember.role,
      joinedAt: updatedMember.createdAt,
    };

    return res.status(200).json(
      new ApiResponse(200, "Member role updated successfully", {
        member,
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

const getProjects = asyncHandler(async (req, res) => {
  // 1. Get the authenticated user ID
  const userId = req.user._id;

  try {
    // 2. Get all projects where the user is a member
    const projectMemberships = await ProjectMember.find({
      userId: userId,
    }).populate({
      path: "projectId",
      select: "name description status priority tags createdBy",
      populate: {
        path: "createdBy",
        select: "username email avatar",
      },
    });

    // 3. Check if the user is a member of any projects
    if (projectMemberships.length === 0) {
      return res.status(200).json(
        new ApiResponse(200, "No projects found", {
          projects: [],
          count: 0,
        }),
      );
    }

    // 4. Format the response data
    const projects = projectMemberships.map((membership) => ({
      _id: membership.projectId._id,
      name: membership.projectId.name,
      description: membership.projectId.description,
      status: membership.projectId.status,
      priority: membership.projectId.priority,
      tags: membership.projectId.tags,
      createdBy: {
        _id: membership.projectId.createdBy._id,
        username: membership.projectId.createdBy.username,
        email: membership.projectId.createdBy.email,
        avatar: membership.projectId.createdBy.avatar,
      },
      role: membership.role,
      joinedAt: membership.createdAt,
    }));

    // 5. Return the list of projects
    return res.status(200).json(
      new ApiResponse(200, "Projects retrieved successfully", {
        projects,
        count: projects.length,
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

const getProjectById = asyncHandler(async (req, res) => {
  // 1. Extract the project ID from the request params
  const { projectId } = req.params;

  // 2. Get the authenticated user ID
  const userId = req.user._id;

  try {
    // 3. Check if the project exists
    const project = await Project.findOne({
      _id: projectId,
    });
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

    // 5. Format the response data
    const projectDetails = {
      _id: project._id,
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      visibility: project.visibility,
      tags: project.tags,
      createdBy: project.createdBy,
      role: userMembership.role,
      joinedAt: userMembership.createdAt,
    };

    // 6. Return the project details
    return res.status(200).json(
      new ApiResponse(200, "Project details retrieved successfully", {
        project: projectDetails,
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

const deleteProject = asyncHandler(async (req, res) => {
  // 1. Extract the project ID from the request params
  const { projectId } = req.params;

  // 2. Get the authenticated user ID
  const userId = req.user._id;

  try {
    // 3. Check if the project exists
    const project = await Project.findById(projectId);

    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    // 4. Check if the user is a PROJECT_ADMIN of the project
    const userMembership = await ProjectMember.findOne({
      projectId: project._id,
      userId: userId,
      role: UserRolesEnum.PROJECT_ADMIN,
    });
    if (!userMembership) {
      throw new ApiError(
        403,
        "You don't have permission to delete this project",
      );
    }

    // 6. Delete the project
    await Project.findByIdAndDelete(projectId);
    await ProjectMember.deleteMany({ projectId });
    await Task.deleteMany({ projectId });
    await ProjectNote.deleteMany({ projectId });

    // 7. Return success response
    return res
      .status(200)
      .json(new ApiResponse(200, "Project deleted successfully"));
  } catch (error) {
    if (error instanceof ApiError) throw error;

    throw new ApiError(
      error.statusCode || 500,
      error.message || "Something went wrong",
    );
  }
});

const removeMemberFromProject = asyncHandler(async (req, res) => {
  // 1. Extract project ID and member ID from req params
  const { projectId, memberId } = req.params;

  // 2. Get the authenticated user ID
  const requestingUserId = req.user._id;

  try {
    // 3. Check if the project exists
    const project = await Project.findById(projectId);
    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    // 4. Check if the requesting user is a PROJECT_ADMIN of this project
    const requestingUserMembership = await ProjectMember.findOne({
      projectId: project._id,
      userId: requestingUserId,
      role: UserRolesEnum.PROJECT_ADMIN,
    });

    if (!requestingUserMembership) {
      throw new ApiError(
        403,
        "You don't have permission to remove members from this project",
      );
    }

    // 5. Check if the member exists in the project
    const memberToRemove = await ProjectMember.findOne({
      projectId: project._id,
      _id: memberId,
    });
    if (!memberToRemove) {
      throw new ApiError(404, "Member not found in this project");
    }

    // 6. Check if the member is the only PROJECT_ADMIN in the project
    const adminCount = await ProjectMember.countDocuments({
      projectId: project._id,
      role: UserRolesEnum.PROJECT_ADMIN,
    });

    if (
      adminCount === 1 &&
      memberToRemove.role === UserRolesEnum.PROJECT_ADMIN
    ) {
      throw new ApiError(
        400,
        "Cannot remove the only PROJECT_ADMIN from the project",
      );
    }

    // 7. Remove the member from the project
    await ProjectMember.findByIdAndDelete(memberToRemove._id);

    // 8. Return success response
    return res
      .status(200)
      .json(new ApiResponse(200, "Member removed from project successfully"));
  } catch (error) {
    if (error instanceof ApiError) throw error;

    throw new ApiError(
      error.statusCode || 500,
      error.message || "Something went wrong",
    );
  }
});

const updateProject = asyncHandler(async (req, res) => {
  // 1. Extract project ID from req params
  const { projectId } = req.params;

  // 2. Get the authenticated user ID
  const userId = req.user._id;

  // 3. Extract the project data from the request body
  const { name, description, priority, status, visibility, tags, dueDate } =
    req.body;

  try {
    // 4. Check if the project exists
    const project = await Project.findOne({
      _id: projectId,
    });
    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    // 5. Check if the user is a PROJECT_ADMIN of the project
    const userMembership = await ProjectMember.findOne({
      projectId: project._id,
      userId: userId,
      role: UserRolesEnum.PROJECT_ADMIN,
    });
    if (!userMembership) {
      throw new ApiError(
        403,
        "You don't have permission to update this project",
      );
    }

    // 6. Update the project details
    project.name = name ? name.trim() : project.name;
    project.description = description
      ? description.trim()
      : project.description;
    project.priority = priority || project.priority;
    project.status = status || project.status;
    project.visibility = visibility || project.visibility;
    project.tags = tags || project.tags;
    project.dueDate = dueDate ? new Date(dueDate) : project.dueDate;

    // 7. Save the updated project
    await project.save();

    // 8. Return the updated project details
    return res.status(200).json(
      new ApiResponse(200, "Project updated successfully", {
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

const updateProjectMembers = asyncHandler(async (req, res) => {
  // 1. Extract project ID from req params
  const { projectId } = req.params;

  // 2. Get the authenticated user ID
  const userId = req.user._id;

  // 3. Extract the member IDs and their new roles from req body
  const { members } = req.body; // members should be an array of objects with userId and role

  try {
    // 4. Check if the project exists
    const project = await Project.findById(projectId);
    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    // 5. Check if the user is a PROJECT_ADMIN of the project
    const userMembership = await ProjectMember.findOne({
      projectId: project._id,
      userId: userId,
      role: UserRolesEnum.PROJECT_ADMIN,
    });

    if (!userMembership) {
      throw new ApiError(
        403,
        "You don't have permission to update project members",
      );
    }

    // 6. Validate and update each member's role
    const updatedMembers = [];
    for (const { memberId, role } of members) {
      // Check if the member exists in the project
      const memberToUpdate = await ProjectMember.findOne({
        projectId: project._id,
        _id: memberId,
      });

      if (!memberToUpdate) {
        throw new ApiError(
          404,
          `Member with ID ${memberId} not found in this project`,
        );
      }

      // Check if the new role is valid
      if (!Object.values(UserRolesEnum).includes(role)) {
        throw new ApiError(400, `Invalid role provided for member ${memberId}`);
      }

      // Update the member's role
      memberToUpdate.role = role;
      await memberToUpdate.save();

      // Populate the updated member details
      updatedMembers.push({
        _id: memberToUpdate._id,
        userId: memberToUpdate.userId,
        role: memberToUpdate.role,
        updatedAt: memberToUpdate.updatedAt,
      });
    }

    // 7. Return the updated members
    return res.status(200).json(
      new ApiResponse(200, "Project members updated successfully", {
        members: updatedMembers,
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

const getProjectStatus = asyncHandler(async (req, res) => {
  // 1. Extract project ID from req params
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

    // 5. Get the project status
    const projectStatus = {
      status: project.status,
      priority: project.priority,
      visibility: project.visibility,
      dueDate: project.dueDate,
      updatedAt: project.updatedAt,
    };

    // 6. Return the project status
    return res.status(200).json(
      new ApiResponse(200, "Project status retrieved successfully", {
        projectStatus,
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
