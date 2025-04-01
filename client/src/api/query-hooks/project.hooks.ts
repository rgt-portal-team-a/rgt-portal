import { useQuery } from '@tanstack/react-query';
import { projectService } from "../services/project.service";
import { useMemo } from 'react';

export const useAllProjects = (
  params?: { 
      includeAssignment?: boolean;
  },
  options?: {
      enabled?: boolean;
  }
) => {
  const stableParams = useMemo(() => params ?? {}, [params]); 

  return useQuery({
      queryKey: ['projects', stableParams],
      queryFn: () => projectService.getAllProjects(stableParams),
      ...options
  });
};
