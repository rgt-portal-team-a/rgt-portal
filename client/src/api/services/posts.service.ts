/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from "axios";
import { ApiResponse } from "../types";

export class PostService {
  // Store base URL as a static private property
  private static baseUrl = `${
    import.meta.env.VITE_NODE_ENV === "development"
      ? import.meta.env.VITE_DEV_API_URL
      : import.meta.env.VITE_API_URL
  }/posts`;

  // Create a new post
  public static async createPost(postData: any): Promise<ApiResponse<any>> {
    try {
      console.log("post data:", postData);
      const response = await axios.post(this.baseUrl, postData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("response:", response);
      return response.data;
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  }

  // Fetch all posts
  public static async getPosts(
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<any>> {
    try {
      const response = await axios.get(`${this.baseUrl}/`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching posts:",
        error instanceof Error ? error.message : error
      );
      throw error;
    }
  }

  // Fetch a single post by ID
  public static async getPostById(postId: number): Promise<ApiResponse<any>> {
    try {
      const response = await axios.get(`${this.baseUrl}/${postId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching post:", error);
      throw error;
    }
  }

  // Delete a single post by ID
  public static async deletPost(id: number): Promise<ApiResponse<any>> {
    try {
      const response = await axios.delete(`${this.baseUrl}/${id}`);
      console.log("responsedata:", response.data);
      return response.data;
    } catch (error) {
      console.log("Error fetching post:", error);
      throw error;
    }
  }
}
