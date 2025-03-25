import { describe, it, expect, beforeEach, afterEach, Mock, vi } from "vitest";
import { EventService } from "@/services/event.service";
import { mockEmployee, createMockRepository, setupTestDatabase, teardownTestDatabase } from "../utils/test-utils";
import { AppDataSource } from "@/database/data-source";
import { Event } from "@/entities/event.entity";
import { Employee } from "@/entities/employee.entity";
import { EventParticipant } from "@/entities/event-participant.entity";
import { DatabaseService } from "@/services/database.service";
import { EventType } from "@/defaults/enum";
import { Not } from "typeorm";

describe("EventService", () => {
  let eventService: EventService;
  let eventRepository: any;
  let employeeRepository: any;
  let participantRepository: any;
  let notificationServiceMock: any;
  let loggerMock: any;
  let queryRunnerMock: any;

  beforeEach(async () => {
    await setupTestDatabase();

    eventRepository = {
      ...createMockRepository<Event>(),
      findOneBy: vi.fn(),
    };
    employeeRepository = {
      ...createMockRepository<Employee>(),
      findOneBy: vi.fn(),
    };
    participantRepository = {
      ...createMockRepository<EventParticipant>(),
      findOneBy: vi.fn(),
    };

    notificationServiceMock = {
      createNotification: vi.fn().mockResolvedValue({}),
    };

    loggerMock = {
      error: vi.fn(),
      info: vi.fn(),
      debug: vi.fn(),
    };

    queryRunnerMock = {
      manager: {
        save: vi.fn().mockImplementation((_, entity) => Promise.resolve({ ...entity, id: 1 })),
        update: vi.fn().mockResolvedValue({ affected: 1 }),
        delete: vi.fn().mockResolvedValue({ affected: 1 }),
      },
      commitTransaction: vi.fn().mockResolvedValue(undefined),
      rollbackTransaction: vi.fn().mockResolvedValue(undefined),
      release: vi.fn().mockResolvedValue(undefined),
    };

    vi.spyOn(DatabaseService, "createTransaction").mockResolvedValue(queryRunnerMock);
    vi.spyOn(DatabaseService, "commitTransaction").mockResolvedValue(undefined);
    vi.spyOn(DatabaseService, "rollbackTransaction").mockResolvedValue(undefined);

    (AppDataSource.getRepository as Mock).mockImplementation((entity: any) => {
      if (entity === Event) return eventRepository;
      if (entity === Employee) return employeeRepository;
      if (entity === EventParticipant) return participantRepository;
      return null;
    });

    eventService = new EventService();
    // Replace notification service and logger with mocks
    (eventService as any).notificationService = notificationServiceMock;
    (eventService as any).logger = loggerMock;
  });

  afterEach(async () => {
    await teardownTestDatabase();
    vi.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return all events", async () => {
      const events = [
        {
          id: 1,
          title: "Team Meeting",
          description: "Weekly team meeting",
          startTime: new Date(),
          endTime: new Date(),
          location: "Conference Room",
          organizer: mockEmployee,
          participants: [{ employee: mockEmployee }],
        },
      ];
      eventRepository.find.mockResolvedValue(events);

      const result = await eventService.findAll();

      expect(result).toEqual(events);
      expect(eventRepository.find).toHaveBeenCalledWith({
        relations: ["organizer"],
        order: { startTime: "DESC" },
      });
    });
  });

  describe("findById", () => {
    it("should return event by id", async () => {
      const event = {
        id: 1,
        title: "Team Meeting",
        description: "Weekly team meeting",
        startTime: new Date(),
        endTime: new Date(),
        location: "Conference Room",
        organizer: mockEmployee,
        participants: [{ employee: mockEmployee }],
      };
      eventRepository.findOne.mockResolvedValue(event);

      const result = await eventService.findById(1);

      expect(result).toEqual(event);
      expect(eventRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ["organizer", "participants", "participants.employee"],
      });
    });

    it("should return null if event not found", async () => {
      eventRepository.findOne.mockResolvedValue(null);

      const result = await eventService.findById(1);
      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create a new event", async () => {
      const startTime = new Date();
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1); // Make sure end time is after start time

      const createData = {
        title: "New Event",
        description: "Event description",
        startTime,
        endTime,
        location: "Meeting Room",
        organizerId: 1,
        type: EventType.TRAINING,
      };

      const mockOrganizer = { ...mockEmployee, user: { id: 1 } };
      employeeRepository.findOne.mockResolvedValue(mockOrganizer);

      // Mock the find call for all employees
      employeeRepository.find.mockResolvedValue([
        { ...mockEmployee, id: 2, user: { id: 2 } },
        { ...mockEmployee, id: 3, user: { id: 3 } },
      ]);

      eventRepository.create.mockReturnValue({
        ...createData,
        organizer: mockOrganizer,
      });

      const savedEvent = { ...createData, id: 1, organizer: mockOrganizer };
      eventRepository.findOne.mockResolvedValueOnce(savedEvent);

      const result = await eventService.create(createData);

      expect(employeeRepository.findOne).toHaveBeenCalledWith({
        where: { id: createData.organizerId },
        relations: ["user"],
      });
      expect(employeeRepository.find).toHaveBeenCalledWith({
        relations: ["user"],
        where: {
          id: Not(mockOrganizer.id),
        },
      });
      expect(eventRepository.create).toHaveBeenCalledWith({
        ...createData,
        organizer: mockOrganizer,
      });
      expect(queryRunnerMock.manager.save).toHaveBeenCalled();
      expect(notificationServiceMock.createNotification).toHaveBeenCalled();
      expect(result).toEqual(savedEvent);
    });

    it("should throw error if organizer not found", async () => {
      const createData = {
        title: "New Event",
        organizerId: 1,
        startTime: new Date(),
        endTime: new Date(),
        type: EventType.ANNOUNCEMENT,
      };
      employeeRepository.findOne.mockResolvedValue(null);

      await expect(eventService.create(createData)).rejects.toThrow("Organizer not found");
    });

    it("should throw error if end time is before start time", async () => {
      const endTime = new Date();
      const startTime = new Date(endTime);
      startTime.setHours(startTime.getHours() + 1); // Make startTime after endTime

      const createData = {
        title: "New Event",
        organizerId: 1,
        startTime,
        endTime,
        type: EventType.ANNOUNCEMENT,
      };

      employeeRepository.findOne.mockResolvedValue(mockEmployee);

      await expect(eventService.create(createData)).rejects.toThrow("End time must be after start time");
    });
  });

  describe("update", () => {
    it("should update event", async () => {
      const updateData = {
        title: "Updated Event",
        description: "Updated description",
        organizerId: 2,
      };

      const originalEvent = {
        id: 1,
        title: "Original Event",
        startTime: new Date("2023-01-01T10:00:00"),
        endTime: new Date("2023-01-01T12:00:00"),
        organizerId: 1,
        organizer: mockEmployee,
        participants: [{ employee: mockEmployee }],
      };

      const updatedEvent = {
        ...originalEvent,
        ...updateData,
        organizer: { ...mockEmployee, id: 2 },
      };

      // Mock the findOne calls in sequence
      eventRepository.findOne
        .mockResolvedValueOnce(originalEvent) // First call for finding the event
        .mockResolvedValueOnce(updatedEvent); // Second call after update

      // Mock the employee lookup with findOneBy
      employeeRepository.findOneBy.mockResolvedValue({ ...mockEmployee, id: 2 });

      const result = await eventService.update(1, updateData);

      expect(result).toEqual(updatedEvent);
      expect(eventRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ["organizer", "participants", "participants.employee"],
      });
      expect(employeeRepository.findOneBy).toHaveBeenCalledWith({ id: updateData.organizerId });
      expect(queryRunnerMock.manager.update).toHaveBeenCalledWith(Event, 1, updateData);
    });

    it("should throw error if event not found", async () => {
      const updateData = {
        title: "Updated Event",
      };
      eventRepository.findOne.mockResolvedValue(null);

      await expect(eventService.update(1, updateData)).rejects.toThrow("Event not found");
    });

    it("should throw error if new organizer not found", async () => {
      const updateData = {
        title: "Updated Event",
        organizerId: 2,
      };
      eventRepository.findOne.mockResolvedValue({
        id: 1,
        title: "Original Event",
        startTime: new Date(),
        endTime: new Date(),
        organizerId: 1,
      });
      employeeRepository.findOneBy.mockResolvedValue(null);

      await expect(eventService.update(1, updateData)).rejects.toThrow("Organizer not found");
    });
  });

  describe("delete", () => {
    it("should delete event", async () => {
      eventRepository.findOne.mockResolvedValue({
        id: 1,
        title: "Event to Delete",
      });

      await eventService.delete(1);

      expect(eventRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ["organizer", "participants", "participants.employee"],
      });
      expect(queryRunnerMock.manager.delete).toHaveBeenCalledWith(EventParticipant, { eventId: 1 });
      expect(queryRunnerMock.manager.delete).toHaveBeenCalledWith(Event, 1);
    });

    it("should throw error if event not found", async () => {
      eventRepository.findOne.mockResolvedValue(null);

      await expect(eventService.delete(1)).rejects.toThrow("Event not found");
    });
  });
});
