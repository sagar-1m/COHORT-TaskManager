// Auth routes Swagger definitions (DRY, robust, matches validation)
export const authSwagger = {
  "/api/v1/auth/register": {
    post: {
      tags: ["Auth"],
      summary: "Register a new user",
      security: [], // Public endpoint
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["username", "email", "password"],
              properties: {
                username: { type: "string", minLength: 3, maxLength: 30 },
                email: { type: "string", format: "email" },
                password: { type: "string", minLength: 8 },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "User registered successfully" },
        400: { description: "Validation error" },
        409: { description: "Email or username already exists" },
      },
    },
  },
  "/api/v1/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Login a user",
      security: [], // Public endpoint
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: { type: "string", format: "email" },
                password: { type: "string", minLength: 8 },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Login successful" },
        400: { description: "Validation error" },
        401: { description: "Invalid credentials or unverified email" },
      },
    },
  },
  "/api/v1/auth/logout": {
    post: {
      tags: ["Auth"],
      summary: "Logout the current user",
      security: [{ bearerAuth: [] }], // Protected endpoint
      responses: {
        200: { description: "Logout successful" },
        401: { description: "Unauthorized" },
      },
    },
  },
  "/api/v1/auth/profile": {
    get: {
      tags: ["Auth"],
      summary: "Get the current user's profile",
      security: [{ bearerAuth: [] }], // Protected endpoint
      responses: {
        200: {
          description: "User profile data",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  user: {
                    type: "object",
                    properties: {
                      _id: { type: "string" },
                      username: { type: "string" },
                      email: { type: "string" },
                      avatar: {
                        type: "object",
                        properties: {
                          url: { type: "string" },
                          publicId: { type: "string" },
                        },
                      },
                      role: { type: "string" },
                      isEmailVerified: { type: "boolean" },
                      createdAt: { type: "string", format: "date-time" },
                      updatedAt: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
      },
    },
  },
  "/api/v1/auth/forgot-password": {
    post: {
      tags: ["Auth"],
      summary: "Request a password reset email",
      security: [], // Public endpoint
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email"],
              properties: {
                email: { type: "string", format: "email" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Password reset email sent" },
        400: { description: "Validation error" },
        429: { description: "Too many requests" },
      },
    },
  },
  "/api/v1/auth/reset-password/{token}": {
    post: {
      tags: ["Auth"],
      summary: "Reset user password",
      security: [], // Public endpoint
      parameters: [
        {
          in: "path",
          name: "token",
          required: true,
          schema: { type: "string", minLength: 32 },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["password", "confirmPassword"],
              properties: {
                password: { type: "string", minLength: 8 },
                confirmPassword: { type: "string", minLength: 8 },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Password reset successful" },
        400: { description: "Invalid or expired token" },
      },
    },
  },
  "/api/v1/auth/resend-verification-email": {
    post: {
      tags: ["Auth"],
      summary: "Resend email verification link",
      security: [], // Public endpoint
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email"],
              properties: {
                email: { type: "string", format: "email" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Verification email resent" },
        429: { description: "Too many requests" },
      },
    },
  },
  "/api/v1/auth/refresh-token": {
    post: {
      tags: ["Auth"],
      summary: "Refresh access token",
      security: [], // Public endpoint (no auth required to refresh)
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["refreshToken"],
              properties: {
                refreshToken: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "New access token" },
        400: { description: "Invalid refresh token" },
      },
    },
  },
  "/api/v1/auth/delete-account": {
    delete: {
      tags: ["Auth"],
      summary: "Delete the current user's account",
      security: [{ bearerAuth: [] }], // Protected endpoint
      description:
        "Deletes the authenticated user's account. Password must be provided as a query parameter or header for extra security.",
      responses: {
        200: { description: "Account deleted" },
        401: { description: "Unauthorized" },
      },
    },
  },
  "/api/v1/auth/update-profile": {
    patch: {
      tags: ["Auth"],
      summary: "Update the current user's profile",
      security: [{ bearerAuth: [] }], // Protected endpoint
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                username: { type: "string", minLength: 3, maxLength: 30 },
                avatar: { type: "string", format: "binary" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Profile updated" },
        401: { description: "Unauthorized" },
      },
    },
  },
  "/api/v1/auth/verify-email/{token}": {
    get: {
      tags: ["Auth"],
      summary: "Verify user email",
      security: [], // Public endpoint
      parameters: [
        {
          in: "path",
          name: "token",
          required: true,
          schema: { type: "string", minLength: 32 },
        },
      ],
      responses: {
        200: { description: "Email verified successfully" },
        400: { description: "Invalid or expired token" },
      },
    },
  },
};
