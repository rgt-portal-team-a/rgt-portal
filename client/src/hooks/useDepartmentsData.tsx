import { departmentService } from "@/api/services/department.service";
import toastService from "@/api/services/toast.service";
import { UpdateDepartmentDTO } from "@/types/department";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useDepartmentsData = () => {
  const queryClient = useQueryClient();

  const {
    data: departments,
    isLoading: isDepartmentsLoading,
    isError: isDepartmentsError,
    error: departmentsError,
    refetch: refetchDepartments,
  } = useQuery({
    queryKey: ["departments"],
    queryFn: () =>
      departmentService.getAllDepartments({
        includeEmployees: true,
      }),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => {
      return previousData;
    },
  });

  const deleteDepartmentMutation = useMutation({
    mutationFn: (departmentId: string) =>
      departmentService.deleteDepartment(departmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toastService.success("Department deleted successfully!");
    },
		onError: (error: any) => {
			toastService.error(error?.response?.data?.error || "Error deleting department");
		},

  });

  const updateDepartmentMutation = useMutation({
    mutationFn: ({
      id,
      departmentData,
    }: {
      id: string;
      departmentData: UpdateDepartmentDTO;
    }) => departmentService.updateDepartment(id, departmentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toastService.success("Department updated successfully!");
    },
    onError: (error) => {
      toastService.error(`Error updating department: ${error}`);
    },
  });

  const updateDepartment = async (
    id: string,
    departmentData: UpdateDepartmentDTO
  ) => {
    await updateDepartmentMutation.mutateAsync({ id, departmentData });
  };
  const deleteDepartment = async (id: string) => {
    await deleteDepartmentMutation.mutateAsync(id);
  };
  return {
    isDepartmentsLoading,
    isDepartmentsError,
    refetchDepartments,
    departmentsError,
    departments,
    updateDepartment,
    deleteDepartment,
    isDepartmentDeleting: deleteDepartmentMutation.isPending,
  };

  // if (isDepartmentsError && departmentsError) {
  //   console.log("Unable to load departments..", departmentsError);
  //   toastService.error("Unable to load Departments");
  // }
};
