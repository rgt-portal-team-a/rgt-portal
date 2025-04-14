import Queue from "bull";
import { Logger } from "./logger.service";
import { NotificationService } from "./notifications/ntofication.service";
import { Event } from "@/entities/event.entity";
import { Employee } from "@/entities/employee.entity";
import { NotificationTemplates } from "./notifications/templates";
import { User } from "@/entities/user.entity";
import { Post } from "@/entities/post.entity";
import { PtoRequest } from "@/entities/pto-request.entity";
import { Poll } from "@/entities/poll.entity";
import { Department } from "@/entities/department.entity";
import { AppDataSource } from "../database/data-source";
import { Not } from "typeorm";
import { AiController } from "@/controllers/ai.controller";

export enum QueueName {
  NOTIFICATIONS = "notifications",
  EMAILS = "emails",
  REPORTS = "reports",
  PREDICTIONS = "predictions",
}

export enum JobType {
  // Event related notifications
  EVENT_CREATED = "event:created",
  EVENT_INVITATION = "event:invitation",
  EVENT_UPDATED = "event:updated",
  EVENT_CANCELLED = "event:cancelled",
  EVENT_REMINDER = "event:reminder",
  EVENT_REMINDER_24H = "event:reminder:24h",
  EVENT_REMINDER_1H = "event:reminder:1h",

  // Participant related notifications
  PARTICIPANT_ACCEPTED = "participant:accepted",
  PARTICIPANT_DECLINED = "participant:declined",
  PARTICIPANT_REMOVED = "participant:removed",

  // Post related notifications
  POST_CREATED = "post:created",
  POST_LIKED = "post:liked",
  POST_COMMENTED = "post:commented",
  COMMENT_REPLIED = "comment:replied",
  COMMENT_LIKED = "comment:liked",

  // PTO related notifications
  PTO_REQUEST_CREATED = "pto:created",
  PTO_REQUEST_STATUS = "pto:request:status",

  // Project related notifications
  PROJECT_ASSIGNMENT = "project:assignment",

  // Employee related notifications
  EMPLOYEE_RECOGNITION = "employee:recognition",
  EMPLOYEE_BIRTHDAY = "employee:birthday",
  NEW_USER_SIGNUP = "user:signup",

  // Poll related notifications
  POLL_CREATED = "poll:created",

  // Department related notifications
  DEPARTMENT_ASSIGNMENT = "department:assignment",
  DEPARTMENT_REMOVAL = "department:removal",
  DEPARTMENT_TRANSFER = "department:transfer",
  DEPARTMENT_CREATED = "department:created",

  // Email notifications
  EMAIL_EVENT_SUMMARY = "email:event:summary",
  EMAIL_WEEKLY_DIGEST = "email:weekly:digest",

  // Reports
  GENERATE_EVENT_REPORT = "report:event:generate",
  GENERATE_PARTICIPATION_REPORT = "report:participation:generate",

  // AI PREDICTIONS
  SAVE_PREDICT_MATCH_RESPONSE = "prediction:job:match",
  SAVE_PREDICT_DROP_OFF_RESPONSE = "prediction:dropoff",
  SAVE_PREDICT_SCORE_RESPONSE = "prediction:score",
}

interface JobData {
  type: JobType;
  payload: any;
  progress?: number;
}

interface JobProgress {
  total: number;
  current: number;
  status: string;
}

export class QueueService {
  private static instance: QueueService;
  private queues: Map<QueueName, Queue.Queue>;
  private logger: Logger;
  private notificationService: NotificationService;
  private jobProgress: Map<string, JobProgress>;

  private constructor() {
    this.logger = new Logger("QueueService");
    this.notificationService = new NotificationService();
    this.queues = new Map();
    this.jobProgress = new Map();
    this.initializeQueues();
  }

