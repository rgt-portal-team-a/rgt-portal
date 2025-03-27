import { regularReportsService } from "../services/reports.service"
import {  useQuery } from '@tanstack/react-query';
import {
  ConversionRateInterface,
  SourceHireSuccessRateInterface,
  DropoutRateInterface,
  HeadcountByWorkTypeInterface,
  HiringLadderInterface,
  EmployeeCountByDepartmentInterface,
} from "@/types/ai";



export const useGetConversionRate = () => {

  return useQuery<ConversionRateInterface>({
    queryKey: ["conversion-rate"],
    queryFn: () => regularReportsService.getConversionRate(),
    placeholderData: (previousData) => {
      return previousData;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
export const useSourceToHireSuccessRate = () => {
  return useQuery<SourceHireSuccessRateInterface>({
    queryKey: ["source-hire-rate"],
    queryFn: () => regularReportsService.getSourceToHireSuccessRate(),
    placeholderData: (previousData) => {
      return previousData;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useDropOutRateByStage = () => {
  return useQuery<DropoutRateInterface>({
    queryKey: ["dropout-rate"],
    queryFn: () => regularReportsService.getDropOutRateByStage(),
    placeholderData: (previousData) => {
      return previousData;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useGetHeadcountByWorkType = () => {
  return useQuery<HeadcountByWorkTypeInterface>({
    queryKey: ["employee-headcount-by-worktype"],
    queryFn: () => regularReportsService.getHeadcountByWorkType(),
    placeholderData: (previousData) => {
      return previousData;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useGetHiringLadder = () => {
  return useQuery<HiringLadderInterface>({
    queryKey: ["hiring-ladder"],
    queryFn: () => regularReportsService.getHiringLadder(),
    placeholderData: (previousData) => {
      return previousData;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};


export const useGetEmployeeCountByDepartment = () => {
  return useQuery<EmployeeCountByDepartmentInterface>({
    queryKey: ["employee-count-department"],
    queryFn: () => regularReportsService.getEmployeeCountByDepartment(),
    placeholderData: (previousData) => {
    return previousData;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};