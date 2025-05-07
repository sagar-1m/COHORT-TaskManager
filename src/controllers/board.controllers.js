import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import Board from "../models/board.models.js";
import Project from "../models/project.models.js";
import ProjectMember from "../models/projectMember.models.js";
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
      .populate("createdBy", "name email"); // Populate the createdBy field with user details

    // 6. Return the boards in the response
    return res.status(200).json(
      new ApiResponse(200, "Boards fetched successfully", {
        boards,
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

export { createBoard, getAllBoards };
