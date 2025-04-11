import { Employee, UpdateEmployeeInterface } from "./employee";

import {
  LEAVE_TYPES,
  WORK_TYPES,
  EMPLOYEE_TYPES,
  ROLE_TYPES,
  ALL_ROLE_NAMES,
} from "@/constants";
import { UserStatus } from "@/lib/enums";

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
  status: UserStatus
}

interface ResponseUser {
  id: number;
  email: string;
  username: string;
  profileImage: string;
  employee: Employee ;
  role: ResponseRole;
  createdAt: string;
  updatedAt: string;
  token?: string;
  status: UserStatus;
}


export interface OnboardUserDto {
  userId: number;
  employee: UpdateEmployeeInterface;
  roleId?: number;
}

export interface UpdateUserStatus{
  userId: number;
  status: UserStatus;
  reason: string;
}