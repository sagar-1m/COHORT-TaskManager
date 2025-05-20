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
  // ...other endpoints like members, status, etc. can be added similarly
};
