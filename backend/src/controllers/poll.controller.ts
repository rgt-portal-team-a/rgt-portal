import { Request, Response } from "express";
import { PollService } from "@/services/poll.service";
import { ApiResponse } from "@/dtos/response.dto";
import { Logger } from "@/services/logger.service";
import { CreatePollDto, UpdatePollDto, AddPollOptionDto, CreatePollVoteDto } from "@/dtos/poll.dto";
import { PollStatus } from "@/entities/poll.entity";

export class PollController {
  public pollService: PollService;
  private logger: Logger;

  constructor() {
    this.pollService = new PollService();
    this.logger = new Logger("PollController");
  }

  public getAllPolls = async (req: Request, res: Response): Promise<void> => {
    try {
      const employeeId = (req.user as any).employee?.id;

      const filters = {
        status: req.query.status as PollStatus | undefined,
        createdById: req.query.createdById ? parseInt(req.query.createdById as string) : undefined,
        includeOptions: req.query.includeOptions !== "false",
        includeVotes: req.query.includeVotes === "true",
        employeeId,
        active: req.query.active === "true",
        withStats: req.query.withStats === "true",
      };

      const polls = await this.pollService.findAll(filters);

      const response: ApiResponse<typeof polls> = {
        success: true,
        data: polls,
        message: "Polls retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error fetching polls:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch polls",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getPollById = async (req: Request, res: Response): Promise<void> => {
    try {
      const pollId = parseInt(req.params.id);
      const employeeId = (req.user as any).employee?.id;

      if (isNaN(pollId)) {
        res.status(400).json({
          success: false,
          message: "Invalid poll ID",
        });
        return;
      }

      const options = {
        includeOptions: req.query.includeOptions !== "false",
        includeVotes: req.query.includeVotes === "true",
        employeeId,
        withStats: req.query.withStats === "true",
      };

      const poll = await this.pollService.findById(pollId, options);

      if (!poll) {
        res.status(404).json({
          success: false,
          message: "Poll not found",
        });
        return;
      }

      const response: ApiResponse<typeof poll> = {
        success: true,
        data: poll,
        message: "Poll retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(`Error fetching poll:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch poll",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public createPoll = async (req: Request, res: Response): Promise<void> => {
    try {
      const employeeId = (req.user as any).employee?.id;

      if (!employeeId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized - Employee information missing",
        });
        return;
      }

      const pollData: CreatePollDto = req.body;

      if (!pollData.description || !pollData.options || pollData.options.length < 2) {
        res.status(400).json({
          success: false,
          message: "Invalid poll data. Title, description, and at least two options are required.",
        });
        return;
      }

      const newPoll = await this.pollService.createPoll(employeeId, pollData);

      const response: ApiResponse<typeof newPoll> = {
        success: true,
        data: newPoll,
        message: "Poll created successfully",
      };

      res.status(201).json(response);
    } catch (error) {
      this.logger.error("Error creating poll:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create poll",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public updatePoll = async (req: Request, res: Response): Promise<void> => {
    try {
      const pollId = parseInt(req.params.id);
      const employeeId = (req.user as any).employee?.id;

      if (isNaN(pollId)) {
        res.status(400).json({
          success: false,
          message: "Invalid poll ID",
        });
        return;
      }

      const existingPoll = await this.pollService.findById(pollId);

      if (!existingPoll) {
        res.status(404).json({
          success: false,
          message: "Poll not found",
        });
        return;
      }

      const updateData: UpdatePollDto = req.body;
      const updatedPoll = await this.pollService.updatePoll(pollId, updateData);

      const response: ApiResponse<typeof updatedPoll> = {
        success: true,
        data: updatedPoll,
        message: "Poll updated successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(`Error updating poll:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to update poll",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public deletePoll = async (req: Request, res: Response): Promise<void> => {
    try {
      const pollId = parseInt(req.params.id);
      const employeeId = (req.user as any).employee?.id;

      if (isNaN(pollId)) {
        res.status(400).json({
          success: false,
          message: "Invalid poll ID",
        });
        return;
      }

      const existingPoll = await this.pollService.findById(pollId);

      if (!existingPoll) {
        res.status(404).json({
          success: false,
          message: "Poll not found",
        });
        return;
      }

      await this.pollService.deletePoll(pollId);

      const response: ApiResponse<null> = {
        success: true,
        data: null,
        message: "Poll deleted successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(`Error deleting poll:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to delete poll",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public vote = async (req: Request, res: Response): Promise<void> => {
    try {
      const pollId = parseInt(req.params.id);
      const employeeId = (req.user as any).employee?.id;
      console.log("pollId:", pollId);

      if (isNaN(pollId)) {
        res.status(400).json({
          success: false,
          message: "Invalid poll ID",
        });
        return;
      }

      if (!employeeId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized - Employee information missing",
        });
        return;
      }

      const voteData: CreatePollVoteDto = req.body;

      if (!voteData.optionId) {
        res.status(400).json({
          success: false,
          message: "Option ID is required",
        });
        return;
      }

      const vote = await this.pollService.vote(pollId, employeeId, voteData);

      const response: ApiResponse<typeof vote> = {
        success: true,
        data: vote,
        message: "Vote recorded successfully",
      };

      res.status(201).json(response);
    } catch (error) {
      this.logger.error(`Error voting on poll:`, error);

      if (error instanceof Error) {
        if (error.message.includes("already voted") || error.message.includes("not active") || error.message.includes("ended")) {
          res.status(400).json({
            success: false,
            message: error.message,
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        message: "Failed to record vote",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public removeVote = async (req: Request, res: Response): Promise<void> => {
    try {
      const pollId = parseInt(req.params.id);
      const optionId = parseInt(req.params.optionId);
      const employeeId = (req.user as any).employee?.id;
      console.log("dataRemoving:", pollId, optionId, employeeId);

      if (isNaN(pollId) || isNaN(optionId)) {
        res.status(400).json({
          success: false,
          message: "Invalid poll or option ID",
        });
        return;
      }

      if (!employeeId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized - Employee information missing",
        });
        return;
      }

      console.log("removePollId:", pollId, optionId);

      await this.pollService.removeVote(pollId, employeeId, optionId);

      const response: ApiResponse<null> = {
        success: true,
        data: null,
        message: "Vote removed successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(`Error removing vote:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to remove vote",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getPollStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const pollId = parseInt(req.params.id);

      if (isNaN(pollId)) {
        res.status(400).json({
          success: false,
          message: "Invalid poll ID",
        });
        return;
      }

      const stats = await this.pollService.getPollStats(pollId);

      const response: ApiResponse<typeof stats> = {
        success: true,
        data: stats,
        message: "Poll statistics retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(`Error fetching poll statistics:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch poll statistics",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}
