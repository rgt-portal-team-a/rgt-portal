import { Employee } from "./employee";

/* eslint-disable @typescript-eslint/no-explicit-any */
type ROLE = "HR" | "MANAGER" | "EMPLOYEE" | "ADMIN" | "MODERATOR" | "MARKETER";
type lROLE = "hr" | "manager" | "employee" | "admin" | "moderator" | "marketer";

export enum RoleType {
  HR = "hr",
  EMPLOYEE = "emp",
  MANAGER = "manager",
  ADMIN = "admin",
  MARKETER = "marketer",
}

interface Role {
  id: number;
  name: ROLE;
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
