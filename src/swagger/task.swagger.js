// Task routes Swagger definitions (DRY, robust, secure)
export const taskSwagger = {
  "/api/v1/tasks/{projectId}/create-task": {
    post: {
      tags: ["Tasks"],
      summary: "Create a new task in a project",
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
              required: ["title", "description"],
              properties: {
                title: { type: "string", minLength: 3, maxLength: 100 },
                description: { type: "string" },
                status: {
                  type: "string",
                  enum: ["todo", "in_progress", "done"],
                },
                priority: {
                  type: "string",
                  enum: ["low", "medium", "high"],
                },
                assignedTo: {
                  type: "array",
                  items: { type: "string" },
                },
                dueDate: { type: "string", format: "date" },
                attachments: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      url: { type: "string" },
                      mimetype: { type: "string" },
                      size: { type: "number" },
                      originalname: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "Task created successfully" },
        400: { description: "Validation error or business logic error" },
        401: { description: "Unauthorized" },
        403: {
          description: "Forbidden (not a project member or insufficient role)",
        },
        404: { description: "Project or user not found" },
      },
    },
  },
  "/api/v1/tasks/{projectId}/get-tasks": {
    get: {
      tags: ["Tasks"],
      summary:
        "Get all tasks for a project (with filtering, sorting, pagination)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "projectId",
          required: true,
          schema: { type: "string" },
        },
        {
          in: "query",
          name: "status",
          schema: { type: "string", enum: ["todo", "in_progress", "done"] },
        },
        {
          in: "query",
          name: "priority",
          schema: { type: "string", enum: ["low", "medium", "high"] },
        },
        { in: "query", name: "assignedTo", schema: { type: "string" } },
        { in: "query", name: "exactAssignedTo", schema: { type: "boolean" } },
        { in: "query", name: "createdBy", schema: { type: "string" } },
        { in: "query", name: "needsReview", schema: { type: "boolean" } },
        { in: "query", name: "page", schema: { type: "integer", minimum: 1 } },
        {
          in: "query",
          name: "limit",
          schema: { type: "integer", minimum: 1, maximum: 100 },
        },
        { in: "query", name: "sortBy", schema: { type: "string" } },
      ],
      responses: {
        200: { description: "Tasks fetched successfully" },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden (not a project member)" },
        404: { description: "Project not found" },
      },
    },
  },
  "/api/v1/tasks/{projectId}/get-task/{taskId}": {
    get: {
      tags: ["Tasks"],
      summary: "Get a task by ID",
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
      ],
      responses: {
        200: { description: "Task fetched successfully" },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden (not a project member)" },
        404: { description: "Project or task not found" },
      },
    },
  },
  "/api/v1/tasks/{projectId}/assign-task/{taskId}": {
    patch: {
      tags: ["Tasks"],
      summary: "Assign users to a task",
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
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                assignedTo: {
                  type: "array",
                  items: { type: "string" },
                },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Task assignment updated successfully" },
        400: { description: "Validation error or business logic error" },
        401: { description: "Unauthorized" },
        403: {
          description: "Forbidden (not a project member or insufficient role)",
        },
        404: { description: "Project, task, or user not found" },
      },
    },
  },
  "/api/v1/tasks/{boardId}/get-board-tasks": {
    get: {
      tags: ["Tasks"],
      summary:
        "Get all tasks for a board (with filtering, sorting, pagination)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "boardId",
          required: true,
          schema: { type: "string" },
        },
        {
          in: "query",
          name: "status",
          schema: { type: "string", enum: ["todo", "in_progress", "done"] },
        },
        {
          in: "query",
          name: "priority",
          schema: { type: "string", enum: ["low", "medium", "high"] },
        },
        { in: "query", name: "assignedTo", schema: { type: "string" } },
        { in: "query", name: "exactAssignedTo", schema: { type: "boolean" } },
        { in: "query", name: "createdBy", schema: { type: "string" } },
        { in: "query", name: "needsReview", schema: { type: "boolean" } },
        { in: "query", name: "page", schema: { type: "integer", minimum: 1 } },
        {
          in: "query",
          name: "limit",
          schema: { type: "integer", minimum: 1, maximum: 100 },
        },
        { in: "query", name: "sortBy", schema: { type: "string" } },
      ],
      responses: {
        200: { description: "Board tasks fetched successfully" },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden (not a board/project member)" },
        404: { description: "Board not found" },
      },
    },
  },
  "/api/v1/tasks/{projectId}/update-task/{taskId}": {
    patch: {
      tags: ["Tasks"],
      summary: "Update a task by ID",
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
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                title: { type: "string", minLength: 3, maxLength: 100 },
                description: { type: "string" },
                status: {
                  type: "string",
                  enum: ["todo", "in_progress", "done"],
                },
                priority: {
                  type: "string",
                  enum: ["low", "medium", "high"],
                },
                assignedTo: {
                  type: "array",
                  items: { type: "string" },
                },
                dueDate: { type: "string", format: "date" },
                attachments: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      url: { type: "string" },
                      mimetype: { type: "string" },
                      size: { type: "number" },
                      originalname: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Task updated successfully" },
        400: { description: "Validation error or business logic error" },
        401: { description: "Unauthorized" },
        403: {
          description: "Forbidden (not a project member or insufficient role)",
        },
        404: { description: "Project or task not found" },
      },
    },
  },
  "/api/v1/tasks/{projectId}/delete-task/{taskId}": {
    delete: {
      tags: ["Tasks"],
      summary: "Delete a task by ID",
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
      ],
      responses: {
        200: { description: "Task deleted successfully" },
        400: { description: "Validation error or business logic error" },
        401: { description: "Unauthorized" },
        403: {
          description: "Forbidden (not a project member or insufficient role)",
        },
        404: { description: "Project or task not found" },
      },
    },
  },
};
