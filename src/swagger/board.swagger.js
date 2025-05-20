// Board routes Swagger definitions
export const boardSwagger = {
  "/api/v1/boards/{projectId}/create-board": {
    post: {
      tags: ["Boards"],
      summary: "Create a new board in a project",
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
                name: { type: "string" },
                description: { type: "string" },
              },
              required: ["name"],
            },
          },
        },
      },
      responses: {
        201: { description: "Board created successfully" },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
      },
    },
  },
  "/api/v1/boards/{projectId}/get-boards": {
    get: {
      tags: ["Boards"],
      summary: "Get all boards for a project",
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
        200: { description: "Boards fetched successfully" },
        401: { description: "Unauthorized" },
      },
    },
  },
};
