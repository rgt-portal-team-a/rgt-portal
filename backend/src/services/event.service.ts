import { AppDataSource } from "@/database/data-source";
import { Repository, QueryRunner, Between, MoreThanOrEqual, LessThanOrEqual, Not } from "typeorm";
import { Event } from "@/entities/event.entity";
import { Employee } from "@/entities/employee.entity";
import { EventParticipant } from "@/entities/event-participant.entity";
import { CreateEventDto, UpdateEventDto, ParticipationStatus } from "@/dtos/event.dto";
import { DatabaseService } from "@/services/database.service";
import { Logger } from "@/services/logger.service";
import { NotificationService } from "./notifications/ntofication.service";
import { NotificationTemplates } from "./notifications/templates";

export class EventService {
  private eventRepository: Repository<Event>;
  private employeeRepository: Repository<Employee>;
  private participantRepository: Repository<EventParticipant>;
  private notificationService: NotificationService;
  private logger: Logger;

  constructor() {
    this.eventRepository = AppDataSource.getRepository(Event);
    this.employeeRepository = AppDataSource.getRepository(Employee);
    this.participantRepository = AppDataSource.getRepository(EventParticipant);
    this.notificationService = new NotificationService();
    this.logger = new Logger("EventService");
  }

  async findAll(relations: string[] = ["organizer"]): Promise<Event[]> {
    try {
      return this.eventRepository.find({
        relations,
        order: { startTime: "DESC" },
      });
    } catch (error) {
      this.logger.error("Error fetching all events:", error);
      throw error;
    }
  }

  async findById(id: number, relations: string[] = ["organizer", "participants", "participants.employee"]): Promise<Event | null> {
    try {
      return this.eventRepository.findOne({
        where: { id },
        relations,
      });
    } catch (error) {
      this.logger.error(`Error fetching event with ID ${id}:`, error);
      throw error;
    }
  }

  async findByOrganizerId(organizerId: number): Promise<Event[]> {
    try {
      return this.eventRepository.find({
        where: { organizerId },
        relations: ["participants"],
        order: { startTime: "DESC" },
      });
    } catch (error) {
      this.logger.error(`Error fetching events organized by employee ID ${organizerId}:`, error);
      throw error;
    }
  }

  async findByEmployeeParticipation(employeeId: number): Promise<Event[]> {
    try {
      const participations = await this.participantRepository.find({
        where: { employeeId },
        relations: ["event", "event.organizer"],
      });

      return participations.map((p) => p.event);
    } catch (error) {
      this.logger.error(`Error fetching events for employee ID ${employeeId}:`, error);
      throw error;
    }
  }

