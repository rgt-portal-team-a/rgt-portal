import { Employee } from "./employee";
import { PTOSTATUS_TYPES } from "@/constants"

export interface PTORequest {
  employee_id: string;
  department_id: string;
}

export type StatusType = (typeof PTOSTATUS_TYPES)[keyof typeof PTOSTATUS_TYPES];

export interface PtoLeave {
  id?: number;
  startDate: Date;
  endDate: Date;
  type: string;
  reason?: string;
  approverId?: number;
  createdAt?: Date;
  status?: StatusType;
  statusReason?: string;
  departmentId?: number;
  employee?: Employee;
  approver?: Employee;
}
