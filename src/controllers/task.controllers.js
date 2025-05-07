import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import Task from "../models/task.models.js";
import Project from "../models/project.models.js";
import ProjectMember from "../models/projectMember.models.js";

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
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

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

export { createTask, getTasks, assignTask };
