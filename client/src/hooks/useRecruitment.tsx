import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "./use-toast";
import { RecruitmentStatus } from "@/lib/enums";

export interface Recruitment {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  photoUrl?: string;
  cvPath?: string;
  type: string;
  currentStatus: RecruitmentStatus;
  statusDueDate?: string;
  assignee?: string;
  notified?: boolean;
  location?: string;
  firstPriority?: string;
  secondPriority?: string;
  university?: string;
  position?: string;
  source?: string;
  failStage?: string;
  failReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    username: string;
    profileImage?: string;
    email: string;
  };
  employee?: any; 
}

export interface RecruitmentResponse {
  recruitments: Recruitment[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

export interface RecruitmentFilters {
  name?: string;
  email?: string;
  status?: string;
  type?: string;
  assignee?: string;
  position?: string;
  source?: string;
  location?: string;
  dateFrom?: Date;
  dateTo?: Date;
  createdFrom?: Date;
  createdTo?: Date;
}

interface StatusUpdateDto {
  status: RecruitmentStatus;
  failStage?: string;
  failReason?: string;
}

const API_URL = `${
  import.meta.env.VITE_NODE_ENV === "development"
    ? import.meta.env.VITE_DEV_API_URL
    : import.meta.env.VITE_API_URL
}/recruitment`;
axios.defaults.withCredentials = true;

const AI_API_URL = `${
  import.meta.env.VITE_NODE_ENV === "development"
    ? import.meta.env.VITE_DEV_API_URL
    : import.meta.env.VITE_API_URL
}/ai`;

export const useRecruitments = (
  page = 1,
  limit = 10,
  filters: RecruitmentFilters = {},
  enabled = true
) => {
  return useQuery({
    queryKey: ["recruitments", page, limit, filters],
    queryFn: async () => {
      const params = {
        page,
        limit,
        ...filters,
      };

      const response = await axios.get<ApiResponse<RecruitmentResponse>>(
        API_URL,
        { params }
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch recruitments"
        );
      }

      return response.data.data;
    },
    placeholderData: (previousData) => {
      return previousData;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled,
    retry: 1,
  });
}; 

export const useUpdateRecruitment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Recruitment>;
    }) => {
      const response = await axios.put<ApiResponse<Recruitment>>(
        `${API_URL}/${id}`,
        data
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to update recruitment"
        );
      }

      return response.data.data;
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: "Recruitment updated successfully",
      })
      queryClient.invalidateQueries({ queryKey: ["recruitments"] });
      queryClient.invalidateQueries({
        queryKey: ["recruitment", variables.id],
      });
    },
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
    },
  });
};

export const useDeleteRecruitment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete<ApiResponse<void>>(
        `${API_URL}/${id}`
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to delete recruitment"
        );
      }

      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["recruitments"] });
      queryClient.removeQueries({ queryKey: ["recruitment", id] });
    },
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
    },
  });
};

export const useRecruitment = (id: string | null, enabled = true) => {
  return useQuery({
    queryKey: ["recruitment", id],
    queryFn: async () => {
      if (!id) throw new Error("Recruitment ID is required");

      const response = await axios.get<ApiResponse<Recruitment>>(
        `${API_URL}/${id}`
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch recruitment");
      }

      return response.data.data;
    },
    enabled: Boolean(id) && enabled,
    staleTime: 5 * 60 * 1000,
  });
};


export const useUpdateRecruitmentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: StatusUpdateDto }) => {
      const response = await axios.patch<ApiResponse<Recruitment>>(
        `${API_URL}/${id}/status`,
        data
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to update recruitment status"
        );
      }



      return response.data.data;
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: "Recruitment status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["recruitments"] });
      queryClient.invalidateQueries({
        queryKey: ["recruitment", variables.id],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// predict match
export const usePredictMatch = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.post(`${AI_API_URL}/predict-match`, {
        candidate_id: id,
      });
      return response.data;
    },
    onSuccess: (data) => {
      console.log("data", data);
    },
    onError: (error: Error) => {
      console.log("error", error);
    },
  });
};

// extract cv details
export const useExtractCvDetails = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post<ApiResponse<Recruitment>>(
        `${AI_API_URL}/extract-cv`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!response.data) {
        throw new Error(
          "Failed to extract CV details"
        );
      }

      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "CV details extracted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
