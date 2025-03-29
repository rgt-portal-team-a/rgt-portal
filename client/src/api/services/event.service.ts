import { createApiClient } from '../axios';
import { ApiResponse } from '../types';
import { CreateEventDto, Event } from '@/types/events';



const eventApiClient = createApiClient(
  `${
    import.meta.env.VITE_NODE_ENV === "development"
      ? import.meta.env.VITE_DEV_API_URL
      : import.meta.env.VITE_API_URL
  }/event`
);



export const eventService =  {

    getAllEvents: async (): Promise<ApiResponse<Event[]>> => {
        const response = await eventApiClient.get<ApiResponse<Event[]>>("/");
        return response.data;
    },

    createEvent: async (data: CreateEventDto): Promise<ApiResponse<Event>> => {
        console.log("Creating event with data", data)
        const response = await eventApiClient.post<ApiResponse<Event>>("/",data );
        return response.data;
    }
}