import { body, param } from "express-validator";
import { AvailableBoardNames } from "../utils/constants.js";

const createBoardValidator = () => {
  return [
    param("projectId")
      .notEmpty()
      .withMessage("Project ID is required")
      .isMongoId()
      .withMessage("Invalid Project ID format"),
    body("name")
      .notEmpty()
      .withMessage("Board name is required")
      .isString()
      .withMessage("Board name must be a string")
      .trim()

      .isIn(AvailableBoardNames)
      .withMessage("Invalid board name"),
    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string")
      .trim()
      .isLength({ min: 3, max: 500 })
      .withMessage("Description must be between 3 and 500 characters"),
  ];
};

const getAllBoardsValidator = () => {
  return [
    param("projectId")
      .notEmpty()
      .withMessage("Project ID is required")
      .isMongoId()
      .withMessage("Invalid Project ID format"),
  ];
};

const getBoardByIdValidator = () => {
  return [
    param("boardId")
      .notEmpty()
      .withMessage("Board ID is required")
      .isMongoId()
      .withMessage("Invalid Board ID format"),
    param("projectId")
      .notEmpty()
      .withMessage("Project ID is required")
      .isMongoId()
      .withMessage("Invalid Project ID format"),
  ];
};

const deleteBoardValidator = () => {
  return [
    param("boardId")
      .notEmpty()
      .withMessage("Board ID is required")
      .isMongoId()
      .withMessage("Invalid Board ID format"),
    param("projectId")
      .notEmpty()
      .withMessage("Project ID is required")
      .isMongoId()
      .withMessage("Invalid Project ID format"),
  ];
};

export {
  createBoardValidator,
  getAllBoardsValidator,
  getBoardByIdValidator,
  deleteBoardValidator,
};
