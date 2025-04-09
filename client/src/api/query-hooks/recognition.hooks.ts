import { toast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { CreateRecognitionDto } from "@/types/recognition";
import { recognitionService } from "../services/recognition.service";

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
      toast({
        title: "Success",
        description: "Recognition created successfully",
      });
    },
    onError: (error) => {
      console.log("Recognition Creation Error", error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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
      toast({
        title: "Success",
        description: "Recognitions created successfully",
      });
    },
    onError: (error) => {
      console.log("Recognition Creation Error", error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
