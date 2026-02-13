/**
 * Email Service for sending notifications via SMTP
 */

import nodemailer from "nodemailer";

// SMTP configuration from environment
const SMTP_HOST = process.env.SMTP_HOST || "mail.gzakroma.ru";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "25");

// Credentials for noreply (customer emails)
const SMTP_USER_NOREPLY = process.env.SMTP_USER_NOREPLY || "";
const SMTP_PASS_NOREPLY = process.env.SMTP_PASS_NOREPLY || "";

// Credentials for sales (owner/manager emails)
const SMTP_USER_SALES = process.env.SMTP_USER_SALES || "";
const SMTP_PASS_SALES = process.env.SMTP_PASS_SALES || "";

const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || "";

// Create transporter for noreply (customer emails)
const transporterNoreply = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: SMTP_USER_NOREPLY,
    pass: SMTP_PASS_NOREPLY,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 10000,
  socketTimeout: 10000,
});

// Create transporter for sales (owner/manager emails)
const transporterSales = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: SMTP_USER_SALES,
    pass: SMTP_PASS_SALES,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 10000,
  socketTimeout: 10000,
});

export interface EmailPayload {
  title: string;
  content: string;
  to?: string;
  html?: string;
  useSalesAccount?: boolean;
}

/**
 * Send email notification
 */
export async function sendEmailNotification(payload: EmailPayload): Promise<boolean> {
  const { title, content, to = NOTIFY_EMAIL, html, useSalesAccount = false } = payload;

  const transporter = useSalesAccount ? transporterSales : transporterNoreply;
  const fromEmail = useSalesAccount ? SMTP_USER_SALES : SMTP_USER_NOREPLY;
  const fromPass = useSalesAccount ? SMTP_PASS_SALES : SMTP_PASS_NOREPLY;

  if (!fromEmail || !fromPass) {
    console.log("[Email] SMTP not configured, skipping notification:", title);
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: `Гатчинские закрома <${fromEmail}>`,
      to: to,
      subject: title,
      text: content,
      html: html || `<div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>${title}</h2>
        <pre style="background: #f5f5f5; padding: 15px;">${content}</pre>
      </div>`,
    });

    console.log("[Email] Notification sent:", info.messageId, "to:", to);
    return true;
  } catch (error: any) {
    console.error("[Email] Failed to send notification:", error.message);
    return false;
  }
}
