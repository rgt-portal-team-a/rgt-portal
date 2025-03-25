import nodemailer from "nodemailer";

export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendMail(mailOptions: nodemailer.SendMailOptions): Promise<void> {
    await this.transporter.sendMail(mailOptions);
  }

  async sendOtpEmail(to: string, otp: string): Promise<void> {
    try {
      const companyName = process.env.COMPANY_NAME || "RGT Portal";

      const mailOptions = {
        from: `"${companyName}" <${process.env.SMTP_FROM_EMAIL}>`,
        to,
        subject: `${otp} is your verification code`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Verify Your Email</h2>
            <p>Your verification code is:</p>
            <div style="font-size: 24px; font-weight: bold; background-color: #f4f4f4; padding: 10px 15px; letter-spacing: 5px; text-align: center; margin: 20px 0;">
              ${otp}
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, you can safely ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eaeaea;" />
            <p style="font-size: 12px; color: #777;">
              This is an automated message, please do not reply. If you need assistance, please contact support.
            </p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new Error("Failed to send verification email");
    }
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    try {
      const companyName = process.env.COMPANY_NAME || "RGT Portal";

      const mailOptions = {
        from: `"${companyName}" <${process.env.SMTP_FROM_EMAIL}>`,
        to,
        subject: "Reset Your Password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Reset Your Password</h2>
            <p>You requested a password reset for your account. Click the button below to set a new password:</p>
            <div style="text-align: center; margin: 25px 0;">
              <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                Reset Password
              </a>
            </div>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this password reset, you can safely ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eaeaea;" />
            <p style="font-size: 12px; color: #777;">
              This is an automated message, please do not reply. If you need assistance, please contact support.
            </p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new Error("Failed to send password reset email");
    }
  }
}
