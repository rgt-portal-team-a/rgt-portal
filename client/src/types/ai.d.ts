import { WorkType } from "./employee"; 

export interface AttritionRequestInterface {
  age: number;
  region: string;
  work_mode: WorkType;
  department: string;
  duration: number;
  skills: string[];
}

export interface AttritionResponseDto {
  attrition_probability: number;
  risk_level: string;
  assessment: string;
}

export interface StageData {
  stage: string;
  value: string;
  color: string;
}

export interface ConversionRateInterface{
    stageData: StageData[]
}
export interface DropoutRateInterface{
    dropoutData: StageData[]
}

export interface HeadCountData {
  workType: string;
  count: string;
  color: string;
}

export interface HeadcountByWorkTypeInterface {
  headcountData: HeadCountData[];
}

export interface AgencyResponseData {
  name: string;
  value: string;
  percent: string;
  color: string;
}

export interface NspCountData{
    year: string;
    value: string;
}


export interface HiringLadderInterface {
  agencyData: AgencyResponseData[];
  nspCountData: NspCountData[];
}

export interface HiringTrendsData{
  month: string,
  count: string,
}


export interface EmployeeCountData{
    department: string;
    count: string;
}

export interface EmployeeCountByDepartmentInterface {
  employeeCountData: EmployeeCountData[];
  totalEmployeeCount: number;
}



export interface SuccessData {
  source: string;
  hires: string;
}
export interface SourceHireSuccessRateInterface {
  successData: SuccessData[];
}


export interface HiringQueryParams{
  startDate: string;
  endDate: string;
}

export interface JobMatch {
  id: string;
  candidateId: string;
  jobTitle: string;
  matchPercentage: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}



export const RECRUITMENT_TYPES = {
  NSS : "nss",
  EMPLOYEE : "employee"
}

export const RECRUITMENT_STATUS_TYPES = {
  CV_REVIEW : "CV Review",
  FIRST_INTERVIEW : "1st Interview",
  ONLINE_EXAMS : "Online Exams",
  HOME_ASSIGNMENT : "Home Assignment",
  TECHNICAL_INTERVIEW : "Technical Interview",
  CONTRACT_TERMS : "Contract Terms",
  CUSTOMER_INTERVIEW : "Customer Interview",
  FACE_TO_FACE_INTERVIEW : "Face to face Interview",
  HIRED : "Hired",
  NOT_HIRED : "Not Hired",
  CONSIDER_FOR_FUTURE : "Consider for Future",
  ON_HOLD : "On Hold",
  IN_QUESTION : "In Question",
  QUIT : "Quit",
  FIRED : "Fired",
}

export const FailStage = {
  CV_REVIEW: "CV Review",
  FIRST_INTERVIEW : "1st Interview",
  ONLINE_EXAMS : "Online Exams",
  HOME_ASSIGNMENT = "Home Assignment",
  TECHNICAL_INTERVIEW = "Technical Interview",
  CONTRACT_TERMS = "Contract Terms",
  CUSTOMER_INTERVIEW = "Customer Interview",
}

export type RecruitmentType =
  (typeof RECRUITMENT_TYPES)[keyof typeof RECRUITMENT_TYPES];

export type RecruitmentStatusType =
  (typeof RECRUITMENT_STATUS_TYPES)[keyof typeof RECRUITMENT_STATUS_TYPES];

export interface CandidateDetails {
  id: string;
  name: string;
  photoUrl: string | null;
  date: string;
  email: string;
  phoneNumber: string;
  cvPath: string | null;
  programOfStudy: string | null;
  type: RecruitmentType;
  currentStatus: RecruitmentStatusType;
  statusDueDate: string;
  assignee: string | null;
  notified: boolean | null;
  location: string;
  firstPriority: string | null;
  secondPriority: string | null;
  university: string;
  position: string;
  source: string;
  currentTitle: string;
  highestDegree: string;
  graduationYear: string;
  technicalSkills: string[];
  programmingLanguages: string[];
  toolsAndTechnologies: string[];
  softSkills: string[];
  industries: string[];
  certifications: string[] | null;
  keyProjects: string[];
  recentAchievements: string[] | null;
  failStage: string | null;
  failReason: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}


export interface JobMatchResultsResponse {
  jobMatchResults: JobMatch[];
  candidateDetails: CandidateDetails[];
}

