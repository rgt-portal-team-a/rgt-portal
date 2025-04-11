/* eslint-disable @typescript-eslint/no-unused-vars */
import { eventService } from "../services/event.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiResponse } from "../types";
import { CreateEventDto, Event } from "@/types/events";
import toastService from "../services/toast.service";

export const useAllEvents = () => {
  return useQuery<ApiResponse<Event[]>>({
    queryKey: ["events"],
    queryFn: () => eventService.getAllEvents(),
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: { data: CreateEventDto }) =>
      eventService.createEvent(data),
    onSuccess: (data, _variables) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toastService.success(data.message || "Event created successfully");
    },
    onError: (error) => {
      toastService.error(error.message || "Failed to create event");
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => eventService.deleteEvent(id),
    onSuccess: (data, _variables) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toastService.success(data.message || "Event deleted successfully");
    },
    onError: (error) => {
      toastService.error(error.message || "Failed to delete event");
    },
  });
};
