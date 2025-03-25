import { IsNotEmpty, IsNumber, IsString, IsDateString, IsOptional, IsEnum, ValidateNested, IsArray } from "class-validator";
import { Type } from "class-transformer";

export enum ProjectStatus {
  PLANNING = "planning",
  IN_PROGRESS = "in_progress",
  ON_HOLD = "on_hold",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export class CreateProjectDto {
  @IsNotEmpty()
  @IsNumber()
  leadId!: number;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsDateString()
  startDate!: string;

  @IsNotEmpty()
  @IsDateString()
  endDate!: string;

  @IsNotEmpty()
  @IsEnum(ProjectStatus)
  status!: ProjectStatus;
}

export class UpdateProjectDto {
  @IsOptional()
  @IsNumber()
  leadId?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;
}

export class ProjectAssignmentDto {
  @IsNotEmpty()
  @IsNumber()
  employeeId!: number;

  @IsNotEmpty()
  @IsString()
  role!: string;
}

export class AddEmployeeToProjectDto {
  @IsNotEmpty()
  @IsNumber()
  employeeId!: number;

  @IsNotEmpty()
  @IsString()
  role!: string;
}

export class AddEmployeesToProjectDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectAssignmentDto)
  assignments!: ProjectAssignmentDto[];
}

export class UpdateEmployeeRoleDto {
  @IsNotEmpty()
  @IsNumber()
  employeeId!: number;

  @IsNotEmpty()
  @IsString()
  newRole!: string;
}
