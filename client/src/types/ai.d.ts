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