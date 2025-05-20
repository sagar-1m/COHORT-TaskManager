// Subtask routes Swagger definitions
export const subtaskSwagger = {
  "/api/v1/subtasks/{projectId}/{taskId}/create-subtask": {
    post: {
      tags: ["Subtasks"],
      summary: "Create a subtask for a task",
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
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                dueDate: { type: "string", format: "date" },
                priority: { type: "string" },
              },
              required: ["title"],
            },
          },
        },
      },
      responses: {
        201: { description: "Subtask created successfully" },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
      },
    },
  },
  "/api/v1/subtasks/{projectId}/{taskId}/get-subtasks": {
    get: {
      tags: ["Subtasks"],
      summary: "Get all subtasks for a task",
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
        200: { description: "Subtasks fetched successfully" },
        401: { description: "Unauthorized" },
      },
    },
  },
};
