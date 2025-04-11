/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { CreateRecognitionDto } from "@/types/recognition";
import { recognitionService } from "../services/recognition.service";
import toastService from "../services/toast.service";
export const useGetAllRecognitions = () => {
  return useQuery({
    queryKey: ["recognitions"],
    queryFn: () => recognitionService.getAllRecognitions(),
  });
};

export const useCreateSingleRecognition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: { data: CreateRecognitionDto }) =>
      recognitionService.createNewRecognition(data),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: ["recognitions"],
        exact: false,
      });
      toastService.success("Recognition created successfully");
    },
    onError: (error: any) => {
      toastService.error(error.response?.data?.error || "Error creating recognition");
    },
  });
};

export const useCreateMultipleRecognitions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: { data: CreateRecognitionDto[] }) =>
      recognitionService.createNewRecognitionBulk(data),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: ["recognitions"],
        exact: false,
      });
      toastService.success("Recognitions created successfully");
    },
    onError: (error: any) => {
      toastService.error(error.response?.data?.error || "Error creating recognition");
    },
  });
};
