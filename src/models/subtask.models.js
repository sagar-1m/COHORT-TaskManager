import mongoose, { Schema } from "mongoose";
import {
  AvailableSubtaskPriorities,
  SubtaskPriorityEnum,
} from "../utils/constants.js";

const subtaskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
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
    description: {
      type: String,
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dueDate: {
      type: Date,
    },
    priority: {
      type: String,
      enum: AvailableSubtaskPriorities,
      default: SubtaskPriorityEnum.MEDIUM,
    },
  },
  { timestamps: true },
);

subtaskSchema.index(
  {
    title: 1,
    taskId: 1,
  },
  { unique: true },
);
subtaskSchema.index(
  {
    title: 1,
    projectId: 1,
  },
  { unique: true },
);

const Subtask = mongoose.model("Subtask", subtaskSchema);
export default Subtask;
