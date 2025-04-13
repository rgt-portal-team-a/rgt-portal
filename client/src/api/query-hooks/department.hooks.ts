/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useRbacQuery } from '@/features/data-access/rbacQuery';
import { toast } from '@/hooks/use-toast';
import { AddEmployeeToDepartmentDTO, AddEmployeesToDepartmentDTO, CreateDepartmentDTO, UpdateDepartmentDTO } from '@/types/department';
import { departmentService } from '../services/department.service';
import toastService from '../services/toast.service';



export const useDepartments = (options?: { includeEmployees?: boolean }) => {
  return useQuery({
    queryKey: ["departments", options],
    queryFn: () =>
      departmentService.getAllDepartments({
        includeEmployees: options?.includeEmployees,
      }),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => {
      return previousData;
    },
  });
};


export const useGetDepartmentById = (
  id: string,
  options?: {
    includeEmployees?: boolean;
  }
) => {
  return useRbacQuery(
    "employeeRecords",
    "view",
    ["departments", id],
    () =>
      departmentService.getDepartmentById(id, {
        includeEmployees: options?.includeEmployees,
      }),
    {
      placeholderData: (previousData) => {
        return previousData;
      },
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  );
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ data }: { data: CreateDepartmentDTO }) => 
      departmentService.createNewDepartment(data),
    onSuccess: (_, _variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: ['departments'],
        exact: false
      });
      toastService.success("Department created successfully");
    },
    onError: (error: any) => {
      console.log("error in create department", error);
      toastService.error(error.response?.data?.error || "Error creating department");
    }
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string ,data: UpdateDepartmentDTO }) => 
      departmentService.updateDepartment(id, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: ["departments", variables.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['departments'],
        exact: false
      });
      toastService.success("Department updated successfully");
    },
    onError: (error: any) => {
      toastService.error(error.response?.data?.error || "Error updating department");
    }
  });
};

export const useUpdateManager = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: { managerId: number } }) => 
      departmentService.updateManager(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['departments', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toastService.success("Manager updated successfully");
    },
    onError: (error: any) => {
      toastService.error(error.response?.data?.error || "Error updating manager");
    }
  });
};


export const useAddEmployeeToDepartment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: AddEmployeeToDepartmentDTO }) => 
      departmentService.addEmployeeToDepartment(id, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['departments', variables.id] });
      queryClient.invalidateQueries({
        queryKey: ['departments'],
        exact: false 
      });
      toastService.success("Employee Added To Department Successfully");
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || "Error adding employee to department",
        variant: 'destructive',
      })
    }
  });
};
export const useRemoveEmployeesFromDepartment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, employeeId }: { id: string, employeeId: string }) => 
      departmentService.removeEmployeeFromDepartment(id, employeeId),

    onSuccess: (_, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["employee", variables.employeeId] });
      queryClient.invalidateQueries({ queryKey: ['departments', variables.id] });
      queryClient.invalidateQueries({
        queryKey: ['departments'],
        exact: false 
      });
      toast({
        title: 'Success',
        description: 'Employee Removed From Department Successfully',
      })
    },
    onError: (error: any) => {
      toastService.error(error.response?.data?.error || "Error removing employee from department");
    }
  });
};


export const useAddEmployeesToDepartment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: AddEmployeesToDepartmentDTO }) => 
      departmentService.addEmployeesToDepartment(id, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['departments', variables.id] });
      queryClient.invalidateQueries({
        queryKey: ['departments'],
        exact: false
      });
      toastService.success("Employees Added To Department Successfully");
    },
    onError: (error: any) => {
      toastService.error(error.response?.data?.error || "Error adding employees to department");
    }
  });
};