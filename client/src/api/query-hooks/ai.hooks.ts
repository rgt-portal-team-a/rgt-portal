import { useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { AttritionRequestInterface } from "@/types/ai";
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