import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";

const authMiddleware = asyncHandler(async (req, res, next) => {
  try {
    // Get token from request headers or cookies
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized access");
    }

    try {
      // try to verify the access token
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      // Find user associated with the token
      const user = await User.findById(decodedToken?.id).select(
        "-password -emailVerificationToken -emailVerificationTokenExpiry",
      );

      if (!user) {
        throw new ApiError(401, "Unauthorized access");
      }

      // Set user in request object
      req.user = user;
      next();
    } catch (error) {
      // If access token is expired, try to use refresh token
      if (error instanceof jwt.TokenExpiredError) {
        // Get refresh token
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
          throw new ApiError(401, "Unauthorized access. Login again");
        }

        try {
          // Verify refresh token
          const decodedRefreshToken = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
          );

          // Find user associated with the refresh token
          const user = await User.findById(decodedRefreshToken.id).select(
            "-password -emailVerificationToken -emailVerificationTokenExpiry",
          );

          if (!user || user.refreshToken !== refreshToken) {
            throw new ApiError(401, "Unauthorized access. Login again");
          }

          // Generate new tokens
          const newAccessToken = user.generateAccessToken();
          const newRefreshToken = user.generateRefreshToken();

          // Update refresh token in database
          user.refreshToken = newRefreshToken;
          await user.save({ validateBeforeSave: false });

          // Set cookies with new tokens
          const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: "strict",
          };

          res.cookie("accessToken", newAccessToken, {
            ...cookieOptions,
            maxAge: 24 * 60 * 60 * 1000, // 1 day
          });

          res.cookie("refreshToken", newRefreshToken, {
            ...cookieOptions,
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
          });

          // Set user in request object
          req.user = user;
          next();
        } catch (refreshError) {
          throw new ApiError(401, "Unauthorized access. Login again");
        }
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new ApiError(401, "Unauthorized access. Login again");
      } else {
        throw new ApiError(401, "Unauthorized access. Login again");
      }
    }
  } catch (error) {
    // CLear cookies on auth failure
    if (error.statusCode === 401) {
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
      };
      res.cookie("accessToken", "", {
        ...cookieOptions,
        expires: new Date(0),
      });

      res.cookie("refreshToken", "", {
        ...cookieOptions,
        expires: new Date(0),
      });
    }
    next(error);
  }
});

export { authMiddleware };
