import mongoose, { Schema } from "mongoose";
import {
  AvailableTaskStatuses,
  ProjectPriorityEnum,
  TaskStatusEnum,
} from "../utils/constants.js";

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: AvailableTaskStatuses,
      default: TaskStatusEnum.TODO,
      required: true,
    },
    priority: {
      type: String,
      enum: Object.values(ProjectPriorityEnum),
      default: ProjectPriorityEnum.MEDIUM,
    },
    assignedTo: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dueDate: {
      type: Date,
    },

    attachments: {
      type: [
        {
          url: String,
          mimetype: String,
          size: Number,
          originalname: String,
        },
      ],
      default: [],
    },
    needsReview: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Task = mongoose.model("Task", taskSchema);
export default Task;
