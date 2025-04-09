import { Employee } from "./employee";

export interface CreateRecognitionDto {
  recognizedBy: { id: number };
  recognizedEmployee: { id: number };
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
