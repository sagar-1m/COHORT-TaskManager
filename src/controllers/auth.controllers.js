import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import User from "../models/user.models.js";
import Project from "../models/project.models.js";
import ProjectMember from "../models/projectMember.models.js";
import ProjectNote from "../models/note.models.js";
import Task from "../models/task.models.js";
import SubTask from "../models/subTask.models.js";
import { UserRolesEnum } from "../utils/constants.js";
import {
  sendMail,
  emailVerificationMailGenContent,
  passwordResetMailGenContent,
} from "../utils/mail.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import cloudinary from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  // 1. Get user data from request body
  const { username, email, password, role } = req.body;

  // 2. Validation is already handled by express-validator middleware

  try {
    // 3. Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: email.toLowerCase() },
      ],
    });

    if (existingUser) {
      throw new ApiError(
        409,
        existingUser.email === email.toLowerCase()
          ? "Email already exists"
          : "Username already exists",
      );
    }

    // 4. Creating new user with MEMBER role by default
    const user = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      role: UserRolesEnum.MEMBER,
    });

    // 5. Generate email verification token
    const { unhashedToken, hashedToken, tokenExpiry } =
      user.generateTempToken();

    // 6. Save verification token to user document
    user.emailVerificationToken = hashedToken;
    user.emailVerificationTokenExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    // 7. Create verification URL
    const verificationUrl = `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unhashedToken}`;

    // 8. Send verification email
    try {
      await sendMail({
        email: user.email,
        subject: "Verify your email - Task Manager",
        mailGenContent: emailVerificationMailGenContent(
          user.username,
          verificationUrl,
        ),
      });
    } catch (error) {
      // If email sending fails, remove the token and save the user document
      user.emailVerificationToken = undefined;
      user.emailVerificationTokenExpiry = undefined;
      await user.save({ validateBeforeSave: false });

      throw new ApiError(500, "Failed to send verification email");
    }

    // 9. Send success response
    const createdUser = user.toObject();
    delete createdUser.password;
    delete createdUser.emailVerificationToken;
    delete createdUser.emailVerificationTokenExpiry;
    delete createdUser.refreshToken;

    return res.status(201).json(
      new ApiResponse(
        201,
        "User registered successfully. Please verify your email.",
        {
          user: createdUser,
        },
      ),
    );
  } catch (error) {
    if (error instanceof ApiError) throw error;

    throw new ApiError(
      error.statusCode || 500,
      error.message || "Something went wrong while registering user",
    );
  }
});

const loginUser = asyncHandler(async (req, res) => {
  // 1. Get credentials from request body
  const { email, password } = req.body;

  try {
    // 2. Find user by email
    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    // 3. Check if user exists and password is correct
    if (!user || !(await user.isPasswordMatch(password))) {
      throw new ApiError(401, "Invalid email or password");
    }

    // 4. Check if user is verified
    if (!user.isEmailVerified) {
      throw new ApiError(403, "Please verify your email before logging in");
    }

    // 5. Generate access and refresh tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // 6. Update refresh token in DB
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // 7. Prepare user object for response by removing sensitive data
    const loggedInUser = user.toObject();
    delete loggedInUser.password;
    delete loggedInUser.emailVerificationToken;
    delete loggedInUser.emailVerificationTokenExpiry;
    delete loggedInUser.refreshToken;
    delete loggedInUser.forgotPasswordToken;
    delete loggedInUser.forgotPasswordTokenExpiry;

    // 8. Set cookies options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development" ? false : true,
    };

    // 9. Send response with cookies and tokens
    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        new ApiResponse(200, "User logged in successfully", {
          user: loggedInUser,
          accessToken,
        }),
      );
  } catch (error) {
    if (error instanceof ApiError) throw error;

    throw new ApiError(
      error.statusCode || 500,
      error.message || "Something went wrong while logging in",
    );
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  // 1. Get user ID from request
  const userId = req.user?._id;

  // 2. Check if user ID is valid
  if (!userId) {
    throw new ApiError(401, "Unauthorized access");
  }

  // 3. Update user document to remove refresh token
  await User.findByIdAndUpdate(
    userId,
    {
      $unset: { refreshToken: 1 },
    },
    { new: true },
  );

  // 4. Set cookie options
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development" ? false : true,
  };

  // 5. Send response with cleared cookies
  return res
    .status(200)
    .cookie("accessToken", "", { ...cookieOptions, expires: new Date(0) })
    .cookie("refreshToken", "", { ...cookieOptions, expires: new Date(0) })
    .json(new ApiResponse(200, "User logged out successfully"));
});

