import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import {
  AttritionRequestInterface,
  JobMatchResultsResponse,
  ReportQueryParams,
  KairoQueryRequest,
  NspHiringSuccessInterface,
} from "@/types/ai";
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

export const useKairoBotQuery = () => {

  return useMutation({
    mutationFn: ( data : KairoQueryRequest ) =>
      aiService.kairoChatbot(data),
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
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => {
      return previousData;
    },
  });
};

export const useProgramOfStudyHired = () => {
  return useQuery<NspHiringSuccessInterface>({
    queryKey: ["program-of-study-hired"],
    queryFn: () => aiService.getProgramOfStudyHired(),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => {
      return previousData;
    },
  });
};


export const useGenerateReport = (params: ReportQueryParams, ) => {
  return useQuery({
    queryKey: ["generate-report", params.type],
    queryFn: () => aiService.generateReport(params),
    refetchOnWindowFocus: false,
  });
};