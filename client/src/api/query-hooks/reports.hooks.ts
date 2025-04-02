import { regularReportsService } from "../services/reports.service"
import {  useQuery } from '@tanstack/react-query';
import {
  ConversionRateInterface,
  SourceHireSuccessRateInterface,
  DropoutRateInterface,
  HeadcountByWorkTypeInterface,
} from "@/types/ai";



export const useGetConversionRate = () => {

  return (
    useQuery <ConversionRateInterface>({
        queryKey: ["conversion-rate"],
        queryFn: () => regularReportsService.getConversionRate(),
    })
  );
};
export const useSourceToHireSuccessRate = () => {
  return useQuery<SourceHireSuccessRateInterface>({
    queryKey: ["source-hire-rate"],
    queryFn: () => regularReportsService.getSourceToHireSuccessRate(),
  });
};

export const useDropOutRateByStage = () => {
  return useQuery<DropoutRateInterface>({
    queryKey: ["dropout-rate"],
    queryFn: () => regularReportsService.getDropOutRateByStage(),
  });
};

export const useGetHeadcountByWorkType = () => {
  return useQuery<HeadcountByWorkTypeInterface>({
    queryKey: ["headcount-by-worktype"],
    queryFn: () => regularReportsService.getHeadcountByWorkType(),
  });
};