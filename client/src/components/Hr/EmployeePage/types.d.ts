export interface NodeData extends Record<string, unknown> {
  label: string;
  value?: string;
  isHeader?: boolean;
}

export interface EdgeData extends Record<string, unknown> {
  label?: string;
}

export interface EmployeeData {
  name: string;
  title: string;
  status: string;
  personalDetails: {
    phone: string;
    personalEmail: string;
    workEmail: string;
    location: string;
    skills: string;
  };
  workDetails: {
    startDate: string;
    department: string;
    seniority: string;
  };
}
