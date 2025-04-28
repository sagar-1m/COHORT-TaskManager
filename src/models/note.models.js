import mongoose, { Schema } from "mongoose";

const projectNoteSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
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
  },
  { timestamps: true },
);

const ProjectNote = mongoose.model("ProjectNote", projectNoteSchema);
export default ProjectNote;
