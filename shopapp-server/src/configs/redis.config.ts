import { createClient } from "redis";
import { configs } from "./configs";
import { log } from "./logger.config";

const redisClient = createClient({
  url: "redis://localhost:6379",
});

redisClient.on("error", (err) => {
  configs.logger.error("Error connecting to Redis:", err);
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    log.info("Redis connection established");
  } catch (error) {
    log.error("Redis connection failed:", error);
    process.exit(1);
  }
};

export default redisClient;
