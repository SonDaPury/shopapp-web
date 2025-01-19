import dotenv from "dotenv";
dotenv.config();

export const envConfig = {
  port: process.env.PORT || 3000,
  logLevel: process.env.LOG_LEVEL || "info",
  nodeEnv: process.env.NODE_ENV || "development",
};
