import winston from "winston";
import path from "path";

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format with colors for development
const devFormat = combine(
  colorize(),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  }),
);

// JSON log format for production
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  winston.format.json(),
);

const transports = [
  new winston.transports.Console({
    format: process.env.NODE_ENV === "production" ? prodFormat : devFormat,
  }),
];

// In production, also log to a file (logs/app.log)
if (process.env.NODE_ENV === "production") {
  transports.push(
    new winston.transports.File({
      filename: path.join("logs", "app.log"),
      format: prodFormat,
      maxsize: 1048576, // 1MB
      maxFiles: 5,
    }),
  );
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transports,
});

export default logger;
