export const healthcheckSwagger = {
  "/api/v1/healthcheck": {
    get: {
      tags: ["Healthcheck"],
      summary: "Check server and database health",
      description:
        "Returns the status of the server and MongoDB connection. Returns 200 if both are healthy, 503 if the database is down.",
      security: [], // Public endpoint, no authentication required
      "x-public": true,
      responses: {
        200: {
          description: "Server and database are healthy",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  server: { type: "string", example: "ok" },
                  database: { type: "string", example: "ok" },
                  dbError: { type: "string", nullable: true },
                },
              },
            },
          },
        },
        503: {
          description: "Database connection is down",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "integer", example: 503 },
                  message: {
                    type: "string",
                    example: "Database connection is down",
                  },
                  errors: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        server: { type: "string" },
                        database: { type: "string" },
                        dbError: { type: "string" },
                      },
                    },
                  },
                  success: { type: "boolean", example: false },
                },
              },
            },
          },
        },
        500: {
          description: "Healthcheck failed (unexpected error)",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "integer", example: 500 },
                  message: { type: "string", example: "Healthcheck failed" },
                  errors: { type: "array", items: { type: "string" } },
                  success: { type: "boolean", example: false },
                },
              },
            },
          },
        },
      },
    },
  },
};
