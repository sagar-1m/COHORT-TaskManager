import mongoose, { Schema } from "mongoose";
import {
  AvailableNoteVisibilities,
  NoteVisibilityEnum,
} from "../utils/constants.js";

const projectNoteSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    visibility: {
      type: String,
      enum: AvailableNoteVisibilities,
      default: NoteVisibilityEnum.PRIVATE,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

projectNoteSchema.index({
  projectId: 1,
});
projectNoteSchema.index({
  taskId: 1,
});

const ProjectNote = mongoose.model("ProjectNote", projectNoteSchema);
export default ProjectNote;
