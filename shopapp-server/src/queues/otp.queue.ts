import { rabbitMQ } from "../configs/rabbitmq.config";
import { User } from "../models/user.model";
import { Database } from "../configs/database.config";
import { log } from "../configs/logger.config";

export const initOtpCleanupQueue = async () => {
  const channel = await rabbitMQ.connect();

  const queueName = "otp_cleanup_queue";
  await channel.assertQueue(queueName, { durable: true });

  // Consumer xử lý xóa OTP
  channel.consume(queueName, async (msg) => {
    if (msg) {
      const { userId } = JSON.parse(msg.content.toString());
      const userRepository = Database.getDbInstance().getRepository(User);

      const user = await userRepository.findOne({ where: { id: userId } });
      if (user) {
        user.otpCode = null;
        user.otpExpiresAt = null;
        await userRepository.save(user);
        log.info(`OTP for user ID ${userId} has been cleared`);
        channel.ack(msg);
      }
    }
  });
};

export const addOtpCleanupJob = async (
  userId: string,
  delayInMinutes: number
) => {
  const channel = await rabbitMQ.connect();
  const queueName = "otp_cleanup_queue";

  await channel.assertQueue(queueName, { durable: true });
  setTimeout(() => {
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify({ userId })));
  }, delayInMinutes * 60 * 1000);
};
