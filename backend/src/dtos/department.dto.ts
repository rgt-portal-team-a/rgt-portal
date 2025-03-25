import { IsNotEmpty, IsNumber, IsString, IsOptional, Length, ValidateIf, IsArray, ArrayNotEmpty } from "class-validator";

export class CreateDepartmentDto {
  @IsNotEmpty({ message: "Department name is required" })
  @IsString({ message: "Department name must be a string" })
  @Length(2, 100, { message: "Department name must be between 2 and 100 characters" })
  name!: string;

  @IsOptional()
  @IsString({ message: "Description must be a string" })
  @Length(0, 500, { message: "Description cannot exceed 500 characters" })
  description?: string;

  @IsNotEmpty({ message: "Manager ID is required" })
  @IsNumber({}, { message: "Manager ID must be a number" })
  managerId!: number;
}

export class UpdateDepartmentDto {
  @IsOptional()
  @IsString({ message: "Department name must be a string" })
  @Length(2, 100, { message: "Department name must be between 2 and 100 characters" })
  name?: string;

  @IsOptional()
  @IsString({ message: "Description must be a string" })
  @Length(0, 500, { message: "Description cannot exceed 500 characters" })
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: "Manager ID  must be a number" })
  managerId?: number;
}

export class TransferEmployeesDto {
  @IsNotEmpty({ message: "Source department ID is required" })
  @IsNumber({}, { message: "Source department ID must be a number" })
  fromDepartmentId!: number;

  @IsNotEmpty({ message: "Target department ID is required" })
  @IsNumber({}, { message: "Target department ID must be a number" })
  toDepartmentId!: number;
}

export class AddEmployeeToDepartmentDto {
  @IsNotEmpty({ message: "Employee ID is required" })
  @IsNumber({}, { message: "Employee ID must be a number" })
  employeeId!: number;
}

export class AddEmployeesToDepartmentDto {
  @IsNotEmpty({ message: "Employee IDs are required" })
  @IsArray({ message: "Employee IDs must be an array" })
  @ArrayNotEmpty({ message: "At least one employee ID is required" })
  employeeIds!: number[];
}
