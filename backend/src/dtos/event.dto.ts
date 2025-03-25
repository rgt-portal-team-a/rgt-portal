import { IsNotEmpty, IsString, IsDate, IsEnum, IsNumber, IsOptional, Length, ValidateIf, IsArray, ArrayNotEmpty } from "class-validator";
import { Type } from "class-transformer";
import { EventType } from "@/defaults/enum";

export enum ParticipationStatus {
  INVITED = "invited",
  CONFIRMED = "confirmed",
  DECLINED = "declined",
  TENTATIVE = "tentative",
}

export class CreateEventDto {
  @IsNotEmpty({ message: "Event title is required" })
  @IsString({ message: "Event title must be a string" })
  @Length(2, 100, { message: "Event title must be between 2 and 100 characters" })
  title!: string;

  @IsOptional()
  @IsString({ message: "Description must be a string" })
  @Length(0, 1000, { message: "Description cannot exceed 1000 characters" })
  description?: string;

  @IsNotEmpty({ message: "Start time is required" })
  @IsDate({ message: "Start time must be a valid date" })
  @Type(() => Date)
  startTime!: Date;

  @IsNotEmpty({ message: "End time is required" })
  @IsDate({ message: "End time must be a valid date" })
  @Type(() => Date)
  endTime!: Date;

  @IsNotEmpty({ message: "Event type is required" })
  @IsEnum(EventType, { message: "Invalid event type" })
  type!: EventType;

  @IsOptional()
  @IsString({ message: "Location must be a string" })
  @Length(2, 200, { message: "Location must be between 2 and 200 characters" })
  location?: string;

  @IsNotEmpty({ message: "Organizer ID is required" })
  @IsNumber({}, { message: "Organizer ID must be a number" })
  organizerId!: number;
}

export class UpdateEventDto {
  @IsOptional()
  @IsString({ message: "Event title must be a string" })
  @Length(2, 100, { message: "Event title must be between 2 and 100 characters" })
  title?: string;

  @IsOptional()
  @IsString({ message: "Description must be a string" })
  @Length(0, 1000, { message: "Description cannot exceed 1000 characters" })
  description?: string;

  @IsOptional()
  @IsDate({ message: "Start time must be a valid date" })
  @Type(() => Date)
  startTime?: Date;

  @IsOptional()
  @IsDate({ message: "End time must be a valid date" })
  @Type(() => Date)
  endTime?: Date;

  @IsOptional()
  @IsEnum(EventType, { message: "Invalid event type" })
  type?: EventType;

  @IsOptional()
  @IsString({ message: "Location must be a string" })
  @Length(2, 200, { message: "Location must be between 2 and 200 characters" })
  location?: string;

  @IsOptional()
  @IsNumber({}, { message: "Organizer ID must be a number" })
  organizerId?: number;
}

export class CreateEventParticipantDto {
  @IsNotEmpty({ message: "Event ID is required" })
  @IsNumber({}, { message: "Event ID must be a number" })
  eventId!: number;

  @IsNotEmpty({ message: "Employee ID is required" })
  @IsNumber({}, { message: "Employee ID must be a number" })
  employeeId!: number;

  @IsNotEmpty({ message: "Status is required" })
  @IsEnum(ParticipationStatus, { message: "Invalid participation status" })
  status!: string;
}

export class UpdateEventParticipantDto {
  @IsOptional()
  @IsEnum(ParticipationStatus, { message: "Invalid participation status" })
  status?: string;
}

export class AddParticipantsDto {
  @IsNotEmpty({ message: "Event ID is required" })
  @IsNumber({}, { message: "Event ID must be a number" })
  eventId!: number;

  @IsNotEmpty({ message: "Employee IDs are required" })
  @IsArray({ message: "Employee IDs must be an array" })
  @ArrayNotEmpty({ message: "At least one employee ID is required" })
  employeeIds!: number[];

  @IsOptional()
  @IsEnum(ParticipationStatus, { message: "Invalid participation status" })
  status?: string = ParticipationStatus.INVITED;
}
