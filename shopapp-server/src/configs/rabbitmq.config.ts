import amqp, { Channel, Connection } from "amqplib";

class RabbitMQ {
  private connection: Connection | null = null;
  private channel: Channel | null = null;

  public async connect(): Promise<Channel> {
    if (!this.connection) {
      this.connection = await amqp.connect({
        hostname: "localhost",
        port: 5672,
        username: "pury",
        password: "123",
      });
      this.channel = await this.connection.createChannel();
    }
    return this.channel!;
  }

  public async close(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
      this.channel = null;
    }
  }
}

export const rabbitMQ = new RabbitMQ();
