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

export class OnboardController {
  private userService: UserService;
  private employeeService: EmployeeService;
  private notificationPreferenceService: NotificationPreferenceService;
  private queueService: QueueService;

  constructor() {
    this.userService = new UserService();
    this.employeeService = new EmployeeService();
    this.notificationPreferenceService = new NotificationPreferenceService(
      AppDataSource.getRepository(NotificationPreference)
    );
    this.queueService = QueueService.getInstance();
  }

  public onboardUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const onboardData = req.body;
      const { userId, employee, roleId } = onboardData;

      const user = await this.userService.findById(userId);
      if (!user) {
        throw new BadRequestError("User not found");
      }

      if (user.status !== UserStatus.AWAITING) {
        throw new BadRequestError("User is not in awaiting status");
      }

      const createdEmployee = await this.employeeService.create({
        ...employee,
        user: { id: userId }
      });

      if (roleId) {
        await this.userService.update(userId, { role: { id: roleId } });
      }

      await this.userService.update(userId, { status: UserStatus.ACTIVE });

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
      next(error);
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
      next(error);
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
      next(error);
    }
  };
} 