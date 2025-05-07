import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { validate } from "../middlewares/validator.middlewares.js";
import { createBoardValidator } from "../validators/board.validators.js";
import { createBoard } from "../controllers/board.controllers.js";

const router = Router();

router.use(authMiddleware);

router
  .route("/:projectId/create-board")
  .post(createBoardValidator(), validate, createBoard);

export default router;
