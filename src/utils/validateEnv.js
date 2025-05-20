// Utility to validate required environment variables at startup

const requiredEnvVars = [
  "PORT",
  "MONGODB_URI",
  "ACCESS_TOKEN_SECRET",
  "ACCESS_TOKEN_EXPIRY",
  "REFRESH_TOKEN_SECRET",
  "REFRESH_TOKEN_EXPIRY",
  "MAILTRAP_SMTP_HOST",
  "MAILTRAP_SMTP_USER",
  "MAILTRAP_SMTP_PASS",
  "MAIL_FROM",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

export function validateEnv() {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(
      `\n[ENV VALIDATION ERROR] Missing required environment variables: ${missing.join(", ")}`,
    );
    process.exit(1);
  }
}
