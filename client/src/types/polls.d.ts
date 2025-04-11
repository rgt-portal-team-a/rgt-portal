/* eslint-disable @typescript-eslint/no-explicit-any */

import { User } from "./authUser";

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
  id: number;
  pollId: number;
  text: string;
  voteCount: number;
  percentage: number;
  hasVoted?: boolean;
  metadata?: Record<string, any>;
}

interface PollAuthor extends User {
  user: { profileImage: string };
}

export interface Poll {
  id: number;
  description: string;
  type: "single_choice" | "multiple_choice";
  options: PollOption[];
  voteCount: number;
  hasVoted?: boolean;
  createdBy: PollAuthor;
  createdAt: Date;
  endDate?: Date;
  participationRate: number;
  hasVoted?: boolean;
  isAnonymous?: boolean;
  allowComments?:boolean;
  status?:string
}
