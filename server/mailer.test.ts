import { describe, it, expect } from "vitest";

describe("Mailer SMTP Configuration", () => {
  it("should have SMTP_HOST configured", () => {
    expect(process.env.SMTP_HOST).toBeDefined();
    expect(process.env.SMTP_HOST).toBe("mail.gzakroma.ru");
  });

  it("should have SMTP_PORT configured as 587", () => {
    expect(process.env.SMTP_PORT).toBeDefined();
    expect(process.env.SMTP_PORT).toBe("587");
  });

  it("should have SMTP_USER configured", () => {
    expect(process.env.SMTP_USER).toBeDefined();
    expect(process.env.SMTP_USER).toBe("sales@gzakroma.ru");
  });

  it("should have SMTP_PASS configured", () => {
    expect(process.env.SMTP_PASS).toBeDefined();
    expect(process.env.SMTP_PASS!.length).toBeGreaterThan(0);
  });

  it("should have SMTP_FROM configured", () => {
    expect(process.env.SMTP_FROM).toBeDefined();
    expect(process.env.SMTP_FROM).toBe("sales@gzakroma.ru");
  });

  it("should have MANAGER_EMAIL configured", () => {
    expect(process.env.MANAGER_EMAIL).toBeDefined();
    expect(process.env.MANAGER_EMAIL).toBe("sales@gzakroma.ru");
  });

  it("should create nodemailer transporter with correct config", async () => {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT ?? "587"),
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    expect(transporter).toBeDefined();
    expect(transporter.options).toBeDefined();
  });
});
