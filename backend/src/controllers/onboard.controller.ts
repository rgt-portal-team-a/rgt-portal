import { Request, Response, NextFunction } from "express";
import { UserService } from "@/services/user.service";
import { EmployeeService } from "@/services/employee.service";
import { NotificationPreferenceService } from "@/services/notifications/notification-preference.service";
import { AppDataSource } from "@/database/data-source";
import { NotificationPreference } from "@/entities/notification-preference.entity";
import { OnboardUserDto, UpdateUserStatusDto } from "@/dtos/user.dto";
import { UserStatus } from "@/entities/user.entity";
import { QueueService, QueueName, JobType } from "@/services/queue.service";
import { BadRequestError } from "@/utils/error";
import { Logger } from "@/services/logger.service";
import { User } from "@/entities/user.entity";
import { Employee } from "@/entities/employee.entity";

export class OnboardController {
  private userService: UserService;
  private employeeService: EmployeeService;
  private notificationPreferenceService: NotificationPreferenceService;
  private queueService: QueueService;
  private logger: Logger;
  private userRepository;
  private employeeRepository;

  constructor() {
    this.userService = new UserService();
    this.employeeService = new EmployeeService();
    this.notificationPreferenceService = new NotificationPreferenceService(
      AppDataSource.getRepository(NotificationPreference)
    );
    this.queueService = QueueService.getInstance();
    this.logger = new Logger("OnboardController");
    this.userRepository = AppDataSource.getRepository(User);
    this.employeeRepository = AppDataSource.getRepository(Employee);
  }

  public onboardUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const onboardData = req.body;
      this.logger.debug("Onboarding request data", { additionalInfo: onboardData });
      
      const { userId, employee, roleId } = onboardData;

      const user = await this.userService.findById(userId);
      if (!user) {
        throw new BadRequestError("User not found");
      }

      if (user.status !== UserStatus.AWAITING) {
        throw new BadRequestError("User is not in awaiting status");
      }

      // First update the user status and role
      if (roleId) {
        await this.userRepository.update(userId, { 
          role: { id: roleId },
          status: UserStatus.ACTIVE 
        });
      } else {
        await this.userRepository.update(userId, { status: UserStatus.ACTIVE });
      }

      // Then create the employee
      const employeeEntity = this.employeeRepository.create({
        ...employee,
        user: { id: userId }
      });
      const createdEmployee = await this.employeeRepository.save(employeeEntity);

      await this.notificationPreferenceService.initializeUserPreferences(userId);

      await this.queueService.addJob(
        QueueName.NOTIFICATIONS,
        JobType.EMPLOYEE_RECOGNITION,
        {
          sender: req.user,
          recipientId: userId,
          message: "Your account has been successfully onboarded. Welcome to the team!"
        }
      );

      res.json({
        success: true,
        message: "User onboarded successfully",
        user: {
          ...user,
          employee: createdEmployee,
          status: UserStatus.ACTIVE
        }
      });
    } catch (error) {
      this.logger.error("Failed to onboard user", { error });
      res.status(error instanceof BadRequestError ? 400 : 500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to onboard user",
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        } : "Unknown error"
      });
    }
  };

  public updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const statusData: UpdateUserStatusDto = req.body;
      const { userId, status, reason } = statusData;

      const user = await this.userService.findById(userId);
      if (!user) {
        throw new BadRequestError("User not found");
      }

      if (user.status === UserStatus.INACTIVE && status === UserStatus.ACTIVE) {
        throw new BadRequestError("Cannot activate an inactive user without onboarding");
      }

      await this.userService.update(userId, { status });

      await this.queueService.addJob(
        QueueName.NOTIFICATIONS,
        JobType.EMPLOYEE_RECOGNITION,
        {
          sender: req.user,
          recipientId: userId,
          message: `Your account status has been updated to ${status}. ${reason ? `Reason: ${reason}` : ''}`
        }
      );

      res.json({
        success: true,
        message: "User status updated successfully",
        user: {
          ...user,
          status
        }
      });
    } catch (error) {
      console.error("Failed to update user status", error);
      res.status(500).json({
        success: false,
        message: "Failed to update user status",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };

  public getAwaitingUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.userService.findByStatus(UserStatus.AWAITING);
      res.json({
        success: true,
        users
      });
    } catch (error) {
      console.error("Failed to get awaiting users", error);
      res.status(500).json({
        success: false,
        message: "Failed to get awaiting users",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };
} 