import { body, param, query } from "express-validator";
import {
  AvailableTaskStatuses,
  ProjectPriorityEnum,
} from "../utils/constants.js";

const createTaskValidator = () => {
  return [
    param("projectId")
      .notEmpty()
      .withMessage("Project ID is required")
      .isMongoId()
      .withMessage("Invalid Project ID format"),
    body("title")
      .notEmpty()
      .withMessage("Title is required")
      .isString()
      .withMessage("Title must be a string")
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Task Title must be between 3 and 100 characters"),
    body("description")
      .notEmpty()
      .withMessage("Task description is required")
      .isString()
      .withMessage("Task description must be a string")
      .trim(),
    body("status")
      .optional()
      .isString()
      .withMessage("Status must be a string")
      .isIn(AvailableTaskStatuses)
      .withMessage("Invalid task status"),
    body("priority")
      .optional()
      .isString()
      .withMessage("Priority must be a string")
      .isIn(Object.values(ProjectPriorityEnum))
      .withMessage("Invalid task priority"),
    body("assignedTo")
      .optional()
      .isArray()
      .withMessage("Assigned users must be an array")
      .custom((value) => {
        for (const memberId of value) {
          if (!memberId.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error("Invalid member ID format");
          }
        }
        return true;
      }),

    body("dueDate")
      .optional()
      .isISO8601()
      .withMessage("Due date must be a valid date format"),
    body("attachments")
      .optional()
      .isArray()
      .withMessage("Attachments must be an array")
      .custom((value) => {
        if (value.length > 5) {
          throw new Error("You can only upload a maximum of 5 attachments");
        }
        return true;
      }),
  ];
};

const getTasksValidator = () => {
  return [
    param("projectId")
      .notEmpty()
      .withMessage("Project ID is required")
      .isMongoId()
      .withMessage("Invalid Project ID format"),
    query("status")
      .optional()
      .isIn(AvailableTaskStatuses)
      .withMessage("Invalid task status"),
    query("priority")
      .optional()
      .isIn(Object.values(ProjectPriorityEnum))
      .withMessage("Invalid task priority"),
    query("assignedTo")
      .optional()
      .isMongoId()
      .withMessage("Assigned user ID must be a valid MongoDB ID"),
    query("exactAssignedTo")
      .optional()
      .isBoolean()
      .withMessage("Exact assignedTo must be a boolean"),
    query("createdBy")
      .optional()
      .isMongoId()
      .withMessage("Invalid CreatedBy user ID format"),
    query("needsReview")
      .optional()
      .isBoolean()
      .withMessage("Needs review must be a boolean"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be a positive integer and at most 100"),
    query("sortBy")
      .optional()
      .isString()
      .withMessage("SortBy must be a string in the format 'field:order'"),
  ];
};

const getTaskByIdValidator = () => {
  return [
    param("taskId")
      .notEmpty()
      .withMessage("Task ID is required")
      .isMongoId()
      .withMessage("Invalid Task ID format"),
    param("projectId")
      .notEmpty()
      .withMessage("Project ID is required")
      .isMongoId()
      .withMessage("Invalid Project ID format"),
  ];
};

const assignTaskValidator = () => {
  return [
    param("taskId")
      .notEmpty()
      .withMessage("Task ID is required")
      .isMongoId()
      .withMessage("Invalid Task ID format"),
    param("projectId")
      .notEmpty()
      .withMessage("Project ID is required")
      .isMongoId()
      .withMessage("Invalid Project ID format"),
    body("assignedTo")
      .optional()
      .isArray()
      .withMessage("Assigned users must be an array")
      .custom((value) => {
        for (const memberId of value) {
          if (!memberId.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error("Invalid member ID format");
          }
        }
        return true;
      }),
  ];
};

const getBoardTasksValidator = () => {
  return [
    param("boardId")
      .notEmpty()
      .withMessage("Board ID is required")
      .isMongoId()
      .withMessage("Invalid Board ID format"),
    query("status")
      .optional()
      .isIn(AvailableTaskStatuses)
      .withMessage("Invalid task status"),
    query("priority")
      .optional()
      .isIn(Object.values(ProjectPriorityEnum))
      .withMessage("Invalid task priority"),
    query("assignedTo")
      .optional()
      .isMongoId()
      .withMessage("Assigned user ID must be a valid MongoDB ID"),
    query("exactAssignedTo")
      .optional()
      .isBoolean()
      .withMessage("Exact assignedTo must be a boolean"),
    query("createdBy")
      .optional()
      .isMongoId()
      .withMessage("Invalid CreatedBy user ID format"),
    query("needsReview")
      .optional()
      .isBoolean()
      .withMessage("Needs review must be a boolean"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be a positive integer and at most 100"),
    query("sortBy")
      .optional()
      .isString()
      .withMessage("SortBy must be a string in the format 'field:order'"),
  ];
};

const updateTaskValidator = () => {
  return [
    param("taskId")
      .notEmpty()
      .withMessage("Task ID is required")
      .isMongoId()
      .withMessage("Invalid Task ID format"),
    param("projectId")
      .notEmpty()
      .withMessage("Project ID is required")
      .isMongoId()
      .withMessage("Invalid Project ID format"),
    body("title")
      .optional()
      .isString()
      .withMessage("Title must be a string")
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Task Title must be between 3 and 100 characters"),
    body("description")
      .optional()
      .isString()
      .withMessage("Task description must be a string")
      .trim(),
    body("status")
      .optional()
      .isString()
      .withMessage("Status must be a string")
      .isIn(AvailableTaskStatuses)
      .withMessage("Invalid task status"),
    body("priority")
      .optional()
      .isString()
      .withMessage("Priority must be a string")
      .isIn(Object.values(ProjectPriorityEnum))
      .withMessage("Invalid task priority"),
    body("assignedTo")
      .optional()
      .isArray()
      .withMessage("Assigned users must be an array")
      .custom((value) => {
        for (const memberId of value) {
          if (!memberId.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error("Invalid member ID format");
          }
        }
        return true;
      }),

    body("dueDate")
      .optional()
      .isISO8601()
      .withMessage("Due date must be a valid date format"),
    body("attachments")
      .optional()
      .isArray()
      .withMessage("Attachments must be an array")
      .custom((value) => {
        if (value.length > 5) {
          throw new Error("You can only upload a maximum of 5 attachments");
        }
        return true;
      }),
  ];
};

const deleteTaskValidator = () => {
  return [
    param("taskId")
      .notEmpty()
      .withMessage("Task ID is required")
      .isMongoId()
      .withMessage("Invalid Task ID format"),
    param("projectId")
      .notEmpty()
      .withMessage("Project ID is required")
      .isMongoId()
      .withMessage("Invalid Project ID format"),
  ];
};

export {
  createTaskValidator,
  getTasksValidator,
  getTaskByIdValidator,
  assignTaskValidator,
  getBoardTasksValidator,
  updateTaskValidator,
  deleteTaskValidator,
};
