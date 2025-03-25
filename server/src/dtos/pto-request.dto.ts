import { IsNotEmpty, IsString, IsDate, IsEnum, IsNumber, IsOptional, Length, ValidateIf, IsArray, ArrayNotEmpty } from "class-validator";
import { PtoStatusType } from "@/defaults/enum";

export class CreatePtoRequestDto {
  @IsNotEmpty()
  @IsDate()
  startDate!: Date;

  @IsNotEmpty()
  @IsDate()
  endDate!: Date;

  @IsNotEmpty()
  @IsString()
  type!: string; // "vacation", "sick", "personal"

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsNumber()
  approverId?: number;
}

export class UpdatePtoRequestDto {
  @IsEnum(PtoStatusType)
  status!: PtoStatusType;

  @IsOptional()
  @IsNumber()
  departmentId?: number;

  @IsOptional()
  @IsNumber()
  approver?: { id: number };

  @IsOptional()
  @IsString()
  statusReason?: string;
}
