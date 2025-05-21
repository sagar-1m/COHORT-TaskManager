import express from "express";
import {
  createNotification,
  getMyNotifications,
  markNotificationRead,
  deleteNotification,
} from "../controllers/notification.controllers.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";

const router = express.Router();

// All notification routes require authentication
router.use(authMiddleware);

// Get all notifications for the logged-in user
router.get("/", getMyNotifications);

// Create a notification (for admin/dev/testing)
router.post("/", createNotification);

// Mark a notification as read
router.patch("/:id/read", markNotificationRead);

// Delete a notification
router.delete("/:id", deleteNotification);

export default router;
