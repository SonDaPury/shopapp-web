import { sendEmail } from "../configs/email.config";
import logger, { log } from "../configs/logger.config";
import { rabbitMQ } from "../configs/rabbitmq.config";

export const initEmailQueue = async () => {
  const channel = await rabbitMQ.connect();

  const queueName = "email_queue";
  await channel.assertQueue(queueName, { durable: true });

  // Consumer xử lý email
  channel.consume(queueName, async (msg) => {
    if (msg) {
      const { email, subject, content } = JSON.parse(msg.content.toString());
      try {
        await sendEmail(email, subject, content);
        log.info(`Email sent to ${email}`);
        channel.ack(msg);
      } catch (error) {
        log.error(`Failed to send email: ${error}`);
        logger.error(`Failed to send email: ${error}`);
        channel.nack(msg);
      }
    }
  });
};

export const addEmailJob = async (
  email: string,
  subject: string,
  content: string
) => {
  const channel = await rabbitMQ.connect();
  const queueName = "email_queue";

  await channel.assertQueue(queueName, { durable: true });
  channel.sendToQueue(
    queueName,
    Buffer.from(JSON.stringify({ email, subject, content }))
  );
};
