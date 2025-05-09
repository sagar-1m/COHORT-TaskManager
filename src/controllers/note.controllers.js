import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import Project from "../models/project.models.js";
import Task from "../models/task.models.js";
import ProjectMember from "../models/projectMember.models.js";
import ProjectNote from "../models/note.models.js ";

const createNote = asyncHandler(async (req, res) => {
  // 1. Extract projectId and taskId from the request params
  const { projectId, taskId } = req.params;

  // 2. Extract user ID from request object
  const userId = req.user._id;

  // 3. Extract note data from request body
  const { content, visibility } = req.body;

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
      throw new ApiError(403, "User is not a member of the project");
    }

    // 6. Enforce RBAC for project level notes
    if (!taskId) {
      if (userMembership.role !== "project_admin") {
        throw new ApiError(
          403,
          "Only project admins can create project level notes",
        );
      }
    }

    // 7. Enforce RBAC for task level notes
    if (taskId) {
      const task = await Task.findOne({ _id: taskId, projectId });
      if (!task) {
        throw new ApiError(404, "Task not found in the project");
      }

      // Restrict note creation to task assignees only
      if (
        userMembership.role === "member" &&
        !task.assignedTo.includes(userId)
      ) {
        throw new ApiError(
          403,
          "Members can only create notes for tasks they are assigned to",
        );
      }
    }

    // 8. Create the note
    const note = await ProjectNote.create({
      projectId,
      taskId: taskId || undefined,
      createdBy: userId,
      content: content.trim(),
      visibility: visibility || "private",
    });

    // 9. Send success response
    return res.status(201).json(
      new ApiResponse(201, "Note created successfully", {
        note,
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

const getNotes = asyncHandler(async (req, res) => {});

const getNoteById = asyncHandler(async (req, res) => {});

const updateNote = asyncHandler(async (req, res) => {});

const deleteNote = asyncHandler(async (req, res) => {});

const getNoteAnalytics = asyncHandler(async (req, res) => {});

export {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  getNoteAnalytics,
};
