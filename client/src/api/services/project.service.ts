import { createApiClient } from '../axios';
import { ApiResponse } from '../types';
import { Project } from '@/types/project';



const projectApiClient = createApiClient(
  `${
    import.meta.env.VITE_NODE_ENV === "development"
      ? import.meta.env.VITE_DEV_API_URL
      : import.meta.env.VITE_API_URL
  }/projects`
);

import {ProjectQueryParams} from "@/types/project"

export const projectService =  {

    getAllProjects: async (   params?: ProjectQueryParams ): Promise<ApiResponse<Project[]>> => {

        const queryParams = new URLSearchParams();
        
        if (params?.includeAssignment ) {
          queryParams.append('includeAssignment', 'true');
        }

        const url = `/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

        const response = await projectApiClient.get<ApiResponse<Project[]>>(url);
        return response.data;

    },
}