import { eventService } from "../services/event.service"
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { ApiResponse } from '../types';
import { CreateEventDto, Event } from '@/types/events';


export const useAllEvents = () => {

  return useQuery<ApiResponse<Event[]>>({
   queryKey: ['events'],
   queryFn: () => eventService.getAllEvents(),
  });
};




export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({  data }: { data: CreateEventDto }) =>
      eventService.createEvent(data),
    onSuccess: (data, _variables) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
        toast({
        title: "Success",
        description:  data.message || "Event created successfully",
        });
        },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  });
};