const verifyEmail = asyncHandler(async (req, res) => {
  // 1. Get verification token from request params
  const { token } = req.params;

  // 2. Hash token to match format stored in DB
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // 3. Find user with hashed token and check if token is not expired
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationTokenExpiry: { $gt: Date.now() },
  });

  // 4. If user not found, throw error
  if (!user) {
    throw new ApiError(400, "Invalid or expired verification token");
  }

  // 5. Update user verification status and clear token fields
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpiry = undefined;

  await user.save({ validateBeforeSave: false });

  // 6. Send success response
  return res
    .status(200)
    .json(new ApiResponse(200, "Email verified successfully"));
});

const getUserProfile = asyncHandler(async (req, res) => {
  // 1. Get user ID from request
  const userId = req.user?._id;

  // 2. Check if userId is valid
  if (!userId) {
    throw new ApiError(401, "Unauthorized access");
  }

  try {
    // 3. Find user by ID and exclude sensitive fields
    const user = await User.findById(userId).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry",
    );

    // 4. If user not found, throw error
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // 5. Send success response with user data
    return res.status(200).json(
      new ApiResponse(200, "User profile fetched successfully", {
        user,
      }),
    );
  } catch (error) {
    if (error instanceof ApiError) throw error;

    throw new ApiError(
      error.statusCode || 500,
      error.message || "Something went wrong while fetching user profile",
    );
  }
});

