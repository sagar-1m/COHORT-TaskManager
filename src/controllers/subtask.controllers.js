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

const getSubtasks = asyncHandler(async (req, res) => {});

const getSubtaskById = asyncHandler(async (req, res) => {});

const updateSubtask = asyncHandler(async (req, res) => {});

const deleteSubtask = asyncHandler(async (req, res) => {});

const getAllSubtasksByTaskId = asyncHandler(async (req, res) => {});

const getAllSubtasksByProjectId = asyncHandler(async (req, res) => {});

export {
  createSubtask,
  // getSubtasks
  // getSubtaskById,
  // updateSubtask,
  // deleteSubtask,
  // getAllSubtasksByTaskId,
  // getAllSubtasksByProjectId,
};
