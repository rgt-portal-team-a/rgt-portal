import axios from "axios";
import { defaultApiClient } from "../axios";
import { ApiResponse } from "../types";
import { User, ResponseUser } from "@/types/authUser";
import { FileUploadService } from "./file.service";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export const authService = {
  initiateGoogleAuth: (): Promise<void> => {
    return new Promise((resolve) => {
      console.log("node env: ", import.meta.env.VITE_NODE_ENV);
      console.log("base url: ", import.meta.env.VITE_BASE_URL);
      console.log("dev base url: ", import.meta.env.VITE_DEV_BASE_URL);
      setTimeout(() => {
        window.location.href = `${
          import.meta.env.VITE_NODE_ENV === "development"
            ? import.meta.env.VITE_DEV_BASE_URL
            : import.meta.env.VITE_BASE_URL
        }/auth/google`;
        resolve();
      }, 50);
    });
  },

  login: async (data: LoginRequest): Promise<any> => {
    const response = await defaultApiClient.post("/user/auth/login", data);
    console.log("response", response);

    return response.data;
  },

  setPassword: async (data: any): Promise<any> => {
    const response = await defaultApiClient.post(
      "/user/auth/set-password",
      data
    );
    return response.data;
  },

  verifyOtp: async (data: any): Promise<any> => {
    const response = await defaultApiClient.post("/user/auth/verify-otp", data);
    return response.data;
  },

  logout: async (): Promise<ApiResponse<null>> => {
    const response = await defaultApiClient.post<ApiResponse<null>>(
      "/auth/logout"
    );
    return response.data;
  },

  getCurrentUser: async (): Promise<ResponseUser> => {
    const response = await defaultApiClient.get("/user");
    // console.log("User data", response.data);
    return response.data;
  },

  updateUser: async (data: Partial<User>): Promise<any> => {
    let profileImageUrl = data.profileImage;

    // If profileImage is a File object, upload it first
    if (data.profileImage && data.profileImage instanceof File) {
      const uploadResponse = await FileUploadService.uploadFile(
        data.profileImage
      );
      if (!uploadResponse.success || !uploadResponse.file?.url) {
        throw new Error(
          uploadResponse.error || "Failed to upload profile image"
        );
      }
      profileImageUrl = uploadResponse.file.url;
    }

    const response = await axios.put("/user/auth/update-user-and-employee", {
      userId: data.id,
      updateUserAndEmployeeDto: {
        ...data,
        profileImage: profileImageUrl,
      },
    });
    return response.data;
  },
};
