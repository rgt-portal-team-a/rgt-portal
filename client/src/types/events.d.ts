import {Employee} from "./employee"
import {EventType, ParticipantStatus} from "@/constants";



export interface CreateEventDto {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  type: EventType;
  location?: string;
  organizerId?: number;
}


export interface Event {
  id: number;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  type: EventType;
  location?: string;
  organizerId: number;
  organizer: Employee;
  participants?: IEventParticipant[];
}


export interface IEventParticipant {
  id: number;
  eventId: number;
  employeeId: number;
  status: ParticipantStatus | string;
  event: Event
  employee: Employee
}


export interface DeleteEventResponse{
  success: boolean; 
  message: string
}