  async findUpcoming(days: number = 30): Promise<Event[]> {
    try {
      const now = new Date();
      const endDate = new Date();
      endDate.setDate(now.getDate() + days);

      return this.eventRepository.find({
        where: {
          startTime: Between(now, endDate),
        },
        relations: ["organizer"],
        order: { startTime: "ASC" },
      });
    } catch (error) {
      this.logger.error(`Error fetching upcoming events:`, error);
      throw error;
    }
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Event[]> {
    try {
      return this.eventRepository.find({
        where: [
          // Events that start within the range
          { startTime: Between(startDate, endDate) },
          // Events that end within the range
          { endTime: Between(startDate, endDate) },
          // Events that span the entire range
          {
            startTime: LessThanOrEqual(startDate),
            endTime: MoreThanOrEqual(endDate),
          },
        ],
        relations: ["organizer"],
        order: { startTime: "ASC" },
      });
    } catch (error) {
      this.logger.error(`Error fetching events by date range:`, error);
      throw error;
    }
  }

  async create(eventData: CreateEventDto, organizer_id?: number): Promise<Event> {
    let queryRunner: QueryRunner | null = null;
    try {
      let organizer: Employee | null = null;
      if (eventData.organizerId) {
        organizer = await this.employeeRepository.findOne({ where: { id: eventData.organizerId }, relations: ["user"] });
      } else {
        organizer = await this.employeeRepository.findOne({ where: { id: organizer_id }, relations: ["user"] });
      }
      if (!organizer) {
        throw new Error("Organizer not found");
      }

      if (new Date(eventData.endTime) <= new Date(eventData.startTime)) {
        throw new Error("End time must be after start time");
      }

      queryRunner = await DatabaseService.createTransaction();

      const event = this.eventRepository.create({
        ...eventData,
        organizer,
      });
      const savedEvent = await queryRunner.manager.save(Event, event);

      // Send notification to all users except the organizer
      const allEmployees = await this.employeeRepository.find({
        relations: ["user"],
        where: {
          id: Not(organizer.id),
        },
      });

      // Send notifications to all employees except the organizer
      for (const employee of allEmployees) {
        if (employee.user) {
          await this.notificationService.createNotification(NotificationTemplates.eventCreated(savedEvent, employee.user.id));
        }
      }

      await DatabaseService.commitTransaction(queryRunner);

      return this.findById(savedEvent.id) as Promise<Event>;
    } catch (error) {
      if (queryRunner) {
        await DatabaseService.rollbackTransaction(queryRunner);
      }
      this.logger.error("Error creating event:", error);
      throw error;
    }
  }

  async update(id: number, updateData: UpdateEventDto): Promise<Event> {
    let queryRunner: QueryRunner | null = null;

    try {
      const event = await this.findById(id);
      if (!event) {
        throw new Error("Event not found");
      }

      if (updateData.organizerId && updateData.organizerId !== event.organizerId) {
        const organizer = await this.employeeRepository.findOneBy({ id: updateData.organizerId });
        if (!organizer) {
          throw new Error("Organizer not found");
        }
      }

      if (updateData.startTime && updateData.endTime) {
        if (new Date(updateData.endTime) <= new Date(updateData.startTime)) {
          throw new Error("End time must be after start time");
        }
      } else if (updateData.startTime && !updateData.endTime) {
        if (new Date(updateData.startTime) >= new Date(event.endTime)) {
          throw new Error("Start time must be before existing end time");
        }
      } else if (!updateData.startTime && updateData.endTime) {
        if (new Date(updateData.endTime) <= new Date(event.startTime)) {
          throw new Error("End time must be after existing start time");
        }
      }

      queryRunner = await DatabaseService.createTransaction();

      await queryRunner.manager.update(Event, id, updateData);

      await DatabaseService.commitTransaction(queryRunner);

      return this.findById(id) as Promise<Event>;
    } catch (error) {
      if (queryRunner) {
        await DatabaseService.rollbackTransaction(queryRunner);
      }
      this.logger.error(`Error updating event with ID ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    let queryRunner: QueryRunner | null = null;

    try {
      const event = await this.findById(id);
      if (!event) {
        throw new Error("Event not found");
      }

      queryRunner = await DatabaseService.createTransaction();

      await queryRunner.manager.delete(EventParticipant, { eventId: id });

      await queryRunner.manager.delete(Event, id);

      await DatabaseService.commitTransaction(queryRunner);
    } catch (error) {
      if (queryRunner) {
        await DatabaseService.rollbackTransaction(queryRunner);
      }
      this.logger.error(`Error deleting event with ID ${id}:`, error);
      throw error;
    }
  }

  async addParticipant(eventId: number, employeeId: number, status: string = ParticipationStatus.INVITED): Promise<EventParticipant> {
    let queryRunner: QueryRunner | null = null;

    try {
      const event = await this.eventRepository.findOneBy({ id: eventId });
      if (!event) {
        throw new Error("Event not found");
      }

      const employee = await this.employeeRepository.findOneBy({ id: employeeId });
      if (!employee) {
        throw new Error("Employee not found");
      }

      const existingParticipation = await this.participantRepository.findOneBy({
        eventId,
        employeeId,
      });

      if (existingParticipation) {
        throw new Error("Employee is already a participant in this event");
      }

      queryRunner = await DatabaseService.createTransaction();

      const participant = this.participantRepository.create({
        eventId,
        employeeId,
        status,
      });

      const savedParticipant = await queryRunner.manager.save(EventParticipant, participant);

      await DatabaseService.commitTransaction(queryRunner);

      // Send invitation notification to the participant
      if (status === ParticipationStatus.INVITED) {
        const event = await this.eventRepository.findOne({
          where: { id: eventId },
          relations: ["organizer", "organizer.user"],
        });

        const employee = await this.employeeRepository.findOne({
          where: { id: employeeId },
          relations: ["user"],
        });

        if (event && employee && employee.user) {
          await this.notificationService.createNotification(NotificationTemplates.eventInvitation(event, employee.user.id));
        }
      }

      return savedParticipant;
    } catch (error) {
      if (queryRunner) {
        await DatabaseService.rollbackTransaction(queryRunner);
      }
      this.logger.error(`Error adding participant to event ${eventId}:`, error);
      throw error;
    }
  }

  async addMultipleParticipants(eventId: number, employeeIds: number[], status: string = ParticipationStatus.INVITED): Promise<EventParticipant[]> {
    let queryRunner: QueryRunner | null = null;

    try {
      const event = await this.eventRepository.findOneBy({ id: eventId });
      if (!event) {
        throw new Error("Event not found");
      }

      for (const employeeId of employeeIds) {
        const employee = await this.employeeRepository.findOneBy({ id: employeeId });
        if (!employee) {
          throw new Error(`Employee with ID ${employeeId} not found`);
        }
      }

      const existingParticipations = await this.participantRepository.findBy({ eventId });
      const existingEmployeeIds = existingParticipations.map((p) => p.employeeId);

      const newEmployeeIds = employeeIds.filter((id) => !existingEmployeeIds.includes(id));

      if (newEmployeeIds.length === 0) {
        throw new Error("All employees are already participants in this event");
      }

      queryRunner = await DatabaseService.createTransaction();

      const participants = newEmployeeIds.map((employeeId) =>
        this.participantRepository.create({
          eventId,
          employeeId,
          status,
        }),
      );

      const savedParticipants = await queryRunner.manager.save(EventParticipant, participants);

      await DatabaseService.commitTransaction(queryRunner);

      // Send invitation notifications to all new participants
      if (status === ParticipationStatus.INVITED) {
        const event = await this.eventRepository.findOne({
          where: { id: eventId },
          relations: ["organizer", "organizer.user"],
        });

        if (event) {
          for (const employeeId of newEmployeeIds) {
            const employee = await this.employeeRepository.findOne({
              where: { id: employeeId },
              relations: ["user"],
            });

            if (employee && employee.user) {
              await this.notificationService.createNotification(NotificationTemplates.eventInvitation(event, employee.user.id));
            }
          }
        }
      }

      return savedParticipants;
    } catch (error) {
      if (queryRunner) {
        await DatabaseService.rollbackTransaction(queryRunner);
      }
      this.logger.error(`Error adding multiple participants to event ${eventId}:`, error);
      throw error;
    }
  }

  async updateParticipantStatus(id: number, status: string): Promise<EventParticipant> {
    let queryRunner: QueryRunner | null = null;

    try {
      const participant = await this.participantRepository.findOne({
        where: { id },
        relations: ["event", "employee"],
      });

      if (!participant) {
        throw new Error("Event participant not found");
      }

      queryRunner = await DatabaseService.createTransaction();

      await queryRunner.manager.update(EventParticipant, id, { status });

      await DatabaseService.commitTransaction(queryRunner);

      return this.participantRepository.findOne({
        where: { id },
        relations: ["event", "employee"],
      }) as Promise<EventParticipant>;
    } catch (error) {
      if (queryRunner) {
        await DatabaseService.rollbackTransaction(queryRunner);
      }
      this.logger.error(`Error updating participant status for ID ${id}:`, error);
      throw error;
    }
  }

  async removeParticipant(eventId: number, employeeId: number): Promise<void> {
    let queryRunner: QueryRunner | null = null;

    try {
      const participant = await this.participantRepository.findOneBy({
        eventId,
        employeeId,
      });

      if (!participant) {
        throw new Error("Event participant not found");
      }

      queryRunner = await DatabaseService.createTransaction();

      await queryRunner.manager.delete(EventParticipant, {
        eventId,
        employeeId,
      });

      await DatabaseService.commitTransaction(queryRunner);
    } catch (error) {
      if (queryRunner) {
        await DatabaseService.rollbackTransaction(queryRunner);
      }
      this.logger.error(`Error removing participant from event ${eventId}:`, error);
      throw error;
    }
  }
}
