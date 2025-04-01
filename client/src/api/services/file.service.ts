/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const API_BASE_URL = `${
  import.meta.env.VITE_NODE_ENV === "development"
    ? import.meta.env.VITE_DEV_API_URL
    : import.meta.env.VITE_API_URL
}/file`;

export interface FileUploadResponse {
  success: boolean;
  message?: string;
  file?: {
    url: string;
    name: string;
    originalName: string;
    size: number;
    sizeFormatted: string;
    contentType: string;
    type: string;
  };
  error?: string;
}

export interface BufferUploadRequest {
  buffer: string;
  extension: string;
  customFileName?: string;
}

export interface DeleteFileResponse {
  success: boolean;
  message?: string;
  blobName?: string;
  error?: string;
}

export class FileUploadService {
  static async uploadFile(
    file: File,
    customFileName?: string
  ): Promise<FileUploadResponse> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (customFileName) {
        formData.append("customFileName", customFileName);
      }

      const response = await axios.post<FileUploadResponse>(
        `${API_BASE_URL}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || "Upload failed",
      };
    }
  }

  static async uploadBuffer(
    data: BufferUploadRequest
  ): Promise<FileUploadResponse> {
    try {
      const response = await axios.post<FileUploadResponse>(
        `${API_BASE_URL}/upload-buffer`,
        data
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || "Upload failed",
      };
    }
  }

  static async deleteFile(blobName: string): Promise<DeleteFileResponse> {
    try {
      const response = await axios.delete<DeleteFileResponse>(
        `${API_BASE_URL}/delete/${blobName}`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || "Delete failed",
      };
    }
  }
}
