import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { AppDataSource } from "@/database/data-source";
import { CreateUserDto, UpdateUserDto } from "@/dtos/user.dto";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { MailService } from "@/services/mail.service";
import { Redis } from "ioredis";
import { v4 as uuidv4 } from "uuid";
import { BadRequestError, UnauthorizedError } from "@/utils/error";
import { generateOtp } from "@/utils/function";
import { logger } from "@/config/logger.config";
import { redis } from "@/config/redis.config";

export class UserService {
  private userRepository: Repository<User>;
  private mailService: MailService;
  private redis: Redis;
  private readonly SALT_ROUNDS = 10;
  private readonly OTP_EXPIRY = 10 * 60;
  private readonly PASSWORD_RESET_EXPIRY = 60 * 60;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.mailService = new MailService();
    this.redis = redis;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ["role", "employee"],
    });
  }

  async findById(id: number): Promise<User | null> {
    const user = this.userRepository.findOne({
      where: { id },
      relations: ["role", "employee"],
    });

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ["role"],
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    await this.userRepository.update(id, updateUserDto);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async setPassword(userId: number, password: string): Promise<User | null> {
    this.validatePasswordStrength(password);

    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

    await this.userRepository.update(userId, {
      password: hashedPassword,
      isPasswordSet: true,
      updatedAt: new Date(),
    });

    return this.findById(userId);
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    if (!user || !user.password) return false;

    return await bcrypt.compare(password, user.password);
  }

  private validatePasswordStrength(password: string): void {
    if (!password || password.length < 8) {
      throw new BadRequestError("Password must be at least 8 characters long");
    }

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!strongPasswordRegex.test(password)) {
      throw new BadRequestError("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character");
    }
  }

  async initiateEmailVerification(email: string): Promise<{ message: string; otpId: string }> {
    const emailDomain = email.split("@")[1];
    const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN;

    if (emailDomain !== allowedDomain) {
      throw new BadRequestError(`Only ${allowedDomain} email addresses are allowed`);
    }

    const otp = generateOtp(6);

    const otpId = uuidv4();

    await this.redis.set(`email_verification:${otpId}`, JSON.stringify({ email, otp, verified: false }), "EX", this.OTP_EXPIRY);

    await this.mailService.sendOtpEmail(email, otp);

    logger.info(`Email verification initiated for ${email} with otpId ${otpId}`);

    return {
      message: `Verification OTP sent to ${email}`,
      otpId,
    };
  }

  async verifyEmailOtp(otpId: string, submittedOtp: string): Promise<{ verified: boolean; email: string }> {
    const storedData = await this.redis.get(`email_verification:${otpId}`);

    if (!storedData) {
      throw new BadRequestError("Verification code expired or invalid");
    }

    const { email, otp, verified } = JSON.parse(storedData);

    if (verified) {
      return { verified: true, email };
    }

    if (submittedOtp !== otp) {
      const failedAttempts = await this.incrementFailedAttempts(otpId);

      if (failedAttempts >= 5) {
        await this.redis.del(`email_verification:${otpId}`);
        throw new UnauthorizedError("Too many failed attempts. Please request a new verification code.");
      }

      throw new BadRequestError("Invalid verification code");
    }

    await this.redis.set(`email_verification:${otpId}`, JSON.stringify({ email, otp, verified: true }), "EX", this.OTP_EXPIRY);

    logger.info(`Email ${email} successfully verified with otpId ${otpId}`);

    return { verified: true, email };
  }

  private async incrementFailedAttempts(otpId: string): Promise<number> {
    const key = `failed_attempts:${otpId}`;
    const attempts = await this.redis.incr(key);
    await this.redis.expire(key, this.OTP_EXPIRY);
    return attempts;
  }

  async initiatePasswordReset(email: string): Promise<{ message: string }> {
    const user = await this.findByEmail(email);

    if (!user) {
      return { message: "If your email exists in our system, you will receive password reset instructions" };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    await this.redis.set(`password_reset:${hashedToken}`, JSON.stringify({ userId: user.id }), "EX", this.PASSWORD_RESET_EXPIRY);

    const resetUrl = `${process.env.DEV_CLIENT_URL}/reset-password?token=${resetToken}`;

    await this.mailService.sendPasswordResetEmail(user.email, resetUrl);

    logger.info(`Password reset initiated for user ID ${user.id}`);

    return {
      message: "If your email exists in our system, you will receive password reset instructions",
    };
  }

  async verifyResetToken(token: string): Promise<{ valid: boolean; userId?: number }> {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const storedData = await this.redis.get(`password_reset:${hashedToken}`);

    if (!storedData) {
      return { valid: false };
    }

    const { userId } = JSON.parse(storedData);

    return { valid: true, userId };
  }

  async resetPassword(token: string, newPassword: string): Promise<User> {
    const { valid, userId } = await this.verifyResetToken(token);

    if (!valid || !userId) {
      throw new BadRequestError("Invalid or expired password reset token");
    }

    this.validatePasswordStrength(newPassword);

    const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    await this.userRepository.update(userId, {
      password: hashedPassword,
      isPasswordSet: true,
      updatedAt: new Date(),
    });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    await this.redis.del(`password_reset:${hashedToken}`);

    logger.info(`Password reset completed for user ID ${userId}`);

    return this.findById(userId) as Promise<User>;
  }

  async authenticateLocal(email: string): Promise<{ user: User; requiresOtp: boolean, otpId?: string }> {
    const user = await this.findByEmail(email);

    if (!user) {
      throw new UnauthorizedError("Invalid email");
    }
    // const isPasswordValid = await this.verifyPassword(user, password);
    try {
      const { otpId } = await this.initiateEmailVerification(email);
      return {
        otpId,
        user,
        requiresOtp: true,
      };
    } catch (error) {
      throw new UnauthorizedError("Invalid email");
    }

  }

  async completeAuthWithOtp(userId: number, otpId: string, otp: string): Promise<User> {
    const { verified, email } = await this.verifyEmailOtp(otpId, otp);

    if (!verified) {
      throw new UnauthorizedError("Invalid or expired verification code");
    }

    await this.userRepository.update(userId, {
      requiresVerification: false,
      updatedAt: new Date(),
    });

    logger.info(`User email ${email} completed authentication with OTP verification`);

    return this.findByEmail(email) as Promise<User>;
  }
}
