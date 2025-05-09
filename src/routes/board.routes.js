import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { validate } from "../middlewares/validator.middlewares.js";
import {
  createBoardValidator,
  getAllBoardsValidator,
  getBoardByIdValidator,
} from "../validators/board.validators.js";
import {
  createBoard,
  getAllBoards,
  getBoardById,
} from "../controllers/board.controllers.js";

const router = Router();

router.use(authMiddleware);

router
  .route("/:projectId/create-board")
  .post(createBoardValidator(), validate, createBoard);

router
  .route("/:projectId/get-boards")
  .get(getAllBoardsValidator(), validate, getAllBoards);

router
  .route("/:projectId/get-board/:boardId")
  .get(getBoardByIdValidator(), validate, getBoardById);

export default router;
