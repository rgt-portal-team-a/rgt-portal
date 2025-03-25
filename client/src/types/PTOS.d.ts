import { Employee } from "./employee";

export interface PTORequest {
  employee_id: string;
  department_id: string;
}

interface PtoLeave {
  id?: number;
  startDate: Date;
  endDate: Date;
  type: string;
  reason?: string;
  approverId?: number;
  createdAt?: Date;
  status?: string;
  statusReason?: string;
  department_id?: string;
  employee?: Employee;
  approver?: Employee;
}
