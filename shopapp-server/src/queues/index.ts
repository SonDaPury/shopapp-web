import { log } from "../configs/logger.config";
import { initEmailQueue } from "./email.queue";
import { initOtpCleanupQueue } from "./otp.queue";

export const initQueues = async () => {
  log.info("Initializing queues...");

  await initEmailQueue();
  await initOtpCleanupQueue();

  log.info("All queues initialized successfully");
};
