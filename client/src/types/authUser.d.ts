import { Employee, UpdateEmployeeInterface } from "./employee";

import {
  LEAVE_TYPES,
  WORK_TYPES,
  EMPLOYEE_TYPES,
  ROLE_TYPES,
  ALL_ROLE_NAMES,
} from "@/constants";


/* eslint-disable @typescript-eslint/no-explicit-any */
type ROLE = "HR" | "MANAGER" | "EMPLOYEE" | "ADMIN" | "MODERATOR" | "MARKETER";
export type ROLE_NAMES = (typeof ALL_ROLE_NAMES)[keyof typeof ALL_ROLE_NAMES];

interface Role {
  id: number;
  name: ROLE_NAMES;
  description: string;
}

interface ResponseUserRole {
  name: lRole;
  id: number;
  description: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  profileImage: string;
  employee: Employee;
  role: Role;
  createdAt: string;
  updatedAt: string;
  token?: string;
  firstName?: string;
  lastName?: string;
  phone?:string
}

interface ResponseUser {
  id: number;
  email: string;
  username: string;
  profileImage: string;
  employee: any | null;
  role: ResponseRole;
  createdAt: string;
  updatedAt: string;
  token?: string;
}


export interface OnboardUserDto {
  userId: number;
  employee: UpdateEmployeeInterface;
  roleId?: number;
}