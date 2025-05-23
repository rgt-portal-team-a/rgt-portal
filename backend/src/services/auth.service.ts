import { In, Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { AppDataSource } from "@/database/data-source";
import { CreateUserDto, UpdateUserAndEmployeeDto, UpdateUserDto } from "@/dtos/user.dto";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { MailService } from "@/services/mail.service";
import { Redis } from "ioredis";
import { v4 as uuidv4 } from "uuid";
import { BadRequestError, UnauthorizedError } from "@/utils/error";
import { generateOtp } from "@/utils/function";
import { logger } from "@/config/logger.config";
import { redis } from "@/config/redis.config";
import { Employee } from "@/entities/employee.entity";

export class UserService {
  private userRepository: Repository<User>;
  private employeeRepository: Repository<Employee>;
  private mailService: MailService;
  private redis: Redis;
  private readonly SALT_ROUNDS = 10;
  private readonly OTP_EXPIRY = 10 * 60;
  private readonly PASSWORD_RESET_EXPIRY = 60 * 60;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.employeeRepository = AppDataSource.getRepository(Employee);
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

  async authenticateLocal(email: string): Promise<{ user: User; requiresOtp: boolean; otpId?: string }> {
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

  async updateUserAndEmployee(id: number, updateUserAndEmployeeDto: UpdateUserAndEmployeeDto): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error("User not found");
    }

    if (updateUserAndEmployeeDto.username) {
      user.username = updateUserAndEmployeeDto.username;
    }
    if (updateUserAndEmployeeDto.profileImage) {
      user.profileImage = updateUserAndEmployeeDto.profileImage;
    }

    await this.userRepository.save(user);

    const employee = await this.employeeRepository.findOne({ where: { user: { id: id } } });
    if (!employee) {
      throw new Error("Employee not found");
    }
    if (updateUserAndEmployeeDto.firstName) {
      employee.firstName = updateUserAndEmployeeDto.firstName;
    }
    if (updateUserAndEmployeeDto.lastName) {
      employee.lastName = updateUserAndEmployeeDto.lastName;
    }
    if (updateUserAndEmployeeDto.phone) {
      employee.phone = updateUserAndEmployeeDto.phone;
    }
    await this.employeeRepository.save(employee);

    return user;
  }

  async createBatch(userData: CreateUserDto[]): Promise<number[]> {
    if (!userData || !Array.isArray(userData)) {
      throw new BadRequestError("Invalid user data provided for batch creation");
    }

    const uniqueEmails = new Set<string>();
    const uniqueUsernames = new Set<string>();
    const filteredUserData = userData.filter((user) => {
      const isEmailDuplicate = uniqueEmails.has(user.email);
      const isUsernameDuplicate = uniqueUsernames.has(user.username);

      if (isEmailDuplicate || isUsernameDuplicate) {
        return false;
      }

      uniqueEmails.add(user.email);
      uniqueUsernames.add(user.username);
      return true;
    });

    const existingUsers = await this.userRepository.find({
      where: [...filteredUserData.map((user) => ({ email: user.email })), ...filteredUserData.map((user) => ({ username: user.username }))],
    });

    const existingEmails = existingUsers.map((user) => user.email);
    const existingUsernames = existingUsers.map((user) => user.username);

    const uniqueUsers = filteredUserData.filter((user) => !existingEmails.includes(user.email) && !existingUsernames.includes(user.username));

    if (uniqueUsers.length === 0) {
      logger.warn("No new users to create, all provided emails and usernames are duplicates.");
      return []; 
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const users = uniqueUsers.map((data) =>
        this.userRepository.create({
          username: data.username,
          email: data.email,
          profileImage: data.profileImage,
          role: { id: data.role_id },
        }),
      );
      const savedUsers = await queryRunner.manager.save(users);
      await queryRunner.commitTransaction();
      logger.info(`Users created with ids: ${savedUsers?.map((user) => user.id)}`);
      return savedUsers?.map((user) => user.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findUsersByIds(userIds: number[]): Promise<User[]> {
    return this.userRepository.find({
      where: { id: In(userIds) },
    });
  }
}
