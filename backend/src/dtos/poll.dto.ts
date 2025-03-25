import { PollStatus, PollType } from "@/entities/poll.entity";

export interface CreatePollOptionDto {
  text: string;
  metadata?: Record<string, any>;
}

export interface CreatePollDto {
  description: string;
  type: PollType;
  options: CreatePollOptionDto[];
  startDate?: Date;
  endDate?: Date;
  isAnonymous?: boolean;
  allowComments?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdatePollDto {
  description?: string;
  status?: PollStatus;
  startDate?: Date;
  endDate?: Date;
  isAnonymous?: boolean;
  allowComments?: boolean;
  metadata?: Record<string, any>;
}

export interface AddPollOptionDto {
  text: string;
  metadata?: Record<string, any>;
}

export interface CreatePollVoteDto {
  optionId: number;
  comment?: string;
}

export interface PollStatsDto {
  totalVotes: number;
  totalParticipants: number;
  participationRate: number;
  options: {
    id: number;
    text: string;
    voteCount: number;
    percentage: number;
  }[];
}
