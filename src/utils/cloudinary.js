import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadOptions = {
  folder: "task-manager",
  transformation: [
    { width: 1200, height: 675, crop: "fill", quality: "auto" },
    { fetch_format: "auto" },
  ],
  allowed_formats: ["jpg", "png", "jpeg", "webp"],
  format: "webp", // Convert all images to WebP
};

export default cloudinary;
