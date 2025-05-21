// Subtask routes Swagger definitions (DRY, robust, secure)
export const subtaskSwagger = {
  "/api/v1/subtasks/{projectId}/{taskId}/create-subtask": {
    post: {
      tags: ["Subtasks"],
      summary: "Create a subtask for a task",
      security: [{ bearerAuth: [] }],
      "x-access": "Project admin or project member assigned to the task.",
      parameters: [
        {
          in: "path",
          name: "projectId",
          required: true,
          schema: { type: "string" },
        },
        {
          in: "path",
          name: "taskId",
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
              required: ["title"],
              properties: {
                title: { type: "string", minLength: 3, maxLength: 100 },
                description: { type: "string", maxLength: 500 },
                dueDate: { type: "string", format: "date" },
                priority: { type: "string", enum: ["low", "medium", "high"] },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "Subtask created successfully" },
        400: { description: "Validation error or business logic error" },
        401: { description: "Unauthorized" },
        403: {
          description:
            "Forbidden (not a project member, not a project admin, or not assigned to the task)",
        },
        404: { description: "Project or task not found" },
        409: { description: "A subtask with this title already exists" },
      },
    },
  },
  "/api/v1/subtasks/{projectId}/{taskId}/update-subtask/{subtaskId}": {
    patch: {
      tags: ["Subtasks"],
      summary: "Update a subtask by ID",
      security: [{ bearerAuth: [] }],
      "x-access":
        "Project admin or project member who owns or is assigned to the subtask.",
      parameters: [
        {
          in: "path",
          name: "projectId",
          required: true,
          schema: { type: "string" },
        },
        {
          in: "path",
          name: "taskId",
          required: true,
          schema: { type: "string" },
        },
        {
          in: "path",
          name: "subtaskId",
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
                title: { type: "string", minLength: 3, maxLength: 100 },
                description: { type: "string", maxLength: 500 },
                dueDate: { type: "string", format: "date" },
                priority: { type: "string", enum: ["low", "medium", "high"] },
                isCompleted: { type: "boolean" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Subtask updated successfully" },
        400: { description: "Validation error or business logic error" },
        401: { description: "Unauthorized" },
        403: {
          description:
            "Forbidden (not a project member, not a project admin, or not assigned/owner of the subtask)",
        },
        404: { description: "Project, task, or subtask not found" },
      },
    },
  },
  "/api/v1/subtasks/{projectId}/{taskId}/delete-subtask/{subtaskId}": {
    delete: {
      tags: ["Subtasks"],
      summary: "Delete a subtask by ID (soft delete)",
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
          name: "taskId",
          required: true,
          schema: { type: "string" },
        },
        {
          in: "path",
          name: "subtaskId",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Subtask deleted successfully" },
        400: { description: "Validation error or business logic error" },
        401: { description: "Unauthorized" },
        403: {
          description: "Forbidden (not a project admin)",
        },
        404: { description: "Project, task, or subtask not found" },
      },
    },
  },
  "/api/v1/subtasks/{projectId}/{taskId}/get-subtasks": {
    get: {
      tags: ["Subtasks"],
      summary: "Get all subtasks for a task (with filtering, pagination)",
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
          name: "taskId",
          required: true,
          schema: { type: "string" },
        },
        { in: "query", name: "isCompleted", schema: { type: "boolean" } },
        {
          in: "query",
          name: "priority",
          schema: { type: "string", enum: ["low", "medium", "high"] },
        },
        { in: "query", name: "page", schema: { type: "integer", minimum: 1 } },
        {
          in: "query",
          name: "limit",
          schema: { type: "integer", minimum: 1, maximum: 100 },
        },
      ],
      responses: {
        200: { description: "Subtasks fetched successfully" },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden (not a project member)" },
        404: { description: "Project or task not found" },
      },
    },
  },
  "/api/v1/subtasks/{projectId}/{taskId}/get-subtask/{subtaskId}": {
    get: {
      tags: ["Subtasks"],
      summary: "Get a subtask by ID",
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
          name: "taskId",
          required: true,
          schema: { type: "string" },
        },
        {
          in: "path",
          name: "subtaskId",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Subtask fetched successfully" },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden (not a project member)" },
        404: { description: "Project, task, or subtask not found" },
      },
    },
  },
  "/api/v1/subtasks/{projectId}/get-all-subtasks": {
    get: {
      tags: ["Subtasks"],
      summary: "Get all subtasks for a project (with filtering, pagination)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "projectId",
          required: true,
          schema: { type: "string" },
        },
        { in: "query", name: "isCompleted", schema: { type: "boolean" } },
        {
          in: "query",
          name: "priority",
          schema: { type: "string", enum: ["low", "medium", "high"] },
        },
        { in: "query", name: "page", schema: { type: "integer", minimum: 1 } },
        {
          in: "query",
          name: "limit",
          schema: { type: "integer", minimum: 1, maximum: 100 },
        },
      ],
      responses: {
        200: { description: "Subtasks fetched successfully" },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden (not a project member)" },
        404: { description: "Project not found" },
      },
    },
  },
};
