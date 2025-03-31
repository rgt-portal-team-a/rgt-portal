import { PtoRequestService } from "@/api/services/pto-request.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "./use-toast";
import { PtoLeave } from "@/types/PTOS";
import { PtoStatusType } from "@/components/Hr/Employees/EmployeeTimeOffManagementTable";

export const useRequestPto = (id?: number) => {
  const queryClient = useQueryClient();

  const { data: ptoData, isLoading } = useQuery({
    queryKey: ["ptoData"],
    queryFn: () => PtoRequestService.fetchUserPtoRequest(),
  });

  const { data: allPtoData, isLoading: isAllPtosLoading } = useQuery({
    queryKey: ["allPtoData"],
    queryFn: () => PtoRequestService.fetchAllPtoRequests(),
  });

  // fetching department ptos
  const { data: departmentPtos, isLoading: isDepartmentPtoLoading } = useQuery({
    queryKey: ["departmentPtoData", id],
    queryFn: () => {
      if (!id) {
        return Promise.resolve([]);
      }
      return PtoRequestService.fetchDepartmentPtos(String(id));
    },
  });

  const createPtoRequestMutation = useMutation({
    mutationFn: (newPto: PtoLeave) =>
      PtoRequestService.createPtoRequest(newPto),
    onMutate: async (newPto) => {
      // Cancel any ongoing refetches to avoid overwriting the optimistic update
      await queryClient.cancelQueries({ queryKey: ["ptoData"] });

      // Get the previous data
      const previousPtoData = queryClient.getQueryData<PtoLeave[]>(["ptoData"]);

      // Optimistically update the cache
      if (previousPtoData) {
        queryClient.setQueryData<PtoLeave[]>(["ptoData"], (old) => [
          ...(old || []),
          newPto,
        ]);
      }

      return { previousPtoData };
    },
    onError: (error, _, context) => {
      // Rollback the optimistic update on error
      if (context?.previousPtoData) {
        queryClient.setQueryData(["ptoData"], context.previousPtoData);
      }

      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      // Invalidate queries to refetch and sync with the server
      queryClient.invalidateQueries({ queryKey: ["ptoData"] });
      queryClient.invalidateQueries({ queryKey: ["departmentPtoData"] });
      queryClient.invalidateQueries({ queryKey: ["allPtoData"] });

      toast({
        title: "Success",
        description: "PTO created successfully",
      });
    },
  });

  const deletePtoRequestMutation = useMutation({
    mutationFn: (ptoId: number) => PtoRequestService.deletePtoRequest(ptoId),
    onMutate: async (ptoId) => {
      // Cancel any ongoing refetches to avoid overwriting the optimistic update
      await queryClient.cancelQueries({ queryKey: ["ptoData"] });
      await queryClient.cancelQueries({ queryKey: ["departmentPtoData"] });
      await queryClient.cancelQueries({ queryKey: ["allPtoData"] });

      // Get the previous data
      const previousPtoData = queryClient.getQueryData<PtoLeave[]>(["ptoData"]);
      const previousDepartmentPtoData = queryClient.getQueryData<PtoLeave[]>([
        "departmentPtoData",
      ]);
      const previousAllPtoData = queryClient.getQueryData<PtoLeave[]>([
        "allPtoData",
      ]);

      // Optimistically remove the PTO request from the cache
      if (previousPtoData) {
        queryClient.setQueryData<PtoLeave[]>(["ptoData"], (old) =>
          old?.filter((pto) => pto.id !== ptoId)
        );
      }
      if (previousDepartmentPtoData) {
        queryClient.setQueryData<PtoLeave[]>(["departmentPtoData"], (old) =>
          old?.filter((pto) => pto.id !== ptoId)
        );
      }
      if (previousAllPtoData) {
        queryClient.setQueryData<PtoLeave[]>(["allPtoData"], (old) =>
          old?.filter((pto) => pto.id !== ptoId)
        );
      }

      return { previousPtoData, previousDepartmentPtoData, previousAllPtoData };
    },
    onError: (error, _, context) => {
      // Rollback the optimistic update on error
      if (context?.previousPtoData) {
        queryClient.setQueryData(["ptoData"], context.previousPtoData);
      }
      if (context?.previousDepartmentPtoData) {
        queryClient.setQueryData(
          ["departmentPtoData"],
          context.previousDepartmentPtoData
        );
      }
      if (context?.previousAllPtoData) {
        queryClient.setQueryData(["allPtoData"], context.previousAllPtoData);
      }

      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      // Invalidate queries to refetch and sync with the server
      queryClient.invalidateQueries({ queryKey: ["ptoData"] });
      queryClient.invalidateQueries({ queryKey: ["departmentPtoData"] });
      queryClient.invalidateQueries({ queryKey: ["allPtoData"] });

      toast({
        title: "Success",
        description: "PTO deleted",
      });
    },
  });

  const updatePtoRequestMutation = useMutation({
    mutationFn: ({
      ptoUpdate,
      ptoId,
    }: {
      ptoUpdate: {
        status: PtoStatusType;
        statusReason?: string;
        departmentId: number;
      };
      ptoId: number;
    }) => PtoRequestService.updatePtoRequest(ptoUpdate, ptoId),
    onMutate: async ({ ptoUpdate, ptoId }) => {
      // Cancel any ongoing refetches to avoid overwriting the optimistic update
      await queryClient.cancelQueries({ queryKey: ["ptoData"] });
      await queryClient.cancelQueries({ queryKey: ["departmentPtoData"] });
      await queryClient.cancelQueries({ queryKey: ["allPtoData"] });

      // Get the previous data
      const previousPtoData = queryClient.getQueryData<PtoLeave[]>(["ptoData"]);
      const previousDepartmentPtoData = queryClient.getQueryData<PtoLeave[]>([
        "departmentPtoData",
      ]);
      const previousAllPtoData = queryClient.getQueryData<PtoLeave[]>([
        "allPtoData",
      ]);

      // Optimistically update the PTO request in the cache
      if (previousPtoData) {
        queryClient.setQueryData<PtoLeave[]>(["ptoData"], (old) =>
          old?.map((pto) => (pto.id === ptoId ? { ...pto, ...ptoUpdate } : pto))
        );
      }
      if (previousDepartmentPtoData) {
        queryClient.setQueryData<PtoLeave[]>(["departmentPtoData"], (old) =>
          old?.map((pto) => (pto.id === ptoId ? { ...pto, ...ptoUpdate } : pto))
        );
      }
      if (previousAllPtoData) {
        queryClient.setQueryData<PtoLeave[]>(["allPtoData"], (old) =>
          old?.map((pto) => (pto.id === ptoId ? { ...pto, ...ptoUpdate } : pto))
        );
      }

      return { previousPtoData, previousDepartmentPtoData, previousAllPtoData };
    },
    onError: (error, _, context) => {
      // Rollback the optimistic update on error
      if (context?.previousPtoData) {
        queryClient.setQueryData(["ptoData"], context.previousPtoData);
      }
      if (context?.previousDepartmentPtoData) {
        queryClient.setQueryData(
          ["departmentPtoData"],
          context.previousDepartmentPtoData
        );
      }
      if (context?.previousAllPtoData) {
        queryClient.setQueryData(["allPtoData"], context.previousAllPtoData);
      }

      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      // Invalidate queries to refetch and sync with the server
      queryClient.invalidateQueries({ queryKey: ["ptoData"] });
      queryClient.invalidateQueries({ queryKey: ["departmentPtoData"] });
      queryClient.invalidateQueries({ queryKey: ["allPtoData"] });

      toast({
        title: "Success",
        description: "PTO updated successfully",
      });
    },
  });

  const createPto = async (newPto: PtoLeave) => {
    return createPtoRequestMutation.mutateAsync(newPto);
  };

  const deletePto = async (ptoId: number) => {
    return deletePtoRequestMutation.mutateAsync(ptoId);
  };

  const updatePto = async ({
    ptoUpdate,
    ptoId,
  }: {
    ptoUpdate: {
      status: PtoStatusType;
      statusReason?: string;
      departmentId: number;
    };
    ptoId: number;
  }) => {
    return updatePtoRequestMutation.mutateAsync({ ptoUpdate, ptoId });
  };

  return {
    createPto,
    deletePto,
    isPtoDeleting: deletePtoRequestMutation.isPending,
    isPtoLoading: createPtoRequestMutation.isPending,
    ptoData,
    isLoading,
    allPtoData,
    isAllPtosLoading,
    departmentPtos,
    isDepartmentPtoLoading,
    updatePto,
    isPtoUpdating: updatePtoRequestMutation.isPending,
  };
};
