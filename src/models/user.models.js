import mongoose, { Schema } from "mongoose";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { UserRolesEnum } from "../utils/constants.js";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: UserRolesEnum,
      default: UserRolesEnum.MEMBER,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationTokenExpiry: {
      type: Date,
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordTokenExpiry: {
      type: Date,
    },
    avatar: {
      url: {
        type: String,
        default: "https://placehold.co/600x600",
      },
      publicId: {
        type: String,
        default: "",
      },
      localPath: {
        type: String,
        default: "",
      },
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true },
);

// password hashing middleware using bcrypt in pre save hook
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// password comparison method using bcrypt in instance method means in prototype
userSchema.methods.isPasswordMatch = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// method to generate Access Token using JWT
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
  );
};

// method to generate Refresh Token using JWT
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY },
  );
};

// method to generate temporary email verification token using crypto
userSchema.methods.generateTempToken = function () {
  const unhashedToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(unhashedToken)
    .digest("hex");

  const tokenExpiry = Date.now() + 20 * 60 * 1000; // 20 minutes

  return { unhashedToken, hashedToken, tokenExpiry };
};

const User = mongoose.model("User", userSchema);
export default User;
