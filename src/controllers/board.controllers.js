import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import Board from "../models/board.models.js";
import Project from "../models/project.models.js";
import ProjectMember from "../models/projectMember.models.js";
import Task from "../models/task.models.js";
import { BoardToTaskStatusMap } from "../utils/constants.js";

const createBoard = asyncHandler(async (req, res) => {
  // 1. Extract project ID from request params
  const { projectId } = req.params;

  // 2. Extract board data from request body
  const { name, description } = req.body;

  // 3. Extract user ID from request object
  const userId = req.user._id;

  try {
    // 4. Check if the project exists
    const project = await Project.findById(projectId);
    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    // 5. Check if the user is a project admin
    const userMembership = await ProjectMember.findOne({
      projectId,
      userId,
      role: "project_admin",
    });

    if (!userMembership) {
      throw new ApiError(403, "You don't have permission to create a boards");
    }

    // 6. Check if a board with the same name already exists
    const existingBoard = await Board.findOne({
      projectId,
      name,
    });
    if (existingBoard) {
      throw new ApiError(409, "A board with this name already exists");
    }

    // Map the board name to the task status
    const status = BoardToTaskStatusMap[name];
    if (!status) {
      throw new ApiError(400, "Invalid board name");
    }

    // 7. Create a new board
    const board = await Board.create({
      name,
      description: description ? description.trim() : undefined,
      projectId,
      createdBy: userId,
      status,
    });

    // 8. Send a success response
    return res.status(201).json(
      new ApiResponse(201, "Board created successfully", {
        board,
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

const getAllBoards = asyncHandler(async (req, res) => {
  // 1. Extract project ID from request params
  const { projectId } = req.params;

  // 2. Extract user ID from request object
  const userId = req.user._id;

  try {
    // 3. Check if the project exists
    const project = await Project.findById(projectId);
    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    // 4. Check if the user is a project member
    const userMembership = await ProjectMember.findOne({
      projectId,
      userId,
    });

    if (!userMembership) {
      throw new ApiError(403, "You don't have permission to view boards");
    }

    // 5. Fetch all boards for the project
    const boards = await Board.find({
      projectId,
      deleted: false, // Exclude deleted boards
    })
      .sort({ createdAt: -1 }) // Sort by creation date in descending order
      .populate("createdBy", "username email avatar"); // Populate the createdBy field with user details

    // Fetch the tasks for each board
    const boardsWithTasks = await Promise.all(
      boards.map(async (board) => {
        const tasks = await Task.find({
          projectId,
          status: board.status,
        })
          .populate("assignedTo", "username email avatar")
          .populate("createdBy", "username email avatar")
          .populate("updatedBy", "username email avatar");

        return {
          ...board.toObject(),
          tasks,
        };
      }),
    );

    // 6. Return the boards in the response
    return res.status(200).json(
      new ApiResponse(200, "Boards with tasks fetched successfully", {
        boards: boardsWithTasks,
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

const getBoardById = asyncHandler(async (req, res) => {
  // 1. Extract board ID and project ID from request params
  const { boardId, projectId } = req.params;

  // 2. Extract user ID from request object
  const userId = req.user._id;

  try {
    // 3. Check if the project exists
    const project = await Project.findById(projectId);
    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    // 4. Check if the board exists
    const board = await Board.findOne({
      _id: boardId,
      projectId,
      deleted: false, // Exclude deleted boards
    }).populate("createdBy", "username email avatar"); // Populate the createdBy field with user details
    if (!board) {
      throw new ApiError(404, "Board not found");
    }

    // 5. Check if the user is a project member
    const userMembership = await ProjectMember.findOne({
      projectId,
      userId,
    });
    if (!userMembership) {
      throw new ApiError(403, "You don't have permission to view this board");
    }

    // 6. Fetch tasks associated with the board
    const tasks = await Task.find({
      projectId,
      status: board.status,
    })
      .populate("assignedTo", "username email avatar")
      .populate("createdBy", "username email avatar")
      .populate("updatedBy", "username email avatar");

    // 7. Return the board and its tasks in the response
    return res.status(200).json(
      new ApiResponse(200, "Board and tasks fetched successfully", {
        board: {
          ...board.toObject(),
          tasks,
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

const deleteBoard = asyncHandler(async (req, res) => {
  // 1. Extract board ID and project ID from request params
  const { boardId, projectId } = req.params;

  // 2. Extract user ID from request object
  const userId = req.user._id;

  try {
    // 3. Check if the project exists
    const project = await Project.findById(projectId);
    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    // 4. Check if the board exists
    const board = await Board.findOne({
      _id: boardId,
      projectId,
      deleted: false, // Exclude deleted boards
    });
    if (!board) {
      throw new ApiError(404, "Board not found");
    }

    // 5. Chekc if the user is member of the project
    const userMembership = await ProjectMember.findOne({
      projectId,
      userId,
    });
    if (!userMembership) {
      throw new ApiError(403, "You don't have permission to delete this board");
    }

    // 6. Restrict MEMBER role from deleting boards
    if (userMembership.role === "member") {
      throw new ApiError(403, "You don't have permission to delete this board");
    }

    // 7. Soft delete the board
    board.deleted = true;
    await board.save();

    // 8. Send a success response
    return res.status(200).json(
      new ApiResponse(200, "Board deleted successfully", {
        boardId: board._id,
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

export { createBoard, getAllBoards, getBoardById, deleteBoard };
