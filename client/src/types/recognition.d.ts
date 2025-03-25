import {Project} from "./project"
import {Employee} from "./employee"

export interface CreateRecognitionDto {
  recognizedById: number;
  recognizedEmployeeId: number;
  project?: string;
  category?: string;
  message: string;
}


export interface EmployeeRecognition {
  id: number;
  recognizedBy: Employee;
  recognizedEmployee: Employee;
  project?: string;
  category?: string;
  message: string;
  createdAt: Date;
}
