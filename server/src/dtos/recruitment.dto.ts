import { FailStage, RecruitmentStatus, RecruitmentType, RelationshipType } from "@/defaults/enum";

export class EmergencyContactDto {
  name!: string;
  relationship!: RelationshipType;
  phoneNumber!: string;
  address?: string;
}

export class CreateRecruitmentDto {
  name!: string;
  date?: Date;
  email!: string;
  phoneNumber?: string;
  cvPath?: string;
  photoUrl?: string;
  type?: RecruitmentType;
  currentStatus?: RecruitmentStatus;
  statusDueDate?: Date;
  assignee?: string;
  location?: string;
  firstPriority?: string;
  secondPriority?: string;
  university?: string;
  position?: string;
  source?: string;
  notes?: string;
  emergencyContacts?: EmergencyContactDto[];
  currentTitle?: string;
  highestDegree?: string;
  graduationYear?: string;
  technicalSkills?: string[];
  programmingLanguages?: string[];
  toolsAndTechnologies?: string[];
  softSkills?: string[];
  industries?: string[];
  certifications?: string[];
  keyProjects?: string[];
  recentAchievements?: string[];
  
}

export class UpdateRecruitmentDto {
  name?: string;
  date?: Date;
  email?: string;
  phoneNumber?: string;
  type?: RecruitmentType;
  assignee?: string;
  location?: string;
  firstPriority?: string;
  secondPriority?: string;
  university?: string;
  position?: string;
  source?: string;
  notes?: string;
  emergencyContacts?: EmergencyContactDto[];
  currentStatus?: RecruitmentStatus;
}

export class StatusUpdateDto {
  status!: RecruitmentStatus;
  failStage?: FailStage;
  failReason?: string;
}

export class RecruitmentFilterDto {
  name?: string;
  email?: string;
  status?: RecruitmentStatus;
  type?: string;
  assignee?: string;
  dateFrom?: Date;
  dateTo?: Date;
  createdFrom?: Date;
  createdTo?: Date;
  position?: string;
  source?: string;
  location?: string;
}
