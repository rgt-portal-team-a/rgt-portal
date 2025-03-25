import { Request, Response } from "express";
import { EventService } from "@/services/event.service";
import { ApiResponse } from "@/dtos/response.dto";
import { Logger } from "@/services/logger.service";
import { CreateEventDto, UpdateEventDto, AddParticipantsDto, ParticipationStatus } from "@/dtos/event.dto";

export class EventController {
  private eventService: EventService;
  private logger: Logger;

  constructor() {
    this.eventService = new EventService();
    this.logger = new Logger("EventController");
  }

  public getAllEvents = async (req: Request, res: Response): Promise<void> => {
    try {
      const includeParticipants = req.query.includeParticipants === "true";
      const relations = includeParticipants ? ["organizer", "participants", "participants.employee"] : ["organizer"];

      const events = await this.eventService.findAll(relations);

      const response: ApiResponse<typeof events> = {
        success: true,
        data: events,
        message: "Events retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error fetching events:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch events",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getEventById = async (req: Request, res: Response): Promise<void> => {
    try {
      const eventId = parseInt(req.params.id);

      if (isNaN(eventId)) {
        res.status(400).json({
          success: false,
          message: "Invalid event ID",
        });
        return;
      }

      const includeParticipants = req.query.includeParticipants === "true";
      const relations = includeParticipants ? ["organizer", "participants", "participants.employee"] : ["organizer"];

      const event = await this.eventService.findById(eventId, relations);

      if (!event) {
        res.status(404).json({
          success: false,
          message: "Event not found",
        });
        return;
      }

      const response: ApiResponse<typeof event> = {
        success: true,
        data: event,
        message: "Event retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(`Error fetching event:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch event",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getEventsByOrganizerId = async (req: Request, res: Response): Promise<void> => {
    try {
      const organizerId = parseInt(req.params.organizerId);

      if (isNaN(organizerId)) {
        res.status(400).json({
          success: false,
          message: "Invalid organizer ID",
        });
        return;
      }

      const events = await this.eventService.findByOrganizerId(organizerId);

      const response: ApiResponse<typeof events> = {
        success: true,
        data: events,
        message: "Organizer's events retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(`Error fetching organizer's events:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch organizer's events",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getEventsByEmployeeParticipation = async (req: Request, res: Response): Promise<void> => {
    try {
      const employeeId = parseInt(req.params.employeeId);

      if (isNaN(employeeId)) {
        res.status(400).json({
          success: false,
          message: "Invalid employee ID",
        });
        return;
      }

      const events = await this.eventService.findByEmployeeParticipation(employeeId);

      const response: ApiResponse<typeof events> = {
        success: true,
        data: events,
        message: "Employee's events retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(`Error fetching employee's events:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch employee's events",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getUpcomingEvents = async (req: Request, res: Response): Promise<void> => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 30;

      if (isNaN(days) || days <= 0) {
        res.status(400).json({
          success: false,
          message: "Invalid number of days",
        });
        return;
      }

      const events = await this.eventService.findUpcoming(days);

      const response: ApiResponse<typeof events> = {
        success: true,
        data: events,
        message: "Upcoming events retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(`Error fetching upcoming events:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch upcoming events",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getEventsByDateRange = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: "Start date and end date are required",
        });
        return;
      }

      const parsedStartDate = new Date(startDate as string);
      const parsedEndDate = new Date(endDate as string);

      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        res.status(400).json({
          success: false,
          message: "Invalid date format",
        });
        return;
      }

      const events = await this.eventService.findByDateRange(parsedStartDate, parsedEndDate);

      const response: ApiResponse<typeof events> = {
        success: true,
        data: events,
        message: "Events in date range retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(`Error fetching events by date range:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch events by date range",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public createEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const eventData: CreateEventDto = req.body;
      const organizerId: number = (req.user as any).employee.id;

      const newEvent = await this.eventService.create(eventData, organizerId);

      const response: ApiResponse<typeof newEvent> = {
        success: true,
        data: newEvent,
        message: "Event created successfully",
      };

      res.status(201).json(response);
    } catch (error) {
      this.logger.error(`Error creating event:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to create event",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public updateEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const eventId = parseInt(req.params.id);
      const updateData: UpdateEventDto = req.body;

      if (isNaN(eventId)) {
        res.status(400).json({
          success: false,
          message: "Invalid event ID",
        });
        return;
      }

      const updatedEvent = await this.eventService.update(eventId, updateData);

      const response: ApiResponse<typeof updatedEvent> = {
        success: true,
        data: updatedEvent,
        message: "Event updated successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(`Error updating event:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to update event",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public deleteEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const eventId = parseInt(req.params.id);

      if (isNaN(eventId)) {
        res.status(400).json({
          success: false,
          message: "Invalid event ID",
        });
        return;
      }

      await this.eventService.delete(eventId);

      res.status(200).json({
        success: true,
        message: "Event deleted successfully",
      });
    } catch (error) {
      this.logger.error(`Error deleting event:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to delete event",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public addParticipant = async (req: Request, res: Response): Promise<void> => {
    try {
      const eventId = parseInt(req.params.id);
      const employeeId = parseInt(req.params.employeeId);
      const { status } = req.body;

      if (isNaN(eventId) || isNaN(employeeId)) {
        res.status(400).json({
          success: false,
          message: "Invalid ID parameter",
        });
        return;
      }

      const participant = await this.eventService.addParticipant(eventId, employeeId, status || ParticipationStatus.INVITED);

      const response: ApiResponse<typeof participant> = {
        success: true,
        data: participant,
        message: "Participant added successfully",
      };

      res.status(201).json(response);
    } catch (error) {
      this.logger.error(`Error adding participant:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to add participant",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public addMultipleParticipants = async (req: Request, res: Response): Promise<void> => {
    try {
      const eventId = parseInt(req.params.id);
      const { employeeIds, status }: AddParticipantsDto = req.body;

      if (isNaN(eventId)) {
        res.status(400).json({
          success: false,
          message: "Invalid event ID",
        });
        return;
      }

      if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
        res.status(400).json({
          success: false,
          message: "Employee IDs array is required and must not be empty",
        });
        return;
      }

      const participants = await this.eventService.addMultipleParticipants(eventId, employeeIds, status || ParticipationStatus.INVITED);

      const response: ApiResponse<typeof participants> = {
        success: true,
        data: participants,
        message: "Participants added successfully",
      };

      res.status(201).json(response);
    } catch (error) {
      this.logger.error(`Error adding multiple participants:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to add participants",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public updateParticipantStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const participantId = parseInt(req.params.participantId);
      const { status } = req.body;

      if (isNaN(participantId)) {
        res.status(400).json({
          success: false,
          message: "Invalid participant ID",
        });
        return;
      }

      if (!status) {
        res.status(400).json({
          success: false,
          message: "Status is required",
        });
        return;
      }

      const participant = await this.eventService.updateParticipantStatus(participantId, status);

      const response: ApiResponse<typeof participant> = {
        success: true,
        data: participant,
        message: "Participant status updated successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(`Error updating participant status:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to update participant status",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public removeParticipant = async (req: Request, res: Response): Promise<void> => {
    try {
      const eventId = parseInt(req.params.id);
      const employeeId = parseInt(req.params.employeeId);

      if (isNaN(eventId) || isNaN(employeeId)) {
        res.status(400).json({
          success: false,
          message: "Invalid ID parameter",
        });
        return;
      }

      await this.eventService.removeParticipant(eventId, employeeId);

      res.status(200).json({
        success: true,
        message: "Participant removed successfully",
      });
    } catch (error) {
      this.logger.error(`Error removing participant:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to remove participant",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}
