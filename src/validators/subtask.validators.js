import { body, param, query } from "express-validator";
import { AvailableSubtaskPriorities } from "../utils/constants.js";

const createSubtaskValidator = () => {
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
      .notEmpty()
      .withMessage("Title is required")
      .isString()
      .withMessage("Title must be a string")
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Subtask Title must be between 3 and 100 characters"),
    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string")
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description must be less than 500 characters"),
    body("dueDate")
      .optional()
      .isISO8601()
      .withMessage("Due date must be a valid ISO 8601 date string"),
    body("priority")
      .optional()
      .isString()
      .withMessage("Priority must be a string")
      .isIn(AvailableSubtaskPriorities)
      .withMessage("Invalid subtask priority"),
  ];
};

const updateSubtaskValidator = () => {
  return [
    param("subtaskId")
      .notEmpty()
      .withMessage("Subtask ID is required")
      .isMongoId()
      .withMessage("Invalid Subtask ID format"),
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
      .withMessage("Subtask Title must be between 3 and 100 characters"),
    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string")
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description must be less than 500 characters"),
    body("dueDate")
      .optional()
      .isISO8601()
      .withMessage("Due date must be a valid ISO 8601 date string"),
    body("priority")
      .optional()
      .isString()
      .withMessage("Priority must be a string")
      .isIn(AvailableSubtaskPriorities)
      .withMessage("Invalid subtask priority"),
    body("isCompleted")
      .optional()
      .isBoolean()
      .withMessage("isCompleted must be a boolean"),
  ];
};

const deleteSubtaskValidator = () => {
  return [
    param("subtaskId")
      .notEmpty()
      .withMessage("Subtask ID is required")
      .isMongoId()
      .withMessage("Invalid Subtask ID format"),
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

const getAllSubtasksByTaskIdValidator = () => {
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
    query("isCompleted")
      .optional()
      .isBoolean()
      .withMessage("isCompleted must be a boolean"),
    query("priority")
      .optional()
      .isString()
      .withMessage("Priority must be a string")
      .isIn(AvailableSubtaskPriorities)
      .withMessage("Invalid subtask priority"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be a positive integer and less than 100"),
  ];
};

const getSubtaskByIdValidator = () => {
  return [
    param("subtaskId")
      .notEmpty()
      .withMessage("Subtask ID is required")
      .isMongoId()
      .withMessage("Invalid Subtask ID format"),
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

const getAllSubtasksByProjectIdValidator = () => {
  return [
    param("projectId")
      .notEmpty()
      .withMessage("Project ID is required")
      .isMongoId()
      .withMessage("Invalid Project ID format"),
    query("isCompleted")
      .optional()
      .isBoolean()
      .withMessage("isCompleted must be a boolean"),
    query("priority")
      .optional()
      .isString()
      .withMessage("Priority must be a string")
      .isIn(AvailableSubtaskPriorities)
      .withMessage("Invalid subtask priority"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be a positive integer and less than 100"),
  ];
};

export {
  createSubtaskValidator,
  updateSubtaskValidator,
  deleteSubtaskValidator,
  getAllSubtasksByTaskIdValidator,
  getSubtaskByIdValidator,
  getAllSubtasksByProjectIdValidator,
};
