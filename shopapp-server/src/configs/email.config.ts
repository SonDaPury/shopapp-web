import nodemailer from "nodemailer";
import { configs } from "./configs";

export const transporter = nodemailer.createTransport({
  host: configs.env.email.host,
  port: configs.env.email.port,
  secure: configs.env.email.secure,
  auth: {
    user: configs.env.email.user,
    pass: configs.env.email.password,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    await transporter.sendMail({
      from: configs.env.email.user,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
    configs.logger.info(`Email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
    configs.logger.error("Error sending email:", error);
    throw new Error("Error sending email");
  }
};
