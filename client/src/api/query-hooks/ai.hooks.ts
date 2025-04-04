import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { AttritionRequestInterface, JobMatchResultsResponse, ReportQueryParams, } from "@/types/ai";
import { aiService } from "../services/ai.service";


export const usePredictAttrition = () => {

  return useMutation({
    mutationFn: ({ data }: { data: AttritionRequestInterface }) =>
      aiService.predictAttrition(data),
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};


export const useAllJobMatchResults = () => {
  return useQuery<JobMatchResultsResponse>({
    queryKey: ["all-job-match-results"],
    queryFn: () => aiService.getAllJobMatchResults(),
  });
};


export const useGenerateReport = (params: ReportQueryParams, ) => {
  return useQuery({
    queryKey: ["generate-report"],
    queryFn: () => aiService.generateReport(params),
  });
};