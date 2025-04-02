export interface Project {
  id: number;
  leadId: number;
  name: string;
  description?: string; 
  startDate: Date;
  endDate: Date;
  status: string;
  lead: Employee;
  assignments: ProjectAssignment[];
}

interface ProjectAssignment {
  id: number;
  projectId: number;
  employeeId: number;
  assignedDate: Date;
  role: string;
  project: Project;
  employee: Employee;
}

interface ProjectQueryParams {
  includeAssignment?: boolean;
}