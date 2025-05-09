import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { validate } from "../middlewares/validator.middlewares.js";
import {
  createNoteValidator,
  deleteNoteValidator,
  getNoteByIdValidator,
  getNotesValidator,
  updateNoteValidator,
} from "../validators/note.validators.js";
import {
  createNote,
  deleteNote,
  getNoteById,
  getNotes,
  updateNote,
} from "../controllers/note.controllers.js";

const router = Router();

router.use(authMiddleware);

router
  .route("/:projectId/:taskId?/create-note")
  .post(createNoteValidator(), validate, createNote);

router
  .route("/:projectId/:taskId?/get-notes")
  .get(getNotesValidator(), validate, getNotes);

router
  .route("/:projectId/:taskId?/get-note/:noteId")
  .get(getNoteByIdValidator(), validate, getNoteById);

router
  .route("/:projectId/:taskId?/update-note/:noteId")
  .patch(updateNoteValidator(), validate, updateNote);

router
  .route("/:projectId/:taskId?/delete-note/:noteId")
  .delete(deleteNoteValidator(), validate, deleteNote);

export default router;
