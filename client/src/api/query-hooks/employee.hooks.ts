import { useRbacQuery, usePrefetchWithPermission } from '@/features/data-access/rbacQuery';
import { employeeService } from '../services/employee.service';
import {  useMutation, useQueryClient, UseQueryOptions, QueryKey} from '@tanstack/react-query';
import { Agency, Employee, UpdateEmployeeInterface } from "@/types/employee";
import { toast } from '@/hooks/use-toast';
import { useMemo } from 'react';


export const useAllEmployees = (
    params?: { 
        departmentId?: string; 
        status?: string;
        search?: string;
        page?: number;
        limit?: number;
    },
    options?: Omit<UseQueryOptions<Employee[],Error,Employee[],QueryKey>,'queryKey' | 'queryFn' > & {
        enabled?: boolean;
    }
) => {
  const stableParams = useMemo(() => params ?? {}, [params]); 

  return useRbacQuery(
    "employeeRecords",
    "view",
    ["employees", stableParams],
    async () => {
      const response = await employeeService.getAllEmployees();
      return response; 
    },
    {
      ...options,
      placeholderData: (previousData) => {
        return previousData;
      },
    }
  );
};

export const useEmployeeDetails = (id: string) => {
  return useRbacQuery(
    "employeeRecords",
    "view",
    ["employee", id],
    () => employeeService.getEmployeeById(id),
    {
      enabled: !!id,
      placeholderData: (previousData) => {
        return previousData;
      },
    }
  );
};



export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEmployeeInterface }) =>
      employeeService.updateEmployee(id, data),
    onSuccess: () => {
      // queryClient.setQueryData(["employees",{ id: variables.id}], result.data);
      queryClient.invalidateQueries({ queryKey: ["employees"] });

      toast({
        title: "Success",
        description: "Employee updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateEmployeeAgency = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Agency> }) =>
      employeeService.updateEmployeeAgency(id, data),
    onSuccess: () => {
      // queryClient.setQueryData(["employees",{ id: variables.id}], result.data);
      queryClient.invalidateQueries({ queryKey: ["employees"] });

      toast({
        title: "Success",
        description: "Employee Agency updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};





export const useRemoveEmployeeFromDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, departmentId }: { id: number, departmentId: number }) =>
      employeeService.removeEmployeeFromDepartment(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["department", variables.departmentId] });
      queryClient.invalidateQueries({ queryKey: ["employee", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast({
        title: "Success",
        description: "Employee removed from department successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};


export const usePrefetchEmployeeData = () => {
  const { prefetchIfAllowed } = usePrefetchWithPermission();

  const prefetchEmployee = (id: string) => {
    return prefetchIfAllowed("employeeRecords", "view", ["employee", id], () =>
      employeeService.getEmployeeById(id)
    );
  };

  return { prefetchEmployee };
};
