import { useQuery } from '@tanstack/react-query';
import { ptoService } from "../services/pto.service"


export const useGetAllPTOS = () => {

  return useQuery({
   queryKey: ['ptos'],
   queryFn: () => ptoService.getAllPTOS(),
  });
};