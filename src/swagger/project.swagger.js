// Project routes Swagger definitions (DRY, robust, matches validation)
export const projectSwagger = {
  "/api/v1/projects/create-project": {
    post: {
      tags: ["Projects"],
      summary: "Create a new project",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "description"],
              properties: {
                name: { type: "string", minLength: 3, maxLength: 100 },
                description: { type: "string" },
                status: {
                  type: "string",
                  enum: ["active", "archived", "completed"],
                },
                visibility: { type: "string", enum: ["private", "public"] },
                dueDate: { type: "string", format: "date" },
                tags: { type: "array", items: { type: "string" } },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "Project created successfully" },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
        409: { description: "Project with this name already exists" },
      },
    },
  },
  "/api/v1/projects/get-projects": {
    get: {
      tags: ["Projects"],
      summary: "Get all projects for the authenticated user",
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: "Projects retrieved successfully" },
        401: { description: "Unauthorized" },
      },
    },
  },
  "/api/v1/projects/{projectId}": {
    get: {
      tags: ["Projects"],
      summary: "Get project by ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "projectId",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Project details retrieved successfully" },
        401: { description: "Unauthorized" },
        404: { description: "Project not found" },
      },
    },
    patch: {
      tags: ["Projects"],
      summary: "Update project by ID",
      security: [{ bearerAuth: [] }],
      "x-roles": ["PROJECT_ADMIN"],
      parameters: [
        {
          in: "path",
          name: "projectId",
          required: true,
          schema: { type: "string" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string", minLength: 3, maxLength: 100 },
                description: { type: "string" },
                status: {
                  type: "string",
                  enum: ["active", "archived", "completed"],
                },
                visibility: { type: "string", enum: ["private", "public"] },
                dueDate: { type: "string", format: "date" },
                tags: { type: "array", items: { type: "string" } },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Project updated successfully" },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
        404: { description: "Project not found" },
      },
    },
    delete: {
      tags: ["Projects"],
      summary: "Delete project by ID",
      security: [{ bearerAuth: [] }],
      "x-roles": ["PROJECT_ADMIN"],
      parameters: [
        {
          in: "path",
          name: "projectId",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Project deleted successfully" },
        401: { description: "Unauthorized" },
        404: { description: "Project not found" },
      },
    },
  },
  "/api/v1/projects/{projectId}/members": {
    get: {
      tags: ["Projects"],
      summary: "Get all members of a project",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "projectId",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Project members retrieved successfully" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden (not a project member)" },
        404: { description: "Project not found" },
      },
    },
    post: {
      tags: ["Projects"],
      summary: "Add a member to a project",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "projectId",
          required: true,
          schema: { type: "string" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["userId"],
              properties: {
                userId: { type: "string" },
                role: {
                  type: "string",
                  enum: ["PROJECT_ADMIN", "MEMBER", "VIEWER"],
                },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "Member added to project successfully" },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden (not a project admin)" },
        404: { description: "Project or user not found" },
        409: { description: "User already a member" },
      },
      "x-roles": ["PROJECT_ADMIN"],
    },
    patch: {
      tags: ["Projects"],
      summary: "Bulk update project members' roles",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "projectId",
          required: true,
          schema: { type: "string" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["members"],
              properties: {
                members: {
                  type: "array",
                  minItems: 1,
                  items: {
                    type: "object",
                    required: ["memberId", "role"],
                    properties: {
                      memberId: { type: "string" },
                      role: {
                        type: "string",
                        enum: ["PROJECT_ADMIN", "MEMBER", "VIEWER"],
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Project members updated successfully" },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden (not a project admin)" },
        404: { description: "Project or member not found" },
      },
      "x-roles": ["PROJECT_ADMIN"],
    },
  },
  "/api/v1/projects/{projectId}/members/{memberId}/role": {
    patch: {
      tags: ["Projects"],
      summary: "Update a project member's role",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "projectId",
          required: true,
          schema: { type: "string" },
        },
        {
          in: "path",
          name: "memberId",
          required: true,
          schema: { type: "string" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["role"],
              properties: {
                role: {
                  type: "string",
                  enum: ["PROJECT_ADMIN", "MEMBER", "VIEWER"],
                },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Member role updated successfully" },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden (not a project admin)" },
        404: { description: "Project or member not found" },
      },
      "x-roles": ["PROJECT_ADMIN"],
    },
  },
  "/api/v1/projects/{projectId}/members/{memberId}": {
    delete: {
      tags: ["Projects"],
      summary: "Remove a member from a project",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "projectId",
          required: true,
          schema: { type: "string" },
        },
        {
          in: "path",
          name: "memberId",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Member removed from project successfully" },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden (not a project admin)" },
        404: { description: "Project or member not found" },
      },
      "x-roles": ["PROJECT_ADMIN"],
    },
  },
  "/api/v1/projects/{projectId}/status": {
    get: {
      tags: ["Projects"],
      summary: "Get project status by ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "projectId",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Project status retrieved successfully" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden (not a project member)" },
        404: { description: "Project not found" },
      },
    },
  },
};
