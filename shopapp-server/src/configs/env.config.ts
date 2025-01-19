import dotenv from "dotenv";
dotenv.config();

export const envConfig = {
  port: process.env.PORT || 3000,
  logLevel: process.env.LOG_LEVEL || "info",
  nodeEnv: process.env.NODE_ENV || "development",
  db: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    username: process.env.DB_USER || "",
    password: process.env.DB_PASSWORD || "",
    dbName: process.env.DB_NAME || "",
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || "",
    refreshSecret: process.env.REFRESH_SECRET || "",
    jwtExpire: process.env.ACCESS_EXPIRES_IN || "",
    refreshExpire: process.env.REFRESH_EXPIRES_IN || "",
    googleClientId: process.env.GOOGLE_CLIENT_ID || "",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  },
  email: {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "false",
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
  },
};
