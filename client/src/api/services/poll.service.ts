import axios from "axios";
import { ApiResponse } from "../types";
import { CreatePollDto, Poll } from "@/types/polls";

export class PollService {
  private static baseUrl = `${
    import.meta.env.VITE_NODE_ENV === "development"
      ? import.meta.env.VITE_DEV_API_URL
      : import.meta.env.VITE_API_URL
  }/polls`;

  // Create a new poll
  public static async createPoll(
    pollData: CreatePollDto
  ): Promise<ApiResponse<Poll>> {
    try {
      const response = await axios.post(`${this.baseUrl}/`, pollData);
      return response.data;
    } catch (error) {
      console.error("Error creating poll:", error);
      throw error;
    }
  }

  // Fetch all polls
  public static async getPolls(): Promise<ApiResponse<Poll[]>> {
    try {
      const response = await axios.get(`${this.baseUrl}/`, {
        params: {
          withStats: true,
          includeOptions: true,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching polls:", error);
      throw error;
    }
  }

  // Fetch a single poll by ID
  public static async getPollById(pollId: number): Promise<ApiResponse<Poll>> {
    try {
      const response = await axios.get(`${this.baseUrl}/${pollId}`, {
        params: {
          withStats: true,
          includeOptions: true,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching poll:", error);
      throw error;
    }
  }

  public static async votePoll(
    pollId: number,
    optionId: number
  ): Promise<ApiResponse<Poll>> {
    try {
      await axios.post(`${this.baseUrl}/${pollId}/vote`, { optionId });
      return this.getPollById(pollId);
    } catch (error) {
      console.error("Error voting:", error);
      throw error;
    }
  }

  public static async refreshPoll(pollId: number): Promise<ApiResponse<Poll>> {
    return this.getPollById(pollId);
  }

  public static async removeVote(
    pollId: number,
    optionId: number
  ): Promise<ApiResponse<Poll>> {
    try {
      await axios.delete(`${this.baseUrl}/${pollId}/vote/${optionId}`, {
        params: {
          optionId: optionId,
        },
      });

      return this.getPollById(pollId);
    } catch (error) {
      console.error("Error removing vote:", error);
      throw error;
    }
  }
}
