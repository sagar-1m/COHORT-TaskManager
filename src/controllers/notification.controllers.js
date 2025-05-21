// Notification controller for in-app/email notifications
import Notification from "../models/notification.models.js";
import { notify } from "../utils/notification.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

// Create a notification (admin/dev use, or for testing)
export const createNotification = async (req, res, next) => {
  try {
    const { userId, type, message, link, sendEmail, email } = req.body;
    if (!userId || !type || !message) {
      throw new ApiError(400, "userId, type, and message are required");
    }
    const notification = await notify({
      userId,
      type,
      message,
      link,
      sendEmail,
      email,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, notification, "Notification created"));
  } catch (err) {
    next(err);
  }
};

// Get notifications for the logged-in user
export const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });
    return res.json(new ApiResponse(200, notifications));
  } catch (err) {
    next(err);
  }
};

// Mark a notification as read
export const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { read: true },
      { new: true },
    );
    if (!notification) throw new ApiError(404, "Notification not found");
    return res.json(new ApiResponse(200, notification, "Marked as read"));
  } catch (err) {
    next(err);
  }
};

// Delete a notification
export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });
    if (!notification) throw new ApiError(404, "Notification not found");
    return res.json(new ApiResponse(200, notification, "Deleted"));
  } catch (err) {
    next(err);
  }
};
