import { Repository, In } from "typeorm";
import { AppDataSource } from "@/database/data-source";
import { Employee } from "@/entities/employee.entity";
import { User } from "@/entities/user.entity";
import { Role } from "@/entities/role.entity";
import { NotificationService } from "./ntofication.service";
import { NotificationType } from "@/entities/notification.entity";
import { Logger } from "@/services/logger.service";
import { QueueService, QueueName, JobType } from "@/services/queue.service";

interface BirthdayNotificationConfig {
  roles: string[];
  daysInAdvance: number;
}

export class BirthdayNotificationService {
  private employeeRepository: Repository<Employee>;
  private userRepository: Repository<User>;
  private roleRepository: Repository<Role>;
  private notificationService: NotificationService;
  private logger: Logger;
  private queueService: QueueService;
  private config: BirthdayNotificationConfig;

  constructor(config: BirthdayNotificationConfig = { roles: ["admin", "hr"], daysInAdvance: 1 }) {
    this.employeeRepository = AppDataSource.getRepository(Employee);
    this.userRepository = AppDataSource.getRepository(User);
    this.roleRepository = AppDataSource.getRepository(Role);
    this.notificationService = new NotificationService();
    this.logger = new Logger("BirthdayNotificationService");
    this.queueService = QueueService.getInstance();
    this.config = config;
  }

  async checkAndSendBirthdayNotifications(): Promise<void> {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + this.config.daysInAdvance);

    const month = targetDate.getMonth() + 1;
    const day = targetDate.getDate();

    // Get all employees with birthdays on the target date
    const employeesWithBirthdays = await this.employeeRepository
      .createQueryBuilder("employee")
      .leftJoinAndSelect("employee.user", "user")
      .where("EXTRACT(MONTH FROM employee.birthDate) = :month", { month })
      .andWhere("EXTRACT(DAY FROM employee.birthDate) = :day", { day })
      .andWhere("employee.birthDate IS NOT NULL")
      .getMany();

    if (employeesWithBirthdays.length === 0) {
      this.logger.info(`No birthdays found for ${targetDate.toISOString()}`);
      return;
    }

    // Get all roles that should receive notifications
    const roles = await this.roleRepository.find({
      where: { name: In(this.config.roles) },
    });

    if (roles.length === 0) {
      this.logger.warn("No roles found for birthday notifications");
      return;
    }

    // Get all users with the specified roles
    const usersToNotify = await this.userRepository.find({
      where: roles.map((role) => ({ role: { id: role.id } })),
      relations: ["employee"],
    });

    if (usersToNotify.length === 0) {
      this.logger.warn("No users found with the specified roles");
      return;
    }

    // Process each employee's birthday notification
    for (const employee of employeesWithBirthdays) {
      const daysUntilBirthday = this.config.daysInAdvance;

      // Add birthday notification job to queue for each recipient
      for (const user of usersToNotify) {
        if (user.employee) {
          await this.queueService.addJob(
            QueueName.NOTIFICATIONS,
            JobType.EMPLOYEE_BIRTHDAY,
            {
              employee,
              birthday: employee.birthDate,
              recipientId: user.id
            }
          );
        }
      }
    }

    this.logger.info(`Processed ${employeesWithBirthdays.length} birthdays for ${targetDate.toISOString()}`);
  }
}
