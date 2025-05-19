import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary, { uploadOptions } from "../utils/cloudinary.js";

// Cloudinary storage for avatar uploads
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: uploadOptions,
});

const fileFilterAvatar = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Please upload an image file"), false);
  }
};

// Middleware for avatar uploads to Cloudinary
export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5 MB
  },
  fileFilter: fileFilterAvatar,
});
