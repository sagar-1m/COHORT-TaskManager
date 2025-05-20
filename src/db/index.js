import mongoose from "mongoose";
import logger from "../utils/logger.js";

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000, // fail fast if not available
    });
    logger.info("MongoDB connected successfully ✅");
  } catch (error) {
    logger.error("MongoDB connection failed ❌", error);
    process.exit(1);
  }
};

export default dbConnect;
