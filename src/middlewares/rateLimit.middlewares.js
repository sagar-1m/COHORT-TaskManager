import rateLimit from "express-rate-limit";

// General API rate limiter: 100 requests per 15 minutes per IP
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Too many requests, please try again later.",
    success: false,
  },
});

// Stricter limiter for auth endpoints: 10 requests per 15 minutes per IP
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Too many authentication attempts, please try again later.",
    success: false,
  },
});

// Stricter rate limiter for email endpoints (e.g., password reset): 3 requests per hour per IP
export const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 requests per windowMs
  message: {
    status: 429,
    message:
      "Too many email requests from this IP, please try again after an hour.",
    success: false,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
