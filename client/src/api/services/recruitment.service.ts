/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export interface Recruitment {
  id: number;
  name: string;
  email: string;
  status: string;
  type: string;
  assignee?: string;
  position?: string;
  source?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
}

export interface CreateRecruitmentDto {
  name: string;
  email: string;
  type: string;
  assignee?: string;
  position?: string;
  source?: string;
  location?: string;
  date?: Date;
  phoneNumber?: string;
  cvPath?: string;
  photoUrl?: string;
  statusDueDate?: Date;
  firstPriority?: string;
  secondPriority?: string;
  university?: string;
  notes?: string;
}

export interface UpdateRecruitmentDto {
  name?: string;
  email?: string;
  type?: string;
  assignee?: string;
  position?: string;
  source?: string;
  location?: string;
}

export interface StatusUpdateDto {
  status: string;
  failStage?: string;
  failReason?: string;
}

const API_URL = `${
  import.meta.env.VITE_NODE_ENV === "development"
    ? import.meta.env.VITE_DEV_API_URL
    : import.meta.env.VITE_API_URL
}/recruitment`;
axios.defaults.withCredentials = true;

class RecruitmentService {
  static async getAllRecruitments(
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<Recruitment[]>> {
    try {
      const response = await axios.get<ApiResponse<Recruitment[]>>(
        `${API_URL}`,
        {
          params: { page, limit },
        }
      );
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async getRecruitmentById(
    id: number
  ): Promise<ApiResponse<Recruitment>> {
    try {
      const response = await axios.get<ApiResponse<Recruitment>>(
        `${API_URL}/${id}`
      );
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async createRecruitment(
    data: CreateRecruitmentDto
  ): Promise<ApiResponse<Recruitment>> {
    try {
      const response = await axios.post<ApiResponse<Recruitment>>(
        `${API_URL}`,
        data
      );
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async updateRecruitment(
    id: number,
    data: UpdateRecruitmentDto
  ): Promise<ApiResponse<Recruitment>> {
    try {
      const response = await axios.put<ApiResponse<Recruitment>>(
        `${API_URL}/${id}`,
        data
      );
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async updateRecruitmentStatus(
    id: number,
    data: StatusUpdateDto
  ): Promise<ApiResponse<Recruitment>> {
    try {
      const response = await axios.patch<ApiResponse<Recruitment>>(
        `${API_URL}/${id}/status`,
        data
      );
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async deleteRecruitment(id: number): Promise<ApiResponse<null>> {
    try {
      const response = await axios.delete<ApiResponse<null>>(
        `${API_URL}/${id}`
      );
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async getRecruitmentStatistics(): Promise<ApiResponse<any>> {
    try {
      const response = await axios.get<ApiResponse<any>>(
        `${API_URL}/statistics`
      );
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async getUpcomingDueDates(
    days: number = 7
  ): Promise<ApiResponse<Recruitment[]>> {
    try {
      const response = await axios.get<ApiResponse<Recruitment[]>>(
        `${API_URL}/due-dates`,
        {
          params: { days },
        }
      );
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async markAsNotified(id: number): Promise<ApiResponse<Recruitment>> {
    try {
      const response = await axios.patch<ApiResponse<Recruitment>>(
        `${API_URL}/${id}/notify`
      );
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }
}

export default RecruitmentService;
