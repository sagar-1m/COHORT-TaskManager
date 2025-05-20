import mongoose from "mongoose";
import { ApiError } from "../utils/api-error.js";

function withTimeout(promise, ms) {
  // Helper to add a timeout to a promise
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("MongoDB ping timeout")), ms),
    ),
  ]);
}

export const healthCheck = async (req, res, next) => {
  try {
    let dbStatus = "down";
    let dbError = null;
    // Check if mongoose thinks it's connected
    if (mongoose.connection.readyState === 1) {
      try {
        // Try a real ping with a 2s timeout
        await withTimeout(mongoose.connection.db.admin().ping(), 2000);
        dbStatus = "ok";
      } catch (err) {
        dbError = err.message;
      }
    } else {
      dbError = "Mongoose not connected";
    }
    const response = {
      server: "ok",
      database: dbStatus,
    };
    if (dbError) response.dbError = dbError;
    // If DB is down, set status 503 (Service Unavailable)
    if (dbStatus !== "ok") {
      return next(new ApiError(503, "Database connection is down", [response]));
    }
    return res.status(200).json(response);
  } catch (err) {
    return next(new ApiError(500, "Healthcheck failed", [err.message]));
  }
};
