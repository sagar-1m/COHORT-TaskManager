import { body, param } from "express-validator";
import {
  AvailableProjectStatuses,
  AvailableProjectVisibilities,
  AvailableUserRoles,
} from "../utils/constants.js";

const createProjectValidator = () => {
  return [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Project name is required")
      .isLength({ min: 3 })
      .withMessage("Project name must be at least 3 characters long")
      .isLength({ max: 100 })
      .withMessage("Project name must be at most 100 characters long"),

    body("description")
      .trim()
      .notEmpty()
      .withMessage("Project description is required"),

    body("status")
      .optional()
      .isIn(AvailableProjectStatuses)
      .withMessage("Invalid project status"),

    body("visibility")
      .optional()
      .isIn(AvailableProjectVisibilities)
      .withMessage("Invalid project visibility"),

    body("dueDate")
      .optional()
      .isISO8601()
      .withMessage("Due date must be a valid date")
      .toDate(),

    body("tags")
      .optional()
      .isArray()
      .withMessage("Tags must be an array of strings")
      .custom((value) => {
        for (const tag of value) {
          if (typeof tag !== "string") {
            throw new Error("Each tag must be a string");
          }
        }
        return true;
      }),
  ];
};

const projectIdValidator = () => {
  return [
    param("projectId")
      .notEmpty()
      .withMessage("Project ID is required")
      .isMongoId()
      .withMessage("Invalid Project ID format"),
  ];
};

const addMemberValidator = () => {
  return [
    param("projectId")
      .notEmpty()
      .withMessage("Project ID is required")
      .isMongoId()
      .withMessage("Invalid Project ID format"),

    body("userId")
      .notEmpty()
      .withMessage("User ID is required")
      .isMongoId()
      .withMessage("Invalid User ID format"),

    body("role")
      .optional()
      .isIn(AvailableUserRoles)
      .withMessage("Invalid user role"),
  ];
};

const updateMemberRoleValidator = () => {
  return [
    param("projectId")
      .notEmpty()
      .withMessage("Project ID is required")
      .isMongoId()
      .withMessage("Invalid Project ID format"),

    param("memberId")
      .notEmpty()
      .withMessage("Member ID is required")
      .isMongoId()
      .withMessage("Invalid Member ID format"),

    body("role")
      .notEmpty()
      .withMessage("Role is required")
      .isIn(AvailableUserRoles)
      .withMessage("Invalid user role"),
  ];
};

const getProjectByIdValidator = () => {
  return [
    param("projectId")
      .notEmpty()
      .withMessage("Project ID is required")
      .isMongoId()
      .withMessage("Invalid Project ID format"),
  ];
};

const deleteProjectValidator = () => {
  return [
    param("projectId")
      .notEmpty()
      .withMessage("Project ID is required")
      .isMongoId()
      .withMessage("Invalid Project ID format"),
  ];
};

const removeMemberValidator = () => {
  return [
    param("projectId")
      .notEmpty()
      .withMessage("Project ID is required")
      .isMongoId()
      .withMessage("Invalid Project ID format"),

    param("memberId")
      .notEmpty()
      .withMessage("Member ID is required")
      .isMongoId()
      .withMessage("Invalid Member ID format"),
  ];
};

export {
  createProjectValidator,
  projectIdValidator,
  addMemberValidator,
  updateMemberRoleValidator,
  getProjectByIdValidator,
  deleteProjectValidator,
  removeMemberValidator,
};
