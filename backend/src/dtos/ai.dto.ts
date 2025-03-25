import { IsNumber, IsString, IsEnum, IsArray, IsNotEmpty } from "class-validator";

export enum WorkMode {
  REMOTE = "remote",
  HYBRID = "hybrid",
  OFFICE = "office"
}

export class AttritionRequestDto {
  @IsNumber()
  @IsNotEmpty()
  age!: number;

  @IsString()
  @IsNotEmpty()
  region!: string;

  @IsEnum(WorkMode)
  @IsNotEmpty()
  work_mode!: WorkMode;

  @IsString()
  @IsNotEmpty()
  department!: string;

  @IsNumber()
  @IsNotEmpty()
  duration!: number;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  skills!: string[];
}

export class AttritionResponseDto {
  attrition_probability!: number;
  risk_level!: string;
  assessment!: string;
} 