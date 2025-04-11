import { useQuery } from '@tanstack/react-query';
import {
  TurnoverByTenureInterface,
  TurnoverByPositionInterface,
  LeavingReasonsInterface,
  TurnoverTrendsInterface,
} from "@/types/analytics";
import { analyticsService } from "../services/analytics.service";


export const useGetTurnoverByTenure = () => {
  return useQuery<TurnoverByTenureInterface[]>({
    queryKey: ["turnover-by-tenure"],
    queryFn: () => analyticsService.getTurnoverByTenure(),
  });
};

export const useGetTurnoverByPosition = () => {
  return useQuery<TurnoverByPositionInterface[]>({
    queryKey: ["turnover-by-position"],
    queryFn: () => analyticsService.getTurnoverByPosition(),
  });
};

export const useGetReasonsForLeaving = () => {
  return useQuery<LeavingReasonsInterface[]>({
    queryKey: ["leaving-reasons"],
    queryFn: () => analyticsService.getReasonsForLeaving(),
  });
};


export const useGetTurnoverTrends = () => {
  return useQuery<TurnoverTrendsInterface>({
    queryKey: ["turnover-trends"],
    queryFn: () => analyticsService.getTurnoverTrends(),
  });
};