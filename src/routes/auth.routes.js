import { Router } from "express";
import {
  deleteUser,
  forgotPassword,
  getUserProfile,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendVerificationEmail,
  resetPassword,
  updateUserProfile,
  verifyEmail,
} from "../controllers/auth.controllers.js";
import {
  deleteAccountValidator,
  emailVerificationValidator,
  forgotPasswordValidator,
  resendVerificationEmailValidator,
  resetPasswordValidator,
  userLoginValidator,
  userRegistrationValidator,
  updateUserProfileValidator,
} from "../validators/auth.validators.js";
import { validate } from "../middlewares/validator.middlewares.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { uploadAvatar } from "../middlewares/multer.middlewares.js";
import { emailLimiter } from "../middlewares/rateLimit.middlewares.js";

const router = Router();

router
  .route("/register")
  .post(userRegistrationValidator(), validate, registerUser);

router
  .route("/verify-email/:token")
  .get(emailVerificationValidator(), validate, verifyEmail);

router.route("/login").post(userLoginValidator(), validate, loginUser);

router.route("/logout").post(authMiddleware, logoutUser);

router.route("/profile").get(authMiddleware, getUserProfile);

router
  .route("/forgot-password")
  .post(emailLimiter, forgotPasswordValidator(), validate, forgotPassword);

router
  .route("/reset-password/:token")
  .post(resetPasswordValidator(), validate, resetPassword);

router
  .route("/resend-verification-email")
  .post(
    emailLimiter,
    resendVerificationEmailValidator(),
    validate,
    resendVerificationEmail,
  );

router.route("/refresh-token").post(refreshAccessToken);

router
  .route("/delete-account")
  .delete(authMiddleware, deleteAccountValidator(), validate, deleteUser);

router
  .route("/update-profile")
  .patch(
    authMiddleware,
    uploadAvatar.single("avatar"),
    updateUserProfileValidator(),
    validate,
    updateUserProfile,
  );

export default router;
