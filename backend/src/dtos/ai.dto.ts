import { IsNumber, IsString, IsEnum, IsArray, IsNotEmpty, IsOptional, IsObject, IsDate, IsBoolean } from "class-validator";
import { Type } from "class-transformer";
import { RecruitmentType, RecruitmentStatus, FailStage } from "@/defaults/enum";

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

export class JobMatchDto {
  @IsString()
  @IsNotEmpty()
  position!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  required_skills!: string[];

  @IsNumber()
  @IsNotEmpty()
  match_percentage!: number;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsEnum(RecruitmentType)
  @IsNotEmpty()
  type!: RecruitmentType;
}

export class CandidateMatchRequestDto {
  @IsString()
  @IsNotEmpty()
  candidate_id!: string;
}

export class CandidateMatchResponseDto {
  @IsString()
  @IsNotEmpty()
  candidate_id!: string;

  @IsObject()
  @IsNotEmpty()
  matched_job!: {
    id: string;
    position: string;
    description: string;
    required_skills: string[];
    match_percentage: number;
    department?: string;
    location?: string;
    type: RecruitmentType;
  };

  @IsString()
  @IsNotEmpty()
  timestamp!: string;
}

export class CvExtractionRequestDto {
  @IsNotEmpty()
  file!: Express.Multer.File;
}

export class CvExtractionResponseDto {
  @IsString()
  @IsNotEmpty()
  candidate_id!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsDate()
  @IsOptional()
  date?: Date;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  programOfStudy?: string;

  @IsEnum(RecruitmentStatus)
  @IsNotEmpty()
  currentStatus!: RecruitmentStatus;

  @IsDate()
  @IsOptional()
  statusDueDate?: Date;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  firstPriority?: string;

  @IsString()
  @IsOptional()
  secondPriority?: string;

  @IsString()
  @IsOptional()
  university?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  currentTitle?: string;

  @IsString()
  @IsOptional()
  highestDegree?: string;

  @IsString()
  @IsOptional()
  graduationYear?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  technicalSkills?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  programmingLanguages?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  toolsAndTechnologies?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  softSkills?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  industries?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  certifications?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keyProjects?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  recentAchievements?: string[];

  @IsEnum(FailStage)
  @IsOptional()
  failStage?: FailStage;

  @IsString()
  @IsOptional()
  failReason?: string;

  @IsString()
  @IsOptional()
  notes?: string;
} 