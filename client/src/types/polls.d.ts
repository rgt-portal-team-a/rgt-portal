/* eslint-disable @typescript-eslint/no-explicit-any */

interface CreatePollDto {
  description: string;
  options: { id: number; text: string }[];
  isAnonymous: boolean;
  type?: "single_choice" | "multiple_choice";
  allowComments?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface PollOption {
  id:number;
  pollId: number;
  text: string;
  voteCount: number;
  percentage: number;
  hasVoted?: boolean;
  metadata?: Record<string, any>;
}

export interface Poll {
  id: number;
  description: string;
  type: "single_choice" | "multiple_choice";
  options: PollOption[];
  voteCount: number;
  hasVoted?: boolean;
  createdBy: User;
  createdAt: Date;
  endDate?: Date;
  participationRate: number;
  hasVoted?: boolean;
  // Add other poll properties
}
