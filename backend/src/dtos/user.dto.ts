import { Role } from "@/entities";
import { CreateEmployeeDto } from "./employee.dto";
import { UserStatus } from "@/entities/user.entity";
import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsOptional, ValidateNested, IsString, IsObject, IsNumber } from "class-validator";

export interface CreateUserDto {
  username: string;
  email: string;
  profileImage?: string;
  role_id?: number;
  role?: { id: number };
  status?: UserStatus;
}

export interface UpdateUserDto extends Partial<CreateUserDto> {}

export interface UpdateUserAndEmployeeDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  profileImage?: string;
  username?: string;
}

export class OnboardUserDto {
  @IsNumber()
  @IsNotEmpty({ message: "User ID is required" })
  userId!: number;

  @IsObject()
  @ValidateNested()
  @Type(() => CreateEmployeeDto)
  employee!: CreateEmployeeDto;

  @IsNumber()
  @IsOptional()
  roleId?: number;
}

export class UpdateUserStatusDto {
  @IsNumber()
  @IsNotEmpty({ message: "User ID is required" })
  userId!: number;

  @IsEnum(UserStatus, { message: "Invalid status" })
  @IsNotEmpty({ message: "Status is required" })
  status!: UserStatus;

  @IsOptional()
  @IsString({ message: "Reason must be a string" })
  reason?: string;
}
