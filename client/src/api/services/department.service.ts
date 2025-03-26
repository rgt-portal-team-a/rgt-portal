import { AddEmployeeToDepartmentDTO, AddEmployeesToDepartmentDTO, CreateDepartmentDTO, Department, DepartmentQueryParams } from '@/types/department';
import { createApiClient } from '../axios';
import { ApiResponse } from '../types';


const departmentApiClient = createApiClient(
  `${
    import.meta.env.VITE_NODE_ENV === "development"
      ? import.meta.env.VITE_DEV_API_URL
      : import.meta.env.VITE_API_URL
  }/departments`
);

export const departmentService = {
  createNewDepartment: async (
    data: CreateDepartmentDTO
  ): Promise<CreateDepartmentDTO> => {
    const response = await departmentApiClient.post<CreateDepartmentDTO>(
      '/',
      data
    );
    return response.data;
  },

  removeEmployeeFromDepartment: async (
    id: string,
    employeeId: string,
  ): Promise<ApiResponse<Department>> => {
    const response = await departmentApiClient.delete<ApiResponse<Department>>(
      `/${id}/employees/${employeeId}`,
    );
    return response.data;
  },

  addEmployeeToDepartment: async (
    id: string,
    data: AddEmployeeToDepartmentDTO
  ): Promise<ApiResponse<AddEmployeeToDepartmentDTO>> => {
    const response = await departmentApiClient.post<
      ApiResponse<AddEmployeeToDepartmentDTO>
    >(`/${id}/employees`, data);
    return response.data;
  },

  addEmployeesToDepartment: async (
    id: string,
    data: AddEmployeesToDepartmentDTO
  ): Promise<ApiResponse<AddEmployeesToDepartmentDTO>> => {
    const response = await departmentApiClient.post<
      ApiResponse<AddEmployeesToDepartmentDTO>
    >(`/${id}/employees/bulk`, data);
    return response.data;
  },

  getAllDepartments: async (
    params?: DepartmentQueryParams
  ): Promise<ApiResponse<Department[]>> => {

    const queryParams = new URLSearchParams();

    if (params?.includeEmployees) {
      queryParams.append('includeEmployees', 'true');
    }

    const url = `/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log("URL", url)

    const response =
      await departmentApiClient.get<ApiResponse<Department[]>>(url);
    return response.data;
  },

  getDepartmentById: async (
    id: string,
    params?: DepartmentQueryParams
  ): Promise<ApiResponse<Department>> => {
    const queryParams = new URLSearchParams();

    if (params?.includeEmployees) {
      queryParams.append('includeEmployees', 'true');
    }

    const url = `/${id}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response =
      await departmentApiClient.get<ApiResponse<Department>>(url);
    return response.data;
  },
};