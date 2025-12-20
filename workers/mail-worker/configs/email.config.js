import "dotenv/config";
import nodemailer from "nodemailer";
import logger from "../utils/logger.js";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true only for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendMail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Multi-Vendor Platform" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    return info;
  } catch (error) {
    logger.error(`Email send failed: ${error.message}`);
  }
};
