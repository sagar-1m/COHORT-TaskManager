// Note routes Swagger definitions
export const noteSwagger = {
  "/api/v1/notes/{projectId}/{taskId}/create-note": {
    post: {
      tags: ["Notes"],
      summary: "Create a note for a project or task",
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
          required: false,
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
                content: { type: "string" },
                visibility: { type: "string" },
              },
              required: ["content"],
            },
          },
        },
      },
      responses: {
        201: { description: "Note created successfully" },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
      },
    },
  },
  "/api/v1/notes/{projectId}/{taskId}/get-notes": {
    get: {
      tags: ["Notes"],
      summary: "Get notes for a project or task",
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
          required: false,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Notes fetched successfully" },
        401: { description: "Unauthorized" },
      },
    },
  },
};
