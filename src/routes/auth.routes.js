import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  VerifyEmail,
} from "../controllers/auth.controllers.js";
import {
  emailVerificationValidator,
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

export default router;
