// Board routes Swagger definitions (DRY, robust, secure)
export const boardSwagger = {
  "/api/v1/boards/{projectId}/create-board": {
    post: {
      tags: ["Boards"],
      summary: "Create a new board in a project",
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
              required: ["name"],
              properties: {
                name: {
                  type: "string",
                  enum: ["To Do", "In Progress", "Done"],
                },
                description: { type: "string", minLength: 3, maxLength: 500 },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "Board created successfully" },
        400: { description: "Validation error or invalid board name" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden (not a project admin)" },
        404: { description: "Project not found" },
        409: { description: "A board with this name already exists" },
      },
    },
  },
  "/api/v1/boards/{projectId}/get-boards": {
    get: {
      tags: ["Boards"],
      summary: "Get all boards for a project (with tasks)",
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
        200: { description: "Boards with tasks fetched successfully" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden (not a project member)" },
        404: { description: "Project not found" },
      },
    },
  },
  "/api/v1/boards/{projectId}/get-board/{boardId}": {
    get: {
      tags: ["Boards"],
      summary: "Get a board by ID (with tasks)",
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
          name: "boardId",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Board and tasks fetched successfully" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden (not a project member)" },
        404: { description: "Project or board not found" },
      },
    },
  },
  "/api/v1/boards/{projectId}/delete-board/{boardId}": {
    delete: {
      tags: ["Boards"],
      summary: "Delete a board by ID (soft delete)",
      security: [{ bearerAuth: [] }],
      "x-roles": ["PROJECT_ADMIN"],
      parameters: [
        {
          in: "path",
          name: "projectId",
          required: true,
          schema: { type: "string" },
        },
        {
          in: "path",
          name: "boardId",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Board deleted successfully" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden (not a project admin)" },
        404: { description: "Project or board not found" },
      },
    },
  },
};
