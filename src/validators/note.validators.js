import { body, param } from "express-validator";
import { AvailableNoteVisibilities } from "../utils/constants.js";

const createNoteValidator = () => {
  return [
    param("projectId")
      .notEmpty()
      .withMessage("Project ID is required")
      .isMongoId()
      .withMessage("Invalid Project ID format"),
    param("taskId")
      .optional()
      .isMongoId()
      .withMessage("Invalid Task ID format"),
    body("content")
      .notEmpty()
      .withMessage("Note content is required")
      .isString()
      .withMessage("Note content must be a string")
      .trim()
      .isLength({ min: 3, max: 1000 })
      .withMessage("Note content must be between 1 and 1000 characters"),
    body("visibility")
      .optional()
      .isString()
      .withMessage("Visibility must be a string")
      .isIn(AvailableNoteVisibilities)
      .withMessage("Invalid note visibility"),
  ];
};

export { createNoteValidator };
