// Note routes Swagger definitions (DRY, robust, secure)
export const noteSwagger = {
  "/api/v1/notes/{projectId}/create-note": {
    post: {
      tags: ["Notes"],
      summary: "Create a note for a project or task",
      security: [{ bearerAuth: [] }],
      "x-access": "Any project member",
      parameters: [
        {
          in: "path",
          name: "projectId",
          required: true,
          schema: { type: "string" },
        },
        {
          in: "query",
          name: "taskId",
          schema: { type: "string" },
          description:
            "Optional. If provided, creates a note for a specific task.",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["content"],
              properties: {
                content: { type: "string", minLength: 3, maxLength: 1000 },
                visibility: { type: "string", enum: ["private", "public"] },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "Note created successfully" },
        400: { description: "Validation error or business logic error" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden (not a project member)" },
        404: { description: "Project or task not found" },
      },
    },
  },
  "/api/v1/notes/{projectId}/get-notes": {
    get: {
      tags: ["Notes"],
      summary: "Get notes for a project or task (with filtering, pagination)",
      security: [{ bearerAuth: [] }],
      "x-access": "Any project member (private notes: only creator or admin)",
      parameters: [
        {
          in: "path",
          name: "projectId",
          required: true,
          schema: { type: "string" },
        },
        {
          in: "query",
          name: "taskId",
          schema: { type: "string" },
          description: "Optional. Filter notes for a specific task.",
        },
        {
          in: "query",
          name: "visibility",
          schema: { type: "string", enum: ["private", "public"] },
        },
        { in: "query", name: "page", schema: { type: "integer", minimum: 1 } },
        { in: "query", name: "limit", schema: { type: "integer", minimum: 1 } },
      ],
      responses: {
        200: { description: "Notes fetched successfully" },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden (not a project member)" },
        404: { description: "Project or task not found" },
      },
    },
  },
  "/api/v1/notes/{projectId}/get-note/{noteId}": {
    get: {
      tags: ["Notes"],
      summary: "Get a note by ID",
      security: [{ bearerAuth: [] }],
      "x-access": "Any project member (private notes: only creator or admin)",
      parameters: [
        {
          in: "path",
          name: "projectId",
          required: true,
          schema: { type: "string" },
        },
        {
          in: "path",
          name: "noteId",
          required: true,
          schema: { type: "string" },
        },
        {
          in: "query",
          name: "taskId",
          schema: { type: "string" },
          description:
            "Optional. If provided, validates note belongs to this task.",
        },
      ],
      responses: {
        200: { description: "Note fetched successfully" },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
        403: {
          description:
            "Forbidden (not a project member or not allowed to view private note)",
        },
        404: { description: "Project, task, or note not found" },
      },
    },
  },
  "/api/v1/notes/{projectId}/update-note/{noteId}": {
    patch: {
      tags: ["Notes"],
      summary: "Update a note by ID",
      security: [{ bearerAuth: [] }],
      "x-access": "Project admin or note creator",
      parameters: [
        {
          in: "path",
          name: "projectId",
          required: true,
          schema: { type: "string" },
        },
        {
          in: "path",
          name: "noteId",
          required: true,
          schema: { type: "string" },
        },
        {
          in: "query",
          name: "taskId",
          schema: { type: "string" },
          description:
            "Optional. If provided, validates note belongs to this task.",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                content: { type: "string", minLength: 3, maxLength: 1000 },
                visibility: { type: "string", enum: ["private", "public"] },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Note updated successfully" },
        400: { description: "Validation error or business logic error" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden (not a project admin or note creator)" },
        404: { description: "Project, task, or note not found" },
      },
    },
  },
  "/api/v1/notes/{projectId}/delete-note/{noteId}": {
    delete: {
      tags: ["Notes"],
      summary: "Delete a note by ID (soft delete)",
      security: [{ bearerAuth: [] }],
      "x-access": "Project admin or note creator",
      parameters: [
        {
          in: "path",
          name: "projectId",
          required: true,
          schema: { type: "string" },
        },
        {
          in: "path",
          name: "noteId",
          required: true,
          schema: { type: "string" },
        },
        {
          in: "query",
          name: "taskId",
          schema: { type: "string" },
          description:
            "Optional. If provided, validates note belongs to this task.",
        },
      ],
      responses: {
        200: { description: "Note deleted successfully" },
        400: { description: "Validation error or business logic error" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden (not a project admin or note creator)" },
        404: { description: "Project, task, or note not found" },
      },
    },
  },
  "/api/v1/notes/{projectId}/note-analytics": {
    get: {
      tags: ["Notes"],
      summary: "Get analytics for notes in a project or task",
      security: [{ bearerAuth: [] }],
      "x-access": "Any project member (private notes: only creator or admin)",
      parameters: [
        {
          in: "path",
          name: "projectId",
          required: true,
          schema: { type: "string" },
        },
        {
          in: "query",
          name: "taskId",
          schema: { type: "string" },
        },
        {
          in: "query",
          name: "visibility",
          schema: { type: "string", enum: ["private", "public"] },
        },
      ],
      responses: {
        200: { description: "Note analytics fetched successfully" },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden (not a project member)" },
        404: { description: "Project or task not found" },
      },
    },
  },
  "/api/v1/notes/{projectId}/search-notes": {
    get: {
      tags: ["Notes"],
      summary: "Search notes in a project or task",
      security: [{ bearerAuth: [] }],
      "x-access": "Any project member (private notes: only creator or admin)",
      parameters: [
        {
          in: "path",
          name: "projectId",
          required: true,
          schema: { type: "string" },
        },
        {
          in: "query",
          name: "taskId",
          schema: { type: "string" },
        },
        { in: "query", name: "query", schema: { type: "string" } },
        {
          in: "query",
          name: "visibility",
          schema: { type: "string", enum: ["private", "public"] },
        },
        { in: "query", name: "createdBy", schema: { type: "string" } },
        { in: "query", name: "page", schema: { type: "integer", minimum: 1 } },
        {
          in: "query",
          name: "limit",
          schema: { type: "integer", minimum: 1, maximum: 100 },
        },
      ],
      responses: {
        200: { description: "Notes search results fetched successfully" },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden (not a project member)" },
        404: { description: "Project or task not found" },
      },
    },
  },
};
