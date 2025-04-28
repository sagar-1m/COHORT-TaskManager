import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";

const authMiddleware = asyncHandler(async (req, res, next) => {
  try {
    // Get the token from the request headers or cookies
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized access");
    }

    // Verify the token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decodedToken) {
      throw new ApiError(401, "Unauthorized access");
    }

    // Find the user associated with the token
    const user = await User.findById(decodedToken?.id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry ",
    );

    if (!user) {
      throw new ApiError(401, "Unauthorized access");
    }

    // Set user in request object
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(401, "Token expired. Please log in again.");
    }

    // Handle all other JWT errors (malformed, invalid signature, etc.)
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(401, "Invalid authentication token");
    }

    // Handle all other errors
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Authentication failed",
    );
  }
});

export { authMiddleware };
