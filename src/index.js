import app from "./app.js";
import dotenv from "dotenv";
import { validateEnv } from "./utils/validateEnv.js";
import logger from "./utils/logger.js";

import dbConnect from "./db/index.js";

dotenv.config({
  path: "./.env",
});

// Validate required environment variables before starting the app
validateEnv();

const PORT = process.env.PORT || 8080;

dbConnect()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    logger.error("Failed to connect to the database:", error);
    process.exit(1); // Exit the process with failure
  });
