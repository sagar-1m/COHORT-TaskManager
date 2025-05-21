// Utility for creating and sending notifications (in-app and email)
// Notification feature temporarily disabled. Implementation will be restored after frontend work.

// import Notification from "../models/notification.models.js";
// import { sendMail, projectInviteMailGenContent } from "./mail.js";

/**
 * Create an in-app notification and optionally send an email.
 * @param {Object} options
 * @param {string|ObjectId} options.userId - User to notify
 * @param {string} options.type - Notification type (e.g., 'task_assigned')
 * @param {string} options.message - Notification message
 * @param {string} [options.link] - Optional link for notification
 * @param {boolean} [options.sendEmail] - Whether to send email
 * @param {string} [options.email] - Email address (required if sendEmail)
 * @param {string} [options.subject] - Email subject (optional)
 * @returns {Promise<Notification>} The created notification
 */
// export async function notify({
//   userId,
//   type,
//   message,
//   link = "",
//   sendEmail = false,
//   email,
//   subject,
// }) {
//   // Create in-app notification
//   const notification = await Notification.create({
//     userId,
//     type,
//     message,
//     link,
//   });

//   // Optionally send email
//   if (sendEmail && email) {
//     // If mailGenContent is provided, use it (for transactional emails)
//     if (arguments[0].mailGenContent) {
//       await sendMail({
//         email,
//         subject: subject || "You have a new notification",
//         mailGenContent: arguments[0].mailGenContent,
//       });
//     } else {
//       await sendMail({
//         email,
//         subject: subject || "You have a new notification",
//         mailGenContent: {
//           body: {
//             name: email,
//             intro: message,
//             action: link
//               ? {
//                   instructions: "View the notification:",
//                   button: {
//                     color: "#22BC66",
//                     text: "View",
//                     link,
//                   },
//                 }
//               : undefined,
//             outro: "If you have questions, contact support.",
//           },
//         },
//       });
//     }
//   }

//   return notification;
// }

// // Optionally, add helpers for common notification types
// export async function notifyTaskAssigned({
//   userId,
//   message,
//   link,
//   sendEmail,
//   email,
// }) {
//   // Only send email, do not create in-app notification
//   if (sendEmail && email) {
//     await sendMail({
//       email,
//       subject: "Task Assigned",
//       mailGenContent: {
//         body: {
//           name: email,
//           intro: message,
//           action: link
//             ? {
//                 instructions: "View the task:",
//                 button: {
//                   color: "#22BC66",
//                   text: "View Task",
//                   link,
//                 },
//               }
//             : undefined,
//           outro: "If you have questions, contact your project admin.",
//         },
//       },
//     });
//   }
// }

// export async function notifyProjectInvite({
//   userId,
//   message,
//   link,
//   sendEmail,
//   email,
// }) {
//   // Fetch user for name if sending email
//   let username = undefined;
//   if (sendEmail && email) {
//     // Try to get username from DB if not provided (optional, fallback to email)
//     try {
//       const User = (await import("../models/user.models.js")).default;
//       const user = await User.findOne({ _id: userId });
//       username = user?.username || email;
//     } catch (e) {
//       username = email;
//     }
//   }
//   // Send notification and email
//   await notify({
//     userId,
//     type: "project_invite",
//     message,
//     link,
//     sendEmail,
//     email,
//     subject: "Project Invitation",
//     ...(sendEmail && email && username
//       ? {
//           mailGenContent: projectInviteMailGenContent(
//             username,
//             message.replace(/^You have been added to the project: /, ""),
//             link,
//           ),
//         }
//       : {}),
//   });
// }
