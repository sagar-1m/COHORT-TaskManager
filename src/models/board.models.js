import mongoose, { Schema } from "mongoose";
import {
  AvailableBoardNames,
  AvailableTaskStatuses,
} from "../utils/constants.js";

const boardSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      enum: AvailableBoardNames,
      trim: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: AvailableTaskStatuses,
      required: true,
      default: AvailableTaskStatuses.TODO,
    },
    tasks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

boardSchema.index({ projectId: 1, name: 1 }, { unique: true });

const Board = mongoose.model("Board", boardSchema);

export default Board;
