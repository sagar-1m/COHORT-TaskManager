import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

const healthCheck = asyncHandler(async (req, res) => {
  res.status(200).json(
    new ApiResponse(200, "Server is running", {
      uptime: process.uptime(),
      timestamp: Date.now(),
    }),
  );
});

export { healthCheck };
