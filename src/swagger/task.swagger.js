// Task routes Swagger definitions
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
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                status: { type: "string" },
                priority: { type: "string" },
                assignedTo: { type: "array", items: { type: "string" } },
                dueDate: { type: "string", format: "date" },
                attachments: { type: "array", items: { type: "object" } },
              },
              required: ["title", "description"],
            },
          },
        },
      },
      responses: {
        201: { description: "Task created successfully" },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
      },
    },
  },
  "/api/v1/tasks/{projectId}/get-tasks": {
    get: {
      tags: ["Tasks"],
      summary: "Get all tasks for a project",
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
        200: { description: "Tasks fetched successfully" },
        401: { description: "Unauthorized" },
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
        401: { description: "Unauthorized" },
        404: { description: "Task not found" },
      },
    },
  },
};
