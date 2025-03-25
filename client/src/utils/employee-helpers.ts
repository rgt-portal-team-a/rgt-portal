import { Employee, EmployeeType } from "@/types/employee";

export const employeeTypeLabels: Record<EmployeeType, string> = {
  full_time: "FT",
  part_time: "PT",
  contractor: "FT",
  nsp: "PT",
};

export const calculateSeniority = (date: Date | null): string => {
  if (!date) return "N/A";
  const now = new Date();
  const diffInYears = Math.floor(
    (now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24 * 365)
  );
  return `${diffInYears} years`;
};

export const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

export const isOnLeave = (leaveType: string | null | undefined): boolean => {
  return !!leaveType;
};

export const getEmployeeFieldValue = (
  employee: Employee | null | undefined,
  field: string
): string => {
  if (!employee) return "";

  const fieldMappings: Record<string, (emp: Employee) => string> = {
    name: (emp) => `${emp.firstName || ""} ${emp.lastName || ""}`.trim(),
    email: (emp) => emp.user?.email || "",
    phoneNumber: (emp) => emp.phone || "",
    birthday: (emp) => emp.birthDate?.toISOString().split("T")[0] || "",
    age: (emp) => (emp.birthDate ? calculateAge(emp.birthDate).toString() : ""),
    city: (emp) => emp.contactDetails?.city || "",
    homeAddress: (emp) => emp.contactDetails?.address || "",
    region: (emp) => emp.contactDetails?.region || "",
    country: (emp) => emp.contactDetails?.country || "",
    startDate: (emp) => emp.hireDate?.toISOString().split("T")[0] || "",
    endDate: (emp) => emp.endDate?.toISOString().split("T")[0] || "",
    seniority: (emp) => calculateSeniority(emp.hireDate),
    skills: (emp) => emp.skills?.join(", ") || "",
    ftpt: (emp) => employeeTypeLabels[emp.employeeType || "full_time"] || "",
    department: (emp) => emp.department?.name || "",
    agency: (emp) => emp.agency || "",
    onLeave: (emp) => (isOnLeave(emp.leaveType) ? "On Leave" : "Active"),
  };

  if (fieldMappings[field]) {
    return fieldMappings[field](employee);
  }

  try {
    const value = (employee as any)[field];
    return value != null ? String(value) : "";
  } catch {
    console.warn(`Unhandled field: ${field}`);
    return "";
  }
};
