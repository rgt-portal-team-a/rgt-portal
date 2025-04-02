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
  type: string;
  count: string;
  color: string;
}

export interface HeadcountByWorkTypeInterface {
  headCountData: HeadCountData[];
}



export interface SuccessData {
  source: string;
  hires: string;
}
export interface SourceHireSuccessRateInterface {
  successData: SuccessData[];
}