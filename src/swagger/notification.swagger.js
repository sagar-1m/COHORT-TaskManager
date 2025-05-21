// OpenAPI docs for notification endpoints
export default {
  "/notifications": {
    get: {
      tags: ["Notifications"],
      summary: "Get all notifications for the logged-in user",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "List of notifications",
          content: {
            "application/json": {
              schema: { type: "object" }, // Simplified, update with full schema if needed
            },
          },
        },
      },
    },
    post: {
      tags: ["Notifications"],
      summary: "Create a notification (admin/dev/testing)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                userId: { type: "string" },
                type: { type: "string" },
                message: { type: "string" },
                link: { type: "string" },
                sendEmail: { type: "boolean" },
                email: { type: "string" },
              },
              required: ["userId", "type", "message"],
            },
          },
        },
      },
      responses: {
        201: {
          description: "Notification created",
        },
      },
    },
  },
  "/notifications/{id}/read": {
    patch: {
      tags: ["Notifications"],
      summary: "Mark a notification as read",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Marked as read" },
        404: { description: "Notification not found" },
      },
    },
  },
  "/notifications/{id}": {
    delete: {
      tags: ["Notifications"],
      summary: "Delete a notification",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Deleted" },
        404: { description: "Notification not found" },
      },
    },
  },
};
