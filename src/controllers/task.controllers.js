import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import Task from "../models/task.models.js";
import Project from "../models/project.models.js";
import ProjectMember from "../models/projectMember.models.js";
import Board from "../models/board.models.js";

const createTask = asyncHandler(async (req, res) => {
  // 1. Extract project ID from request params
  const { projectId } = req.params;

  // 2. Extract task data from request body
  const { title, description, assignedTo, status, priority, dueDate } =
    req.body;

  // 3. Extract user ID from request object
  const userId = req.user._id;

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

    // 6. Restrict MEMBER role from assigning tasks to others
    if (
      userMembership.role === "member" &&
      assignedTo &&
      assignedTo.length > 0
    ) {
      throw new ApiError(403, "Members cannot assign tasks to other users");
    }

    // 7. Validate assigned users
    const assignedUserIds = [];
    if (assignedTo && assignedTo.length > 0) {
      for (const memberId of assignedTo) {
        const member = await ProjectMember.findOne({
          projectId,
          _id: memberId,
        });
        if (!member) {
          throw new ApiError(
            403,
            `Member with ID ${memberId} is not a member of the project`,
          );
        }
        assignedUserIds.push(member.userId);
      }
    }

    // 7. Create the task
    const task = await Task.create({
      title: title.trim(),
      description: description.trim(),
      projectId,
      assignedTo: assignedUserIds,
      status: status || "todo",
      priority: priority || "medium",
      dueDate: dueDate ? new Date(dueDate) : undefined,
      createdBy: userId,
      updatedBy: userId,
      needsReview:
        userMembership.role === "member" && assignedUserIds.length === 0,
    });

    // 8. Return the created task
    return res.status(201).json(
      new ApiResponse(201, "Task created successfully", {
        task,
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

const getTasks = asyncHandler(async (req, res) => {
  // 1. Extract project ID from request params
  const { projectId } = req.params;

  // 2. Extract user ID from request object
  const userId = req.user._id;

  // 3. Extract query parameters for filtering, sorting, and pagination
  const {
    status,
    priority,
    assignedTo,
    createdBy,
    needsReview,
    page,
    limit,
    sortBy,
    exactAssignedTo,
  } = req.query;

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

    // 6. Build the query object for filtering tasks
    const query = { projectId };

    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }
    if (assignedTo) {
      if (exactAssignedTo === "true") {
        query.assignedTo = { $eq: [assignedTo] };
      } else {
        query.assignedTo = { $in: assignedTo.split(",") };
      }
    }
    if (createdBy) {
      query.createdBy = createdBy;
    }
    if (needsReview) {
      query.needsReview = needsReview === "true";
    }

    // 7. Handle Pagination
    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * pageSize;

    // 8. Handle Sorting
    const sortOptions = {};
    if (sortBy) {
      const [field, order] = sortBy.split(":");
      sortOptions[field] = order === "desc" ? -1 : 1;
    } else {
      sortOptions.createdAt = -1; // Default sorting by creation date (newest first)
    }

    // 9. Fetch tasks from the database with filtering, sorting, and pagination
    const tasks = await Task.find(query)
      .skip(skip)
      .limit(pageSize)
      .sort(sortOptions)
      .populate("assignedTo", "username email avatar")
      .populate("createdBy", "username email avatar")
      .populate("updatedBy", "username email avatar");

    // 10. Get the total count of tasks for pagination
    const totalTasks = await Task.countDocuments(query);

    // 11. Return the tasks and pagination info
    return res.status(200).json(
      new ApiResponse(200, "Tasks fetched successfully", {
        tasks,
        pagination: {
          totalTasks,
          totalPages: Math.ceil(totalTasks / pageSize),
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

const getTaskById = asyncHandler(async (req, res) => {
  // 1. Extract task ID and project ID from request params
  const { taskId, projectId } = req.params;

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
    })
      .populate("assignedTo", "username email avatar")
      .populate("createdBy", "username email avatar")
      .populate("updatedBy", "username email avatar");

    if (!task) {
      throw new ApiError(404, "Task not found");
    }

    // 5. Check if the user is a member of the project
    const userMembership = await ProjectMember.findOne({
      projectId,
      userId,
    });
    if (!userMembership) {
      throw new ApiError(403, "User is not a member of the project");
    }

    // 6. Return the task details
    return res.status(200).json(
      new ApiResponse(200, "Task fetched successfully", {
        task,
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

const assignTask = asyncHandler(async (req, res) => {
  // 1. Extract task ID and project ID from request params
  const { taskId, projectId } = req.params;

  // 2. Extract user ID from request object
  const userId = req.user._id;

  // 3. Extract assigned user IDs from request body
  const { assignedTo } = req.body;

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

    // 6. Check if the user is a project admin
    const userMembership = await ProjectMember.findOne({
      projectId,
      userId,
      role: "project_admin",
    });
    if (!userMembership) {
      throw new ApiError(403, "You don't have permission to assign tasks");
    }

    // 7. Validate assigned users
    const assignedUserIds = [];
    if (assignedTo && assignedTo.length > 0) {
      for (const memberId of assignedTo) {
        const member = await ProjectMember.findOne({
          projectId,
          _id: memberId,
        });
        if (!member) {
          throw new ApiError(
            403,
            `Member with ID ${memberId} is not a member of the project`,
          );
        }
        assignedUserIds.push(member.userId);
      }
    }

    // 8. Update the task with the new assigned users
    task.assignedTo = assignedUserIds;
    task.updatedBy = userId;
    task.needsReview = false; // Mark as not needing review if assigned to someone
    await task.save();

    // 9. Return the updated task
    return res.status(200).json(
      new ApiResponse(200, "Task assigned successfully", {
        task,
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

const getBoardTasks = asyncHandler(async (req, res) => {
  // 1. Extract board ID from request params
  const { boardId } = req.params;

  // 2. Extract user ID from request object
  const userId = req.user._id;

  // 3. Extract query parameters for filtering, sorting, and pagination
  const { priority, assignedTo, page, limit, sortBy } = req.query;

  try {
    // 4. Check if the board exists and fetch its project ID
    const board = await Board.findById(boardId).populate("projectId", "name");

    if (!board) {
      throw new ApiError(404, "Board not found");
    }

    // 5. Check if the user is a member of the project associated with the board
    const userMembership = await ProjectMember.findOne({
      projectId: board.projectId._id,
      userId,
    });

    if (!userMembership) {
      throw new ApiError(403, "You don't have permission to access this board");
    }

    // 7. Build the query object for filtering tasks
    const query = {
      projectId: board.projectId._id,
      status: board.status,
    };
    if (priority) {
      query.priority = priority;
    }
    if (assignedTo) {
      query.assignedTo = { $in: assignedTo.split(",") };
    }

    // 8. Handle Pagination
    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * pageSize;

    // 9. Handle Sorting
    const sortOptions = {};
    if (sortBy) {
      const [field, order] = sortBy.split(":");
      sortOptions[field] = order === "desc" ? -1 : 1;
    } else {
      sortOptions.createdAt = -1; // Default sorting by creation date (newest first)
    }

    // 10. Fetch tasks from the database with filtering, sorting, and pagination
    const tasks = await Task.find(query)
      .skip(skip)
      .limit(pageSize)
      .sort(sortOptions)
      .populate("assignedTo", "username email avatar")
      .populate("createdBy", "username email avatar")
      .populate("updatedBy", "username email avatar");

    // 11. Get the total count of tasks for pagination
    const totalTasks = await Task.countDocuments(query);

    // 12. Return the tasks and pagination info
    return res.status(200).json(
      new ApiResponse(200, "Tasks fetched successfully", {
        tasks,
        pagination: {
          totalTasks,
          totalPages: Math.ceil(totalTasks / pageSize),
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

const updateTask = asyncHandler(async (req, res) => {
  // 1. Extract task ID and project ID from request params
  const { taskId, projectId } = req.params;

  // 2. Extract user ID from request object
  const userId = req.user._id;

  // 3. Extract update data from request body
  const { title, description, assignedTo, status, priority, dueDate } =
    req.body;

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
      throw new ApiError(403, "User is not a member of the project");
    }

    // 7. Restrict MEMBER role from updating certain fields
    if (userMembership.role === "member") {
      if (assignedTo || status) {
        throw new ApiError(
          403,
          "Members cannot update assigned users or status",
        );
      }
    }

    // 8. Validate assigned users
    const assignedUserIds = [];
    if (assignedTo && assignedTo.length > 0) {
      for (const memberId of assignedTo) {
        const member = await ProjectMember.findOne({
          projectId,
          _id: memberId,
        });
        if (!member) {
          throw new ApiError(
            403,
            `Member with ID ${memberId} is not a member of the project`,
          );
        }
        assignedUserIds.push(member.userId);
      }
    }

    // 9. Update the task with the new data
    task.title = title ? title.trim() : task.title;
    task.description = description ? description.trim() : task.description;
    task.assignedTo =
      assignedUserIds.length > 0 ? assignedUserIds : task.assignedTo;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.dueDate = dueDate ? new Date(dueDate) : task.dueDate;
    task.updatedBy = userId;

    // 10. Save the updated task
    await task.save();

    // 11. Return the updated task
    return res.status(200).json(
      new ApiResponse(200, "Task updated successfully", {
        task,
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

const deleteTask = asyncHandler(async (req, res) => {
  // 1. Extract task ID and project ID from request params
  const { taskId, projectId } = req.params;

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
      deleted: false, // Exclude deleted tasks
    });
    if (!task) {
      throw new ApiError(404, "Task not found");
    }

    // 5. Check if the user is a member of the project
    const userMembership = await ProjectMember.findOne({
      projectId,
      userId,
    });
    if (!userMembership) {
      throw new ApiError(403, "User is not a member of the project");
    }

    // 6. Restrict MEMBER role from deleting tasks
    if (userMembership.role === "member") {
      throw new ApiError(403, "Members cannot delete tasks");
    }

    // 7. Soft delete the task
    task.deleted = true;
    task.updatedBy = userId;
    await task.save();

    // 8. Remove task from the board if it exists
    const board = await Board.findOne({
      projectId,
      taskId,
    });
    if (board) {
      await Board.deleteOne({
        projectId,
        taskId,
      });
    }

    // 9. Remove task from the project if it exists
    const projectTask = await Project.findOne({
      _id: projectId,
      tasks: taskId,
    });
    if (projectTask) {
      await Project.updateOne(
        {
          _id: projectId,
        },
        {
          $pull: { tasks: taskId },
        },
      );
    }

    // 10. Remove task from the project members if it exists
    const projectMember = await ProjectMember.findOne({
      projectId,
      tasks: taskId,
    });
    if (projectMember) {
      await ProjectMember.updateOne(
        {
          projectId,
        },
        {
          $pull: { tasks: taskId },
        },
      );
    }

    // 10. Return success response
    return res.status(200).json(
      new ApiResponse(200, "Task deleted successfully", {
        taskId,
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
  createTask,
  getTasks,
  getTaskById,
  assignTask,
  getBoardTasks,
  updateTask,
  deleteTask,
};
