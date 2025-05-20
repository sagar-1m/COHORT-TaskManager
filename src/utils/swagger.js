import swaggerJsdoc from "swagger-jsdoc";
import { customSwaggerPaths } from "../swagger/index.js";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Mega Project Management API",
    version: "1.0.0",
    description: "API documentation for the Mega Project Management backend.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

const options = {
  swaggerDefinition,
  apis: ["./src/routes/*.js", "./src/controllers/*.js", "./src/models/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

// Merge custom paths for all endpoints
swaggerSpec.paths = {
  ...(swaggerSpec.paths || {}),
  ...customSwaggerPaths,
};

export default swaggerSpec;
