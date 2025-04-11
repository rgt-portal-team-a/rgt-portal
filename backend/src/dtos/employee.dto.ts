import { User } from "@/entities/user.entity";
import { Department } from "@/entities/department.entity";
import { EmployeeType, WorkType, LeaveType, Agency } from "@/entities/employee.entity";
import { IsNotEmpty, IsString, IsDate, IsEnum, IsNumber, IsOptional, Length, ValidateIf, IsArray, ArrayNotEmpty, IsObject, IsBoolean } from "class-validator";
import { Type } from "class-transformer";

export class CreateEmployeeDto {
  @IsNotEmpty({ message: "User is required" })
  @IsObject({ message: "User must be an object" })
  user!: { id: number };

  @IsOptional()
  @IsString({ message: "First name must be a string" })
  firstName?: string;

  @IsOptional()
  @IsString({ message: "Last name must be a string" })
  lastName?: string;

  @IsOptional()
  @IsString({ message: "Phone must be a string" })
  phone?: string;

  @IsOptional()
  @IsNumber({}, { message: "Department ID must be a number" })
  departmentId?: number;

  @IsOptional()
  @IsString({ message: "Position must be a string" })
  position?: string;

  @IsOptional()
  @IsDate({ message: "Hire date must be a valid date" })
  hireDate?: Date;

  @IsOptional()
  @IsDate({ message: "Birth date must be a valid date" })
  birthDate?: Date;

  @IsOptional()
  @IsObject({ message: "Contact details must be an object" })
  contactDetails?: Record<string, any>;

  @IsOptional()
  @IsEnum(EmployeeType, { message: "Employee type must be a valid employee type" })
  employeeType?: EmployeeType;

  @IsOptional()
  @IsObject({ message: "Agency must be an object" })
  agency?: Agency;
}

export class UpdateEmployeeDto extends CreateEmployeeDto {
  @IsOptional()
  @IsNumber({}, { message: "Sick days balance must be a number" })
  sickDaysBalance?: number;

  @IsOptional()
  @IsNumber({}, { message: "Vacation days balance must be a number" })
  vacationDaysBalance?: number;

  @IsOptional()
  @IsNumber({}, { message: "Annual days off must be a number" })
  annualDaysOff?: number;

  @IsOptional()
  @IsEnum(LeaveType, { message: "Leave type must be a valid leave type" })
  leaveType?: LeaveType;

  @IsOptional()
  @IsString({ message: "Leave explanation must be a string" })
  leaveExplanation?: string;

  @IsOptional()
  @IsEnum(EmployeeType, { message: "Employee type must be a valid employee type" })
  employeeType?: EmployeeType;

  @IsOptional()
  @IsEnum(WorkType, { message: "Work type must be a valid work type" })
  workType?: WorkType;

  @IsOptional()
  @IsObject({ message: "Agency must be an object" })
  agency?: Agency;

  @IsOptional()
  @IsBoolean({ message: "Junior team lead must be a boolean" })
  isJuniorTeamLead?: boolean;

  @IsOptional()
  @IsBoolean({ message: "Is team lead must be a boolean" })
  isSeniorTeamLead?: boolean;

  @IsOptional()
  @IsDate({ message: "End date must be a valid date" })
  endDate?: Date;

  @IsOptional()
  @IsArray({ message: "Skills must be an array" })
  skills?: string[];

  @IsOptional()
  @IsString({ message: "Position must be a string" })
  position?: string;

  @IsOptional()
  @IsObject({ message: "Department must be an object" })
  department?: Department;

  @IsOptional()
  @IsString({ message: "Notes must be a string" })
  notes?: string;

  @IsOptional()
  @IsNumber({}, { message: "Role ID must be a number" })
  roleId?: number;
}

export class UpdateAgencyDto {
  @IsNotEmpty({ message: "Agency is required" })
  @IsObject({ message: "Agency must be an object" })
  agency!: Agency;
}
