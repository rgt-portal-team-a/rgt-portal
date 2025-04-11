import cron from "node-cron";
import { BirthdayNotificationService } from "./notifications/birthday-notification.service";
import { Logger } from "./logger.service";
import { EventService } from "./event.service";
import { PtoRequestService } from "./pto-request.service";

export interface ScheduledTask {
  name: string;
  cronExpression: string;
  task: () => Promise<void>;
  enabled?: boolean;
}

export class SchedulerService {
  private tasks: Map<string, cron.ScheduledTask>;
  private birthdayNotificationService: BirthdayNotificationService;
  private logger: Logger;
  private eventService: EventService;
  private ptoRequestService: PtoRequestService;
  constructor() {
    this.tasks = new Map();
    // with default config: notify admins and HRs 1 day in advance
    this.birthdayNotificationService = new BirthdayNotificationService({
      roles: ["admin", "hr"],
      daysInAdvance: 1,
    });
    this.eventService = new EventService();
    this.ptoRequestService = new PtoRequestService();
    this.logger = new Logger("SchedulerService");
  }

  async startSchedulers(): Promise<void> {
    // all scheduled tasks
    const scheduledTasks: ScheduledTask[] = [
      {
        name: "birthday-notifications",
        cronExpression: "0 0,12,18 * * *", // Run at midnight, 12:00 PM and 6:00 PM
        task: async () => {
          try {
            await this.birthdayNotificationService.checkAndSendBirthdayNotifications();
            this.logger.info("Birthday notifications check completed");
          } catch (error) {
            this.logger.error("Error checking birthday notifications:", error);
          }
        },
        enabled: true,
      },
      {
        name: "event-reminders",
        cronExpression: "0 0,12,18 * * *", // Run at midnight, 12:00 PM, and 6:00 PM
        task: async () => {
          await this.eventService.scheduleEventReminders();
        },
        enabled: true,
      },
      {
        name: "reset-pto-balance",
        cronExpression: "0 0 1 1 *", //TODO: Run at midnight of the first day of January every year
        task: async () => {
          await this.ptoRequestService.resetPtoBalance();
        },
        enabled: true,
      },
      // TODO: MORE SCHEDULED TASKS
    ];

    for (const task of scheduledTasks) {
      if (task.enabled) {
        this.scheduleTask(task);
      }
    }

    this.logger.info("Scheduler service initialized successfully");
  }

  private scheduleTask(scheduledTask: ScheduledTask): void {
    if (!cron.validate(scheduledTask.cronExpression)) {
      this.logger.error(`Invalid cron expression for task ${scheduledTask.name}: ${scheduledTask.cronExpression}`);
      return;
    }

    const task = cron.schedule(
      scheduledTask.cronExpression,
      async () => {
        this.logger.info(`Starting scheduled task: ${scheduledTask.name}`);
        try {
          await scheduledTask.task();
          this.logger.info(`Completed scheduled task: ${scheduledTask.name}`);
        } catch (error) {
          this.logger.error(`Error in scheduled task ${scheduledTask.name}:`, error);
        }
      },
      {
        scheduled: true,
        timezone: "UTC", // TODO: CHANGE TO LOCAL TIMEZONE
      },
    );

    this.tasks.set(scheduledTask.name, task);
    this.logger.info(`Scheduled task ${scheduledTask.name} with cron expression ${scheduledTask.cronExpression}`);
  }

  addTask(scheduledTask: ScheduledTask): void {
    if (this.tasks.has(scheduledTask.name)) {
      this.logger.warn(`Task ${scheduledTask.name} already exists. Skipping...`);
      return;
    }

    this.scheduleTask(scheduledTask);
  }

  removeTask(taskName: string): void {
    const task = this.tasks.get(taskName);
    if (task) {
      task.stop();
      this.tasks.delete(taskName);
      this.logger.info(`Removed scheduled task: ${taskName}`);
    } else {
      this.logger.warn(`Task ${taskName} not found`);
    }
  }

  stopAllTasks(): void {
    for (const [taskName, task] of this.tasks.entries()) {
      task.stop();
      this.logger.info(`Stopped scheduled task: ${taskName}`);
    }
    this.tasks.clear();
  }

  getTaskStatus(): Array<{ name: string; isRunning: boolean }> {
    return Array.from(this.tasks.entries()).map(([name]) => ({
      name,
      isRunning: true,
    }));
  }
}
