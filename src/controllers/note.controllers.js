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

const getNotes = asyncHandler(async (req, res) => {
  // 1. Extract projectId and taskId from the request params
  const { projectId, taskId } = req.params;

  // 2. Extract user ID from request object
  const userId = req.user._id;

  // 3. Extract query parameters for filtering and pagination
  const { visibility, page, limit } = req.query;

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

    // 6. Build the query for fetching notes
    const query = { projectId, deleted: false };
    if (taskId) {
      query.taskId = taskId;
    }

    // Enforce visibility restrictions based on user role
    if (visibility === "private") {
      if (userMembership.role === "project_admin") {
        query.visibility = "private";
      } else {
        query.visibility = "private";
        query.createdBy = userId;
      }
    } else if (visibility) {
      query.visibility = visibility;
    }

    // 7. Handle pagination
    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * pageSize;

    // 8. Fetch notes from the database
    const notes = await ProjectNote.find(query)
      .skip(skip)
      .limit(pageSize)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    // 9. Get the total count of notes for pagination
    const totalNotes = await ProjectNote.countDocuments(query);

    // 10. Send success response
    return res.status(200).json(
      new ApiResponse(200, "Notes fetched successfully", {
        notes,
        pagination: {
          totalNotes,
          totalPages: Math.ceil(totalNotes / pageSize),
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

const getNoteById = asyncHandler(async (req, res) => {
  // 1. Extract projectId, taskId, and noteId from the request params
  const { projectId, taskId, noteId } = req.params;

  // 2. Extract user ID from request object
  const userId = req.user._id;

  try {
    // 3. Check if the project exists
    const project = await Project.findById(projectId);
    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    // 4. Check if the user is a member of the project
    const userMembership = await ProjectMember.findOne({
      projectId,
      userId,
    });
    if (!userMembership) {
      throw new ApiError(403, "User is not a member of the project");
    }

    // 5. Fetch the note from the database
    const note = await ProjectNote.findById(noteId).populate(
      "createdBy",
      "name email",
    );
    if (!note || note.projectId.toString() !== projectId) {
      throw new ApiError(404, "Note not found in the project");
    }

    // Validate task association if taskId is provided
    if (taskId) {
      if (!note.taskId || note.taskId.toString() !== taskId) {
        throw new ApiError(404, "Note not found in the specified task");
      }
    }

    // 6. Enforce visibility restrictions based on user role
    if (note.visibility === "private") {
      if (
        userMembership.role !== "project_admin" &&
        note.createdBy.toString() !== userId
      ) {
        throw new ApiError(403, "You do not have permission to view this note");
      }
    } else if (note.visibility === "public") {
      // Public notes are accessible to all project members
    } else {
      throw new ApiError(400, "Invalid note visibility");
    }

    // 7. Send success response
    return res.status(200).json(
      new ApiResponse(200, "Note fetched successfully", {
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

const updateNote = asyncHandler(async (req, res) => {
  // 1. Extract projectId, taskId, and noteId from the request params
  const { projectId, taskId, noteId } = req.params;

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

    // 6. Fetch the note from the database
    const note = await ProjectNote.findById(noteId);
    if (!note || note.projectId.toString() !== projectId) {
      throw new ApiError(404, "Note not found in the project");
    }

    // Validate task association if taskId is provided
    if (taskId) {
      if (!note.taskId || note.taskId.toString() !== taskId) {
        throw new ApiError(404, "Note not found in the specified task");
      }
    }

    // 7. Enforce RBAC for updating notes
    if (
      userMembership.role !== "project_admin" &&
      note.createdBy.toString() !== userId
    ) {
      throw new ApiError(403, "You do not have permission to update this note");
    }

    // 8. Update the note
    note.content = content ? content.trim() : note.content;
    note.visibility = visibility || note.visibility;

    await note.save();

    // 9. Send success response
    return res.status(200).json(
      new ApiResponse(200, "Note updated successfully", {
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

const deleteNote = asyncHandler(async (req, res) => {
  // 1. Extract projectId, taskId, and noteId from the request params
  const { projectId, taskId, noteId } = req.params;

  // 2. Extract user ID from request object
  const userId = req.user._id;

  try {
    // 3. Check if the project exists
    const project = await Project.findById(projectId);
    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    // 4. Check if the user is a member of the project
    const userMembership = await ProjectMember.findOne({
      projectId,
      userId,
    });
    if (!userMembership) {
      throw new ApiError(403, "User is not a member of the project");
    }

    // 5. Fetch the note from the database
    const note = await ProjectNote.findById(noteId);
    if (!note || note.projectId.toString() !== projectId) {
      throw new ApiError(404, "Note not found in the project");
    }

    // Validate task association if taskId is provided
    if (taskId) {
      if (!note.taskId || note.taskId.toString() !== taskId) {
        throw new ApiError(404, "Note not found in the specified task");
      }
    }

    // 6. Enforce RBAC for deleting notes
    if (
      userMembership.role !== "project_admin" &&
      note.createdBy.toString() !== userId
    ) {
      throw new ApiError(403, "You do not have permission to delete this note");
    }

    // 7. Soft delete the note
    note.deleted = true;
    await note.save();

    // 8. Send success response
    return res.status(200).json(
      new ApiResponse(200, "Note deleted successfully", {
        noteId: note._id,
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

const getNoteAnalytics = asyncHandler(async (req, res) => {});

export {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  getNoteAnalytics,
};
