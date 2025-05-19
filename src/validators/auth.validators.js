import { body, param } from "express-validator";

const userRegistrationValidator = () => {
  return [
    body("email")
      .isEmail()
      .withMessage("Invalid email format")
      .notEmpty()
      .withMessage("Email is required")
      .trim(),
    body("username")
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long")
      .trim()
      .isLength({ max: 30 })
      .withMessage("Username must be at most 30 characters long"),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/\d/)
      .withMessage("Password must contain at least one number")
      .matches(/[a-zA-Z]/)
      .withMessage("Password must contain at least one letter")
      .trim(),
  ];
};

const userLoginValidator = () => {
  return [
    body("email")
      .isEmail()
      .withMessage("Invalid email format")
      .notEmpty()
      .withMessage("Email is required")
      .trim(),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/\d/)
      .withMessage("Password must contain at least one number")
      .matches(/[a-zA-Z]/)
      .withMessage("Password must contain at least one letter")
      .trim(),
  ];
};

const emailVerificationValidator = () => {
  return [
    param("token")
      .notEmpty()
      .withMessage("Verification token is required")
      .isLength({ min: 32 })
      .withMessage("Invalid verification token"),
  ];
};

const updateUserProfileValidator = () => {
  return [
    body("username")
      .optional()
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long")
      .trim()
      .isLength({ max: 30 })
      .withMessage("Username must be at most 30 characters long"),
  ];
};

const forgotPasswordValidator = () => {
  return [
    body("email")
      .isEmail()
      .withMessage("Invalid email format")
      .notEmpty()
      .withMessage("Email is required")
      .trim(),
  ];
};

const resetPasswordValidator = () => {
  return [
    param("token")
      .notEmpty()
      .withMessage("Reset token is required")
      .isLength({ min: 32 })
      .withMessage("Invalid reset token"),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/\d/)
      .withMessage("Password must contain at least one number")
      .matches(/[a-zA-Z]/)
      .withMessage("Password must contain at least one letter")
      .trim(),
    body("confirmPassword")
      .notEmpty()
      .withMessage("Confirm password is required")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords do not match");
        }
        return true;
      }),
  ];
};

const resendVerificationEmailValidator = () => {
  return [
    body("email")
      .isEmail()
      .withMessage("Invalid email format")
      .notEmpty()
      .withMessage("Email is required")
      .trim(),
  ];
};

const deleteAccountValidator = () => {
  return [
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/\d/)
      .withMessage("Password must contain at least one number")
      .matches(/[a-zA-Z]/)
      .withMessage("Password must contain at least one letter")
      .trim(),
  ];
};

export {
  userRegistrationValidator,
  userLoginValidator,
  emailVerificationValidator,
  updateUserProfileValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  resendVerificationEmailValidator,
  deleteAccountValidator,
};
