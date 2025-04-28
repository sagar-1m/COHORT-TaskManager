import app from "./app.js";
import dotenv from "dotenv";

import dbConnect from "./db/index.js";

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 8080;

dbConnect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
    process.exit(1); // Exit the process with failure
  });