const updateUserProfile = asyncHandler(async (req, res) => {
  // 1. Get user ID from request
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized access");
  }

  // 2. Get username and avatar file from request
  const { username } = req.body;
  const avatarFile = req.file;

  try {
    // 3. Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    let usernameChanged = false;
    // 4. Handle username update if provided
    if (username && username !== user.username) {
      // Check uniqueness
      const existingUser = await User.findOne({
        username: username.toLowerCase(),
      });
      if (existingUser && existingUser._id.toString() !== userId.toString()) {
        throw new ApiError(409, "Username already exists");
      }
      user.username = username.toLowerCase();
      usernameChanged = true;
    }

    // 5. Handle avatar update if file provided
    if (avatarFile) {
      // Delete previous avatar from Cloudinary if it exists
      if (user.avatar?.publicId) {
        try {
          await cloudinary.uploader.destroy(user.avatar.publicId);
        } catch (error) {
          throw new ApiError(500, "Failed to delete previous avatar");
        }
      }
      // Save new avatar info from Multer/CloudinaryStorage
      user.avatar = {
        url: avatarFile.path,
        publicId: avatarFile.filename,
        localPath: "",
      };
    }

    await user.save({ validateBeforeSave: false });

    // 6. Prepare clean user object for response
    const updatedUser = await User.findById(userId).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry",
    );
    if (!updatedUser) {
      throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
      new ApiResponse(200, "Profile updated successfully", {
        user: {
          _id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          avatar: updatedUser.avatar,
          role: updatedUser.role,
          isEmailVerified: updatedUser.isEmailVerified,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        },
      }),
    );
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Something went wrong while updating profile",
    );
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  // 1. Get email from request body
  const { email } = req.body;

  // 2. Validate email format
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  try {
    // 3. Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    // 4. If user not found, still send success response to avoid email enumeration attack
    if (!user) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "If the email is registered, you will receive a password reset link shortly",
          ),
        );
    }

    // 5. Generate password reset token
    const { unhashedToken, hashedToken, tokenExpiry } =
      user.generateTempToken();

    // 6. Save token and expiry to user document
    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordTokenExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    // 7. Create password reset URL
    const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/auth/reset-password/${unhashedToken}`;

    // 8. Send password reset email
    try {
      await sendMail({
        email: user.email,
        subject: "Reset your password - Task Manager",
        mailGenContent: passwordResetMailGenContent(user.username, resetUrl),
      });

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "Password reset email sent successfully. Please check your inbox.",
          ),
        );
    } catch (error) {
      // If email sending fails, remove the token and save the user document
      user.forgotPasswordToken = undefined;
      user.forgotPasswordTokenExpiry = undefined;
      await user.save({ validateBeforeSave: false });

      throw new ApiError(500, "Failed to send password reset email");
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;

    throw new ApiError(
      error.statusCode || 500,
      error.message ||
        "Something went wrong while sending password reset email",
    );
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  // 1. Get token from params and new password from request body
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  try {
    // 3. Hash the token for comparison with DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // 4. Find user with the valid token that hasn't expired
    const user = await User.findOne({
      forgotPasswordToken: hashedToken,
      forgotPasswordTokenExpiry: { $gt: Date.now() },
    });

    // 5. If user not found, throw error
    if (!user) {
      throw new ApiError(400, "Invalid or expired token");
    }

    // 6. Update password and clear token fields
    user.password = password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpiry = undefined;
    user.refreshToken = undefined; // invalidate all active sessions

    await user.save({ validateBeforeSave: false });

    // 7. Expire cookies immediately after password reset
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development" ? false : true,
    };

    return res
      .status(200)
      .cookie("accessToken", "", { ...cookieOptions, expires: new Date(0) })
      .cookie("refreshToken", "", { ...cookieOptions, expires: new Date(0) })
      .json(
        new ApiResponse(
          200,
          "Password reset successfully. Please log in again.",
        ),
      );
  } catch (error) {
    if (error instanceof ApiError) throw error;

    throw new ApiError(
      error.statusCode || 500,
      error.message || "Something went wrong while resetting password",
    );
  }
});

const resendVerificationEmail = asyncHandler(async (req, res) => {
  // 1. Get email from request body
  const { email } = req.body;

  // 2. Validate email format
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  try {
    // 3. Find user by email
    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    // 4. If user not found or already verified, throw error
    if (!user || user.isEmailVerified) {
      throw new ApiError(400, "User not found or already verified");
    }

    // 5. Generate new email verification token
    const { unhashedToken, hashedToken, tokenExpiry } =
      user.generateTempToken();

    // 6. Save token and expiry to user document
    user.emailVerificationToken = hashedToken;
    user.emailVerificationTokenExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    // 7. Create verification URL
    const verificationUrl = `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unhashedToken}`;

    // 8. Send verification email
    try {
      await sendMail({
        email: user.email,
        subject: "Verify your email - Task Manager",
        mailGenContent: emailVerificationMailGenContent(
          user.username,
          verificationUrl,
        ),
      });

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "Verification email resent successfully. Please check your inbox.",
          ),
        );
    } catch (error) {
      // If email sending fails, remove the token and save the user document
      user.emailVerificationToken = undefined;
      user.emailVerificationTokenExpiry = undefined;
      await user.save({ validateBeforeSave: false });

      throw new ApiError(500, "Failed to send verification email");
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;

    throw new ApiError(
      error.statusCode || 500,
      error.message ||
        "Something went wrong while resending verification email",
    );
  }
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // 1. Get refresh token from cookies
  const incomingRefreshToken =
    req.cookies?.refreshToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  // 2. Check if refresh token is present
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized access.");
  }

  try {
    // 3. Verify the refresh token
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    // 4. Find user associated with the refresh token
    const user = await User.findById(decodedToken?.id);

    // 5. check if user exists
    if (!user) {
      throw new ApiError(401, "Unauthorized access. Login again.");
    }

    // 6. Check if refresh token in DB matches the incoming token
    if (user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized access. Login again.");
    }

    // 7. Generate new access and refresh tokens
    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    // 8. Update refresh token in DB
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    // 9. Set cookies options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development" ? false : true,
      sameSite: "strict",
    };

    // 10. Send response with new tokens in cookies
    return res
      .status(200)
      .cookie("accessToken", newAccessToken, {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      })
      .cookie("refreshToken", newRefreshToken, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      })
      .json(
        new ApiResponse(200, "Access token refreshed successfully", {
          accessToken: newAccessToken,
        }),
      );
  } catch (error) {
    // 11. Clear cookies on error
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development" ? false : true,
      sameSite: "strict",
    };

    if (error instanceof jwt.TokenExpiredError) {
      return res
        .status(401)
        .cookie("accessToken", "", { ...cookieOptions, expires: new Date(0) })
        .cookie("refreshToken", "", { ...cookieOptions, expires: new Date(0) })
        .json(new ApiResponse(401, "Refresh token expired. Login again."));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res
        .status(401)
        .cookie("accessToken", "", { ...cookieOptions, expires: new Date(0) })
        .cookie("refreshToken", "", { ...cookieOptions, expires: new Date(0) })
        .json(new ApiResponse(401, "Unauthorized access. Login again."));
    }

    if (error instanceof ApiError) throw error;

    throw new ApiError(
      error.statusCode || 500,
      error.message || "Something went wrong while refreshing access token",
    );
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  // 1. Get user ID from request
  const userId = req.user?._id;

  // 2. Check if userId is valid
  if (!userId) {
    throw new ApiError(401, "Unauthorized access");
  }

  // 3. Get password from request body for extra security check
  const { password } = req.body;

  if (!password) {
    throw new ApiError(400, "Password is required to delete account");
  }

  try {
    // 4. Find the user by ID
    const user = await User.findById(userId).select("+password");

    // 5. If user not found, throw error
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // 6. Check if password is correct
    const isPasswordMatch = await user.isPasswordMatch(password);
    if (!isPasswordMatch) {
      throw new ApiError(401, "Incorrect password");
    }

    // 7. Delete user's projects, tasks, and related data
    // First, find all projects associated with the user
    const projects = await Project.find({
      createdBy: userId,
      deleted: false,
    });

    // Delete project member for each project
    for (const project of projects) {
      await ProjectMember.deleteMany({
        projectId: project._id,
      });

      // Delete tasks associated with the project
      const tasks = await Task.find({
        projectId: project._id,
        deleted: false,
      });
      for (const task of tasks) {
        await SubTask.deleteMany({
          taskId: task._id,
          deleted: false,
        });
      }

      // Delete all tasks
      await Task.deleteMany(
        {
          projectId: project._id,
        },
        {
          $set: { deleted: true },
        },
      );

      // Delete project notes
      await ProjectNote.deleteMany(
        {
          projectId: project._id,
        },
        {
          $set: { deleted: true },
        },
      );
    }

    // Delete all projects
    await Project.deleteMany(
      {
        createdBy: userId,
      },
      {
        $set: { deleted: true },
      },
    );

    // remove user from all project memberships
    await ProjectMember.deleteMany({
      userId,
    });

    // Remove user from task assignments
    await Task.updateMany(
      { assignedTo: userId },
      { $pull: { assignedTo: userId } },
    );

    // Finally, delete the user account
    // Delete avatar from Cloudinary if present
    if (user.avatar && user.avatar.publicId) {
      try {
        await cloudinary.uploader.destroy(user.avatar.publicId);
      } catch (err) {
        // Log error but do not block deletion
        console.error("Failed to delete avatar from Cloudinary:", err);
      }
    }
    await User.findByIdAndDelete(userId);

    // 8. Clear cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development" ? false : true,
    };

    // 9. Send response with cleared cookies
    return res
      .status(200)
      .cookie("accessToken", "", { ...cookieOptions, expires: new Date(0) })
      .cookie("refreshToken", "", { ...cookieOptions, expires: new Date(0) })
      .json(new ApiResponse(200, "User account deleted successfully"));
  } catch (error) {
    if (error instanceof ApiError) throw error;

    throw new ApiError(
      error.statusCode || 500,
      error.message || "Something went wrong while deleting user account",
    );
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  verifyEmail,
  forgotPassword,
  resetPassword,
  resendVerificationEmail,
  refreshAccessToken,
  deleteUser,
};
