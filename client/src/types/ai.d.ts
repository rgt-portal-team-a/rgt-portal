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