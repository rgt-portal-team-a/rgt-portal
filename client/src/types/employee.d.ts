/* eslint-disable @typescript-eslint/no-explicit-any */
// import { ClassNameValue } from "tailwind-merge";
import { Poll } from "./polls";
import { User } from "./authUser";
import { Department } from "./department";
import { LEAVE_TYPES, WORK_TYPES, EMPLOYEE_TYPES, ROLE_TYPES } from "@/constants";
import { PTORequest } from "./PTOS";

interface IDepartmentCard {
  id: string | number;
  employees: Employee[];
  name: string;
  leadName?: string;
  includeBgImg?: boolean;
}

// interface IDepartmentMembers {
//   id: number;
//   name: string;
//   avtr: { url: string; fallBack: string };
//   department: string;
//   role: string;
// }

interface IFeed {
  poll?: Poll;
  post?: IPost;
  postId?: number;
}

interface IAnnouncementCard {
  title: string;
  date: Date;
}

interface IAvtrComponent {
  className?: ClassNameValue;
  index?: number;
  url: string;
  name: string;
}

interface EmployeeCardType {
  id: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  imgSrc: string;
}


// export type EmployeeType = "full_time" | "part_time" | "contractor" | "nsp"

// enum LeaveType {
//   QUIT = "quit",
//   LAYOFF = "layoff",
//   DISMISSED = "dismissed",
//   OTHER = "other",
// }


// export type WorkType =  "hybrid" | "remote"



export type EmployeeType = (typeof EMPLOYEE_TYPES)[keyof typeof EMPLOYEE_TYPES];
export type WorkType = (typeof WORK_TYPES)[keyof typeof WORK_TYPES];
export type LeaveType = (typeof LEAVE_TYPES)[keyof typeof LEAVE_TYPES];
export type RoleType = (typeof ROLE_TYPES)[keyof typeof ROLE_TYPES];





export interface Employee {
  id: number;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  birthDate?: Date | null;
  skills?: string[] | null;
  photoUrl?: string | null;
  role?: ROLE_TYPES | null;
  employeeType?: EmployeeType | null;
  workType?: WorkTypes | null;
  isJuniorTeamLead?: boolean;
  isSeniorTeamLead?: boolean;
  position: string | null;
  agency?: Agency | null;
  hireDate: Date | null;
  endDate?: Date | null;
  sickDaysBalance: number;
  annualDaysOff: number;
  vacationDaysBalance: number;
  leaveType?: LeaveType | null;
  leaveExplanation?: string | null;
  contactDetails: Record<string, any> | null;
  activePtoRequest?: boolean;
  givenRecognitions?: EmployeeRecognition[];
  receivedRecognitions?: EmployeeRecognition[];
  user?: User;
  department: Department;
  departmentId: number | null;
  notes?: string| null;

  ptoRequests?: PTORequest[];
  projectAssignments?: ProjectAssignment[];
  posts?: Post[];
  organizedEvents?: Event[];
  eventParticipations?: EventParticipant[];
  attendanceRecords?: AttendanceRecord[];
  createdPolls?: Poll[];
  pollVotes?: PollVote[];
}


export interface Agency {
  name: string;
  paid: boolean;
  invoiceReceived: boolean;
  invoiceAmount?: number;
  invoiceNumber?: string;
  invoiceDate?: Date;
  invoiceDueDate?: Date;
}

export interface UserReference {
  id: number;
}



export interface CreateEmployeeInterface {
  user: UserReference;
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthDate?: Date;
  departmentId?: number;
  position?: string;
  hireDate?: Date;
  contactDetails?: Record<string, any> | null;
  agency?: Agency;
}

export interface UpdateEmployeeInterface extends CreateEmployeeInterface {
  isJuniorTeamLead?: boolean;
  isSeniorTeamLead?: boolean;
  sickDaysBalance?: number;
  vacationDaysBalance?: number;
  annualDaysOff?: number;
  leaveType?: LeaveType;
  leaveExplanation?: string;
  employeeType?: EmployeeType;
  workType?: WorkType;
  endDate?: Date;
  skills?: string[] | null;
  notes?: string;
  roleId?: number;
  department?: Department;
}
