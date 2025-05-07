import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { validate } from "../middlewares/validator.middlewares.js";
import {
  createBoardValidator,
  getAllBoardsValidator,
} from "../validators/board.validators.js";
import { createBoard, getAllBoards } from "../controllers/board.controllers.js";

const router = Router();

router.use(authMiddleware);

router
  .route("/:projectId/create-board")
  .post(createBoardValidator(), validate, createBoard);

router
  .route("/:projectId/get-boards")
  .get(getAllBoardsValidator(), validate, getAllBoards);

export default router;
