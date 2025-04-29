import mongoose, { Schema } from "mongoose";
import {
  ProjectStatusEnum,
  ProjectPriorityEnum,
  ProjectVisibilityEnum,
} from "../utils/constants.js";

const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ProjectStatusEnum),
      default: ProjectStatusEnum.ACTIVE,
    },
    priority: {
      type: String,
      enum: Object.values(ProjectPriorityEnum),
      default: ProjectPriorityEnum.MEDIUM,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
    },
    visibility: {
      type: String,
      enum: Object.values(ProjectVisibilityEnum),
      default: ProjectVisibilityEnum.PRIVATE,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

projectSchema.index(
  {
    name: 1,
    createdBy: 1,
  },
  { unique: true },
);

const Project = mongoose.model("Project", projectSchema);
export default Project;