  public static getInstance(): QueueService {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService();
    }
    return QueueService.instance;
  }

  private initializeQueues(): void {
    const redisConfig = {
      redis: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379"),
        password: process.env.REDIS_PASSWORD || "",
        username: process.env.REDIS_USERNAME || "",
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
      },
    };

    const notificationsQueue = new Queue<JobData>(QueueName.NOTIFICATIONS, redisConfig);

    const predictionsQueue = new Queue<JobData>(QueueName.PREDICTIONS, redisConfig);

    const emailsQueue = new Queue<JobData>(QueueName.EMAILS, redisConfig);

    const reportsQueue = new Queue<JobData>(QueueName.REPORTS, redisConfig);

    [notificationsQueue, predictionsQueue, emailsQueue, reportsQueue].forEach((queue) => {
      queue.on("error", (error: Error) => {
        this.logger.error(`Queue error:`, error);
      });

      queue.on("waiting", (jobId: string) => {
        this.logger.info(`Job ${jobId} is waiting`);
      });

      queue.on("active", (job: Queue.Job<JobData>) => {
        this.logger.info(`Job ${job.id} has started processing`);
      });

      queue.on("completed", (job: Queue.Job<JobData>) => {
        this.logger.info(`Job ${job.id} has completed successfully`);
      });

      queue.on("failed", (job: Queue.Job<JobData>, error: Error) => {
        this.logger.error(`Job ${job.id} failed:`, error);
      });

      queue.on("stalled", (job: Queue.Job<JobData>) => {
        this.logger.warn(`Job ${job.id} has stalled`);
      });
    });

    // Process notifications queue
    notificationsQueue.process(async (job: Queue.Job<JobData>) => {
      try {
        await this.processNotificationJob(job);
      } catch (error) {
        this.logger.error(`Error processing notification job ${job.id}:`, error);
        throw error;
      }
    });

    // Process emails queue
    emailsQueue.process(async (job: Queue.Job<JobData>) => {
      try {
        await this.processEmailJob(job);
      } catch (error) {
        this.logger.error(`Error processing email job ${job.id}:`, error);
        throw error;
      }
    });

    // Process reports queue
    reportsQueue.process(async (job: Queue.Job<JobData>) => {
      try {
        await this.processReportJob(job);
      } catch (error) {
        this.logger.error(`Error processing report job ${job.id}:`, error);
        throw error;
      }
    });

    // Process predictions queue
    predictionsQueue.process(async (job: Queue.Job<JobData>) => {
      try {
        await this.processPredictionJob(job);
      } catch (error) {
        this.logger.error(`Error processing prediction job ${job.id}:`, error);
        throw error;
      }
    });

    this.queues.set(QueueName.NOTIFICATIONS, notificationsQueue);
    this.queues.set(QueueName.EMAILS, emailsQueue);
    this.queues.set(QueueName.REPORTS, reportsQueue);
    this.queues.set(QueueName.PREDICTIONS, predictionsQueue);
  }

  private async processNotificationJob(job: Queue.Job<JobData>): Promise<void> {
    const { type, payload } = job.data;

    switch (type) {
      case JobType.EVENT_CREATED:
        await this.processEventCreatedNotification(payload);
        break;
      case JobType.EVENT_INVITATION:
        await this.processEventInvitationNotification(payload);
        break;
      case JobType.EVENT_REMINDER:
        await this.processEventReminderNotification(payload);
        break;
      case JobType.POST_CREATED:
        await this.processPostCreatedNotification(payload);
        break;
      case JobType.POST_LIKED:
        await this.processPostLikedNotification(payload);
        break;
      case JobType.POST_COMMENTED:
        await this.processPostCommentedNotification(payload);
        break;
      case JobType.COMMENT_REPLIED:
        await this.processCommentRepliedNotification(payload);
        break;
      case JobType.COMMENT_LIKED:
        await this.processCommentLikedNotification(payload);
        break;
      case JobType.PTO_REQUEST_CREATED:
        await this.processPtoRequestCreatedNotification(payload);
        break;
      case JobType.PTO_REQUEST_STATUS:
        await this.processPtoRequestStatusNotification(payload);
        break;
      case JobType.EMPLOYEE_RECOGNITION:
        await this.processEmployeeRecognitionNotification(payload);
        break;
      case JobType.POLL_CREATED:
        await this.processPollCreatedNotification(payload);
        break;
      case JobType.DEPARTMENT_ASSIGNMENT:
        await this.processDepartmentAssignmentNotification(payload);
        break;
      case JobType.DEPARTMENT_REMOVAL:
        await this.processDepartmentRemovalNotification(payload);
        break;
      case JobType.DEPARTMENT_TRANSFER:
        await this.processDepartmentTransferNotification(payload);
        break;
      case JobType.DEPARTMENT_CREATED:
        await this.processDepartmentCreatedNotification(payload);
        break;
      case JobType.EMPLOYEE_BIRTHDAY:
        await this.processEmployeeBirthdayNotification(payload);
        break;
      case JobType.NEW_USER_SIGNUP:
        await this.processNewUserSignupNotification(payload);
        break;
      case JobType.SAVE_PREDICT_MATCH_RESPONSE:
        await this.processJobMatchPrediction(payload);
        break;
      default:
        throw new Error(`Unknown notification type: ${type}`);
    }
  }

  private async processEmailJob(job: Queue.Job<JobData>): Promise<void> {
    const { type, payload } = job.data;

    switch (type) {
      case JobType.EMAIL_EVENT_SUMMARY:
        await this.processEventSummaryEmail(payload);
        break;
      case JobType.EMAIL_WEEKLY_DIGEST:
        await this.processWeeklyDigestEmail(payload);
        break;
      default:
        throw new Error(`Unknown email type: ${type}`);
    }
  }

  private async processReportJob(job: Queue.Job<JobData>): Promise<void> {
    const { type, payload } = job.data;

    switch (type) {
      case JobType.GENERATE_EVENT_REPORT:
        await this.generateEventReport(payload);
        break;
      case JobType.GENERATE_PARTICIPATION_REPORT:
        await this.generateParticipationReport(payload);
        break;
      default:
        throw new Error(`Unknown report type: ${type}`);
    }
  }

  // AI PREDICTIONS
  private async processPredictionJob(job: Queue.Job<JobData>): Promise<void> {
    const { type, payload } = job.data;

    switch (type) {
      case JobType.SAVE_PREDICT_MATCH_RESPONSE:
        await this.processJobMatchPrediction(payload);
        break;
      case JobType.SAVE_PREDICT_DROP_OFF_RESPONSE:
        await this.processDropOffPrediction(payload);
        break;
      case JobType.SAVE_PREDICT_SCORE_RESPONSE:
        await this.processScorePrediction(payload);
        break;
      default:
        throw new Error(`Unknown prediction type: ${type}`);
    }
  }

  // Event Created Notification
  private async processEventCreatedNotification(payload: { eventId: number; organizerId: number }): Promise<void> {
    const { eventId, organizerId } = payload;

    // Get event and organizer details
    const event = await AppDataSource.getRepository(Event).findOne({
      where: { id: eventId },
      relations: ["organizer", "organizer.user"],
    });

    if (!event) {
      this.logger.error(`Event ${eventId} not found for notification`);
      return;
    }

    // Get all employees for notifications
    const allEmployees = await AppDataSource.getRepository(Employee).find({
      relations: ["user"],
      where: {
        id: Not(organizerId),
      },
    });

    await Promise.all(
      allEmployees
        .filter((employee: Employee) => employee.user)
        .map((employee: Employee) =>
          this.notificationService
            .createNotification(NotificationTemplates.eventCreated(event, employee.user!.id))
            .catch((error) => this.logger.error(`Failed to send notification to employee ${employee.id}:`, error)),
        ),
    );

    this.logger.info(`Successfully processed event created notifications for event ${eventId}`);
  }

  // Event Invitation Notification
  private async processEventInvitationNotification(payload: { event: Event; employee: Employee }): Promise<void> {
    const { event, employee } = payload;

    if (employee.user) {
      await this.notificationService.createNotification(NotificationTemplates.eventInvitation(event, employee.user.id));
      this.logger.info(`Successfully sent invitation notification to employee ${employee.id}`);
    }
  }

  // Event Reminder Notification
  private async processEventReminderNotification(payload: { event: Event; participants: Employee[] }): Promise<void> {
    const { event, participants } = payload;

    await Promise.all(
      participants
        .filter((participant) => participant.user)
        .map((participant) =>
          this.notificationService
            .createNotification(NotificationTemplates.eventReminder(event, participant.user!.id))
            .catch((error) => this.logger.error(`Failed to send reminder notification to participant ${participant.id}:`, error)),
        ),
    );

    this.logger.info(`Successfully processed event reminder notifications for event ${event.id}`);
  }

  private async processPostCreatedNotification(payload: { sender: User; post: Post }): Promise<void> {
    const allEmployees = await AppDataSource.getRepository(Employee).find({
      relations: ["user"],
      where: {
        id: Not(payload.sender.id),
      },
    });

    await Promise.all(
      allEmployees.map((employee) =>
        this.notificationService.createNotification(NotificationTemplates.postCreated(payload.sender, payload.post, employee.user!.id)),
      ),
    );

    this.logger.info(`Successfully processed post created notifications for post ${payload.post.id}`);  
  }

  // Post related notification methods
  private async processPostLikedNotification(payload: { sender: User; post: Post }): Promise<void> {
    await this.notificationService.createNotification(NotificationTemplates.postLiked(payload.sender, payload.post));
  }

  private async processPostCommentedNotification(payload: { sender: User; post: Post; commentContent: string }): Promise<void> {
    await this.notificationService.createNotification(NotificationTemplates.postCommented(payload.sender, payload.post, payload.commentContent));
  }

  private async processCommentRepliedNotification(payload: {
    sender: User;
    parentCommentAuthorId: number;
    commentContent: string;
    commentId: number;
  }): Promise<void> {
    await this.notificationService.createNotification(
      NotificationTemplates.commentReplied(payload.sender, payload.parentCommentAuthorId, payload.commentContent, payload.commentId),
    );
  }

  private async processCommentLikedNotification(payload: {
    sender: User;
    commentAuthorId: number;
    commentContent: string;
    commentId: number;
  }): Promise<void> {
    await this.notificationService.createNotification(
      NotificationTemplates.commentLiked(payload.sender, payload.commentAuthorId, payload.commentContent, payload.commentId),
    );
  }

  // PTO related notification methods
  private async processPtoRequestCreatedNotification(payload: { ptoRequest: PtoRequest; recipientId: number }): Promise<void> {
    await this.notificationService.createNotification(NotificationTemplates.ptoRequestCreated(payload.ptoRequest, payload.recipientId));
  }

  private async processPtoRequestStatusNotification(payload: { ptoRequest: PtoRequest; updatedBy: User }): Promise<void> {
    await this.notificationService.createNotification(NotificationTemplates.ptoRequestStatusUpdate(payload.ptoRequest, payload.updatedBy));
  }

  // Employee related notification methods
  private async processEmployeeRecognitionNotification(payload: { sender: User; recipientId: number; message: string }): Promise<void> {
    await this.notificationService.createNotification(
      NotificationTemplates.employeeRecognition(payload.sender, payload.recipientId, payload.message),
    );
  }

  private async processEmployeeBirthdayNotification(payload: { employee: Employee; birthday: Date; recipientId: number }): Promise<void> {
    await this.notificationService.createNotification(
      NotificationTemplates.employeeBirthday(payload.employee, payload.birthday, payload.recipientId),
    );
  }

  // Poll related notification methods
  private async processPollCreatedNotification(payload: { poll: Poll; sender: User; targetUserIds: number[] }): Promise<void> {
    await Promise.all(
      payload.targetUserIds.map((targetUserId) =>
        this.notificationService.createNotification(
          NotificationTemplates.pollCreated(payload.sender, targetUserId, payload.poll.description, payload.poll.id),
        ),
      ),
    );
  }

  // Department related notification methods
  private async processDepartmentAssignmentNotification(payload: { employee: Employee; department: Department; assignedBy: User }): Promise<void> {
    await this.notificationService.createNotification(
      NotificationTemplates.departmentAssignment(payload.employee, payload.department, payload.assignedBy),
    );
  }

  private async processDepartmentRemovalNotification(payload: { employee: Employee; department: Department; removedBy: User }): Promise<void> {
    await this.notificationService.createNotification(
      NotificationTemplates.departmentRemoval(payload.employee, payload.department, payload.removedBy),
    );
  }

  private async processDepartmentTransferNotification(payload: {
    employee: Employee;
    fromDepartment: Department;
    toDepartment: Department;
    transferredBy: User;
  }): Promise<void> {
    await this.notificationService.createNotification(
      NotificationTemplates.departmentTransfer(payload.employee, payload.fromDepartment, payload.toDepartment, payload.transferredBy),
    );
  }

  private async processDepartmentCreatedNotification(payload: { department: Department; manager: Employee }): Promise<void> {
    await this.notificationService.createNotification(NotificationTemplates.departmentCreated(payload.department, payload.manager));
  }

  private async processJobMatchPrediction(payload: { recruitmentId: number }): Promise<void> {
    this.logger.info(`Processing job match prediction for recruitment ${payload.recruitmentId}`);

    try {
      await AiController.predictMatch(payload.recruitmentId.toString());
      this.logger.info(`Successfully processed job match prediction for recruitment ${payload.recruitmentId}`);
    } catch (error) {
      this.logger.error(`Error predicting job match for recruitment ${payload.recruitmentId}:`, error);
      throw error;
    }
  }

  private async processDropOffPrediction(payload: { recruitmentId: number }): Promise<void> {
    this.logger.info(`Processing drop off prediction for recruitment ${payload.recruitmentId}`);

    try {
      await AiController.predictCandidatesDropOff(payload.recruitmentId.toString());
    } catch (error) {
      this.logger.error(`Error predicting drop off for recruitment ${payload.recruitmentId}:`, error);
      throw error;
    }
  }

  private async processScorePrediction(payload: { recruitmentId: number }): Promise<void> {
    this.logger.info(`Processing score prediction for recruitment ${payload.recruitmentId}`);

    try {
      await AiController.predictCandidateScore(payload.recruitmentId.toString());

    } catch (error) {
      this.logger.error(`Error predicting score for recruitment ${payload.recruitmentId}:`, error);
      throw error;
    }
  }

  // Email processing methods
  private async processEventSummaryEmail(payload: { event: Event; organizer: Employee }): Promise<void> {
    // TODO:  email sending logic
    this.logger.info(`Processing event summary email for event ${payload.event.id}`);
  }

  private async processWeeklyDigestEmail(payload: { employee: Employee; events: Event[] }): Promise<void> {
    // TODO:  email sending logic
    this.logger.info(`Processing weekly digest email for employee ${payload.employee.id}`);
  }

  // Report generation methods
  private async generateEventReport(payload: { startDate: Date; endDate: Date }): Promise<void> {
    // TODO: report generation logic
    this.logger.info(`Generating event report for period ${payload.startDate} to ${payload.endDate}`);
  }

  private async generateParticipationReport(payload: { employeeId: number; startDate: Date; endDate: Date }): Promise<void> {
    // Implement report generation logic here
    this.logger.info(`Generating participation report for employee ${payload.employeeId}`);
  }

  private async processNewUserSignupNotification(payload: { newUser: User; recipientId: number }): Promise<void> {
    const { newUser, recipientId } = payload;
    const notification = NotificationTemplates.newUserSignup(newUser);
    notification.recipientId = recipientId;
    await this.notificationService.createNotification(notification);
    this.logger.info(`Successfully sent new user signup notification to HR user ${recipientId}`);
  }

  public async addJob(queueName: QueueName, jobType: JobType, payload: any, options: Queue.JobOptions = {}): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const job = await queue.add(
      {
        type: jobType,
        payload,
      },
      options,
    );

    this.logger.info(`Added job of type ${jobType} to queue ${queueName} with ID ${job.id}`);
  }

  public async getJobStatus(
    queueName: QueueName,
    jobId: string,
  ): Promise<{
    status: string;
    progress: number;
    attempts: number;
    timestamp: number;
  } | null> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const job = await queue.getJob(jobId);
    if (!job) {
      return null;
    }

    const state = await job.getState();
    const progress = job.progress();
    const attempts = job.attemptsMade;
    const timestamp = job.timestamp;

    return {
      status: state,
      progress,
      attempts,
      timestamp,
    };
  }

  public async updateJobProgress(queueName: QueueName, jobId: string, progress: number): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const job = await queue.getJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    await job.progress(progress);
  }

  public async getQueueStats(queueName: QueueName): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
  }> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const [waiting, active, completed, failed, delayed, paused] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
      queue.getPausedCount(),
    ]);

    return { waiting, active, completed, failed, delayed, paused };
  }

  public async pauseQueue(queueName: QueueName): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    await queue.pause();
    this.logger.info(`Queue ${queueName} paused`);
  }

  public async resumeQueue(queueName: QueueName): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    await queue.resume();
    this.logger.info(`Queue ${queueName} resumed`);
  }

  public async cleanOldJobs(queueName: QueueName, days: number = 7): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    await queue.clean(days * 24 * 60 * 60 * 1000, "completed");
    await queue.clean(days * 24 * 60 * 60 * 1000, "failed");

    this.logger.info(`Cleaned old jobs from queue ${queueName}`);
  }

  public async retryFailedJobs(queueName: QueueName): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const failedJobs = await queue.getFailed();
    for (const job of failedJobs) {
      await job.retry();
    }

    this.logger.info(`Retried ${failedJobs.length} failed jobs in queue ${queueName}`);
  }
}
