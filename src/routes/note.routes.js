import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { validate } from "../middlewares/validator.middlewares.js";
import { createNoteValidator } from "../validators/note.validators.js";
import { createNote } from "../controllers/note.controllers.js";

const router = Router();

router.use(authMiddleware);

router
  .route("/:projectId/:taskId?/create-note")
  .post(createNoteValidator(), validate, createNote);

export default router;
