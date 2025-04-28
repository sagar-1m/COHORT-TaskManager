import { Router } from "express";
import {
  forgotPassword,
  getUserProfile,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  VerifyEmail,
} from "../controllers/auth.controllers.js";
import {
  emailVerificationValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  userLoginValidator,
  userRegistrationValidator,
} from "../validators/auth.validators.js";
import { validate } from "../middlewares/validator.middlewares.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";

const router = Router();

router
  .route("/register")
  .post(userRegistrationValidator(), validate, registerUser);

router
  .route("/verify-email/:token")
  .get(emailVerificationValidator(), validate, VerifyEmail);

router.route("/login").post(userLoginValidator(), validate, loginUser);

router.route("/logout").post(authMiddleware, logoutUser);

router.route("/profile").get(authMiddleware, getUserProfile);

router
  .route("/forgot-password")
  .post(forgotPasswordValidator(), validate, forgotPassword);

router
  .route("/reset-password/:token")
  .post(resetPasswordValidator(), validate, resetPassword);

export default router;
