import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import Subtask from "../models/subTask.models.js";
import Task from "../models/task.models.js";
import Project from "../models/project.models.js";
import ProjectMember from "../models/projectMember.models.js";

const createSubtask = asyncHandler(async (req, res) => {
  // 1. Extract taskId and projectId from the request params
  const { taskId, projectId } = req.params;

  // 2. Extract user ID from request object
  const userId = req.user._id;

  // 3. Extract subtask data from request body
  const { title, description, dueDate, priority } = req.body;

  try {
    // 4. Check if the project exists
    const project = await Project.findById(projectId);
    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    // 5. Check if the task exists
    const task = await Task.findOne({
      _id: taskId,
      projectId,
    });
    if (!task) {
      throw new ApiError(404, "Task not found");
    }

    // 6. Check if the user is a member of the project
    const userMembership = await ProjectMember.findOne({
      projectId,
      userId,
    });
    if (!userMembership) {
      throw new ApiError(403, "You don't have permission to create subtasks");
    }

    // 7. Restrict MEMBER role from creating subtasks for tasks that are not assigned to them
    if (userMembership.role === "member" && !task.assignedTo.includes(userId)) {
      throw new ApiError(
        403,
        "Members can only create subtasks for tasks assigned to them",
      );
    }

    // 8. Restrict MEMBER role from assigning subtasks to other members
    if (userMembership.role === "member" && req.body.assignedTo) {
      throw new ApiError(403, "Members can only assign subtasks to themselves");
    }

    // 9. Create the subtask
    const subtask = await Subtask.create({
      title: title.trim(),
      description: description.trim(),
      taskId,
      projectId,
      createdBy: userId,
      updatedBy: userId,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority: priority || "medium",
    });

    // 10. Respond with the created subtask
    return res.status(201).json(
      new ApiResponse(201, "Subtask created successfully", {
        subtask,
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

const getSubtaskById = asyncHandler(async (req, res) => {
  // 1. Extract subtaskId, taskId, and projectId from the request params
  const { subtaskId, taskId, projectId } = req.params;

  // 2. Extract user ID from request object
  const userId = req.user._id;

  try {
    // 3. Check if the project exists
    const project = await Project.findById(projectId);
    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    // 4. Check if the task exists
    const task = await Task.findOne({
      _id: taskId,
      projectId,
    });
    if (!task) {
      throw new ApiError(404, "Task not found");
    }

    // 5. Check if the subtask exists
    const subtask = await Subtask.findOne({
      _id: subtaskId,
      taskId,
      projectId,
    })
      .populate("createdBy", "username email avatar")
      .populate("updatedBy", "username email avatar");
    if (!subtask) {
      throw new ApiError(404, "Subtask not found");
    }

    // 6. Check if the user is a member of the project
    const userMembership = await ProjectMember.findOne({
      projectId,
      userId,
    });
    if (!userMembership) {
      throw new ApiError(403, "You don't have permission to view subtasks");
    }

    // 7. Respond with the subtask details
    return res.status(200).json(
      new ApiResponse(200, "Subtask fetched successfully", {
        subtask,
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

const updateSubtask = asyncHandler(async (req, res) => {
  // 1. Extract subtaskId, taskId, and projectId from the request params
  const { subtaskId, taskId, projectId } = req.params;

  // 2. Extract user ID from request object
  const userId = req.user._id;

  // 3. Extract update data from request body
  const { title, description, dueDate, priority, isCompleted } = req.body;

  try {
    // 4. Check if the project exists
    const project = await Project.findById(projectId);
    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    // 5. Check if the task exists
    const task = await Task.findOne({
      _id: taskId,
      projectId,
    });
    if (!task) {
      throw new ApiError(404, "Task not found");
    }

    // 6. Check if the subtask exists
    const subtask = await Subtask.findOne({
      _id: subtaskId,
      taskId,
      projectId,
    });
    if (!subtask) {
      throw new ApiError(404, "Subtask not found");
    }

    // 7. Check if the user is a member of the project
    const userMembership = await ProjectMember.findOne({
      projectId,
      userId,
    });
    if (!userMembership) {
      throw new ApiError(403, "You don't have permission to update subtasks");
    }

    // 8. Restrict MEMBER role from updating subtasks they don't own or that are not assigned to them
    if (userMembership.role === "member") {
      const isSubtaskOwner = subtask.createdBy.toString() === userId.toString();
      const isTaskAssignedToUser = task.assignedTo.includes(userId);

      if (!isSubtaskOwner && !isTaskAssignedToUser) {
        throw new ApiError(
          403,
          "Members can only update their own subtasks or those assigned to them",
        );
      }
    }

    // 9. Update the subtask fields
    subtask.title = title ? title.trim() : subtask.title;
    subtask.description = description
      ? description.trim()
      : subtask.description;
    subtask.dueDate = dueDate ? new Date(dueDate) : subtask.dueDate;
    subtask.priority = priority || subtask.priority;
    subtask.isCompleted =
      typeof isCompleted === "boolean" ? isCompleted : subtask.isCompleted;
    subtask.updatedBy = userId;

    await subtask.save();

    // 10. Respond with the updated subtask
    return res.status(200).json(
      new ApiResponse(200, "Subtask updated successfully", {
        subtask,
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

const deleteSubtask = asyncHandler(async (req, res) => {
  // 1. Extract subtaskId, taskId, and projectId from the request params
  const { subtaskId, taskId, projectId } = req.params;

  // 2. Extract user ID from request object
  const userId = req.user._id;

  try {
    // 3. Check if the project exists
    const project = await Project.findById(projectId);
    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    // 4. Check if the task exists
    const task = await Task.findOne({
      _id: taskId,
      projectId,
    });
    if (!task) {
      throw new ApiError(404, "Task not found");
    }

    // 5. Check if the subtask exists
    const subtask = await Subtask.findOne({
      _id: subtaskId,
      taskId,
      projectId,
    });
    if (!subtask) {
      throw new ApiError(404, "Subtask not found");
    }

    // 6. Check if the user is a member of the project
    const userMembership = await ProjectMember.findOne({
      projectId,
      userId,
    });
    if (!userMembership) {
      throw new ApiError(403, "You don't have permission to delete subtasks");
    }

    // 7. Restrict MEMBER role from deleting subtasks
    if (userMembership.role === "member") {
      throw new ApiError(403, "Members are not allowed to delete subtasks");
    }

    // 8. Soft delete the subtask
    subtask.deleted = true;
    await subtask.save();

    // 9. Respond with a success message
    return res.status(200).json(
      new ApiResponse(200, "Subtask deleted successfully", {
        subtaskId,
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

const getAllSubtasksByTaskId = asyncHandler(async (req, res) => {
  // 1. Extract taskId and projectId from the request params
  const { taskId, projectId } = req.params;

  // 2. Extract user ID from request object
  const userId = req.user._id;

  // 3. Extract query parameters for pagination and filtering
  const { isCompleted, priority, page, limit } = req.query;

  try {
    // 4. Check if the project exists
    const project = await Project.findById(projectId);
    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    // 5. Check if the task exists
    const task = await Task.findOne({
      _id: taskId,
      projectId,
    });
    if (!task) {
      throw new ApiError(404, "Task not found");
    }

    // 6. Check if the user is a member of the project
    const userMembership = await ProjectMember.findOne({
      projectId,
      userId,
    });
    if (!userMembership) {
      throw new ApiError(403, "You don't have permission to view subtasks");
    }

    // 7. Build the query object for filtering subtasks
    const query = {
      taskId,
      projectId,
    };
    if (isCompleted !== undefined) {
      query.isCompleted = isCompleted === "true";
    }
    if (priority) {
      query.priority = priority;
    }

    // 8. Handle pagination
    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * pageSize;

    // 9. Fetch subtasks with pagination and filtering
    const subtasks = await Subtask.find(query)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 }) // Sort by creation date (newest first)
      .populate("createdBy", "username email avatar")
      .populate("updatedBy", "username email avatar");

    // 10. Get the total count of subtasks for pagination info
    const totalSubtasks = await Subtask.countDocuments(query);

    // 11. Calculate total pages
    const totalPages = Math.ceil(totalSubtasks / pageSize);

    // 12. Respond with the subtasks and pagination info
    return res.status(200).json(
      new ApiResponse(200, "Subtasks fetched successfully", {
        subtasks,
        pagination: {
          totalSubtasks,
          totalPages,
          currentPage: pageNumber,
          pageSize,
        },
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

const getAllSubtasksByProjectId = asyncHandler(async (req, res) => {
  // 1. Extract projectId from the request params
  const { projectId } = req.params;

  // 2. Extract user ID from request object
  const userId = req.user._id;

  // 3. Extract query parameters for pagination and filtering
  const { isCompleted, priority, page, limit } = req.query;

  try {
    // 4. Check if the project exists
    const project = await Project.findById(projectId);
    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    // 5. Check if the user is a member of the project
    const userMembership = await ProjectMember.findOne({
      projectId,
      userId,
    });
    if (!userMembership) {
      throw new ApiError(403, "You don't have permission to view subtasks");
    }

    // 6. Build the query object for filtering subtasks
    const query = {
      projectId,
    };
    if (isCompleted !== undefined) {
      query.isCompleted = isCompleted === "true";
    }
    if (priority) {
      query.priority = priority;
    }

    // 7. Handle pagination
    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * pageSize;

    // 8. Fetch subtasks with pagination and filtering
    const subtasks = await Subtask.find(query)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 }) // Sort by creation date (newest first)
      .populate("createdBy", "username email avatar")
      .populate("updatedBy", "username email avatar");

    // 9. Get the total count of subtasks for pagination info
    const totalSubtasks = await Subtask.countDocuments(query);

    // 10. Respond with the subtasks and pagination info
    return res.status(200).json(
      new ApiResponse(200, "Subtasks fetched successfully", {
        subtasks,
        pagination: {
          totalSubtasks,
          totalPages: Math.ceil(totalSubtasks / pageSize),
          currentPage: pageNumber,
          pageSize,
        },
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
  createSubtask,
  getSubtaskById,
  updateSubtask,
  deleteSubtask,
  getAllSubtasksByTaskId,
  getAllSubtasksByProjectId,
};
