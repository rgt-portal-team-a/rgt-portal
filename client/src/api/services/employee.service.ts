import { createApiClient } from "../axios";
import { PaginatedResponse } from "../types";
import { Agency, Employee, UpdateEmployeeInterface } from "@/types/employee";

const employeeApiClient = createApiClient(
  `${import.meta.env.VITE_API_URL}/employees`
);

export const employeeService = {
  getAllEmployeesPaginated: async (params?: {
    departmentId?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Employee>> => {
    const response = await employeeApiClient.get<PaginatedResponse<Employee>>(
      "/",
      {
        params,
      }
    );
    return response.data;
  },

  getAllEmployees: async (query?: string): Promise<Employee[]> => {
    let key;
    if (query) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const isEmail = emailRegex.test(query);
      key = isEmail ? "email" : "name";
    }
    const response = await employeeApiClient.get(`/?${key}=${query}`);
    return response.data.data;
  },

  getEmployeeById: async (id: string): Promise<Employee> => {
    const response = await employeeApiClient.get(`/${id}`);
    console.log("get emps:", response.data.data);
    return response.data.data;
  },

  updateEmployee: async (
    id: number,
    data: UpdateEmployeeInterface
  ): Promise<{ data: Employee; message: string }> => {
    const response = await employeeApiClient.put<{
      data: Employee;
      message: string;
    }>(`/${id}`, data);
    return response.data;
  },

  updateEmployeeAgency: async (
    id: number,
    data: Partial<Agency>
  ): Promise<{ data: Employee; message: string }> => {
    const response = await employeeApiClient.put<{
      data: Employee;
      message: string;
    }>(`/${id}/agency`, data);
    return response.data;
  },

  removeEmployeeFromDepartment: async (
    id: number
  ): Promise<{ message: string }> => {
    const response = await employeeApiClient.delete<{ message: string }>(
      `/${id}/department`
    );
    return response.data;
  },
};
