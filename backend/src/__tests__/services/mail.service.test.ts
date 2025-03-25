import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { MailService } from "@/services/mail.service";
import nodemailer from "nodemailer";

vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(),
  },
}));

describe("MailService", () => {
  let mailService: MailService;
  let mockTransporter: any;

  beforeEach(() => {
    mockTransporter = {
      sendMail: vi.fn(),
    };

    (nodemailer.createTransport as any).mockReturnValue(mockTransporter);

    // Mock environment variables
    process.env.SMTP_USER = "test@example.com";
    process.env.SMTP_PASSWORD = "test-password";
    process.env.SMTP_FROM_EMAIL = "noreply@example.com";
    process.env.COMPANY_NAME = "Test Company";

    mailService = new MailService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("sendMail", () => {
    it("should send a mail with the provided options", async () => {
      const mailOptions = {
        to: "recipient@example.com",
        subject: "Test Subject",
        text: "Test Content",
      };

      await mailService.sendMail(mailOptions);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(mailOptions);
    });
  });

  describe("sendOtpEmail", () => {
    it("should send an OTP email with the correct format", async () => {
      const to = "user@example.com";
      const otp = "123456";

      await mailService.sendOtpEmail(to, otp);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: '"Test Company" <noreply@example.com>',
        to,
        subject: "123456 is your verification code",
        html: expect.stringContaining(otp),
      });
    });

    it("should use default company name if not set", async () => {
      delete process.env.COMPANY_NAME;
      const to = "user@example.com";
      const otp = "123456";

      await mailService.sendOtpEmail(to, otp);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: '"RGT Portal" <noreply@example.com>',
        }),
      );
    });

    it("should throw error if email sending fails", async () => {
      const to = "user@example.com";
      const otp = "123456";
      mockTransporter.sendMail.mockRejectedValue(new Error("SMTP Error"));

      await expect(mailService.sendOtpEmail(to, otp)).rejects.toThrow("Failed to send verification email");
    });
  });

  describe("sendPasswordResetEmail", () => {
    it("should send a password reset email with the correct format", async () => {
      const to = "user@example.com";
      const resetUrl = "https://example.com/reset-password";

      await mailService.sendPasswordResetEmail(to, resetUrl);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: '"Test Company" <noreply@example.com>',
        to,
        subject: "Reset Your Password",
        html: expect.stringContaining(resetUrl),
      });
    });

    it("should use default company name if not set", async () => {
      delete process.env.COMPANY_NAME;
      const to = "user@example.com";
      const resetUrl = "https://example.com/reset-password";

      await mailService.sendPasswordResetEmail(to, resetUrl);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: '"RGT Portal" <noreply@example.com>',
        }),
      );
    });

    it("should throw error if email sending fails", async () => {
      const to = "user@example.com";
      const resetUrl = "https://example.com/reset-password";
      mockTransporter.sendMail.mockRejectedValue(new Error("SMTP Error"));

      await expect(mailService.sendPasswordResetEmail(to, resetUrl)).rejects.toThrow("Failed to send password reset email");
    });
  });
});
