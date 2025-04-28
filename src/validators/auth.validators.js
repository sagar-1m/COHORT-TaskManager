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

export {
  userRegistrationValidator,
  userLoginValidator,
  emailVerificationValidator,
};
