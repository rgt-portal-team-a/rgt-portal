import { Request, Response } from "express";
import { RecruitmentService } from "@/services/recruitment.service";
import { ApiResponse } from "@/dtos/response.dto";
import { Logger } from "@/services/logger.service";
import { CreateRecruitmentDto, UpdateRecruitmentDto, RecruitmentFilterDto, StatusUpdateDto } from "@/dtos/recruitment.dto";
import { RecruitmentStatus } from "@/defaults/enum";

export class RecruitmentController {
  private recruitmentService: RecruitmentService;
  private logger: Logger;

  constructor() {
    this.recruitmentService = new RecruitmentService();
    this.logger = new Logger("RecruitmentController");
  }

  public getAllRecruitments = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const relations = ((req.query.relations as string) || "createdBy,employee").split(",").filter(Boolean);

      const filters: RecruitmentFilterDto = {};

      if (req.query.name) filters.name = req.query.name as string;
      if (req.query.email) filters.email = req.query.email as string;
      if (req.query.status) filters.status = req.query.status as RecruitmentStatus;
      if (req.query.type) filters.type = req.query.type as string;
      if (req.query.assignee) filters.assignee = req.query.assignee as string;
      if (req.query.position) filters.position = req.query.position as string;
      if (req.query.source) filters.source = req.query.source as string;
      if (req.query.location) filters.location = req.query.location as string;

      if (req.query.dateFrom) filters.dateFrom = new Date(req.query.dateFrom as string);
      if (req.query.dateTo) filters.dateTo = new Date(req.query.dateTo as string);

      if (req.query.createdFrom) filters.createdFrom = new Date(req.query.createdFrom as string);
      if (req.query.createdTo) filters.createdTo = new Date(req.query.createdTo as string);

      const result = await this.recruitmentService.findAll(Object.keys(filters).length > 0 ? filters : undefined, relations, page, limit);

      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        message: "Recruitments retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error fetching recruitments:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch recruitments",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getRecruitmentById = async (req: Request, res: Response): Promise<void> => {
    try {
      const recruitmentId = req.params.id;

      if (!recruitmentId) {
        res.status(400).json({
          success: false,
          message: "Invalid recruitment ID",
        });
        return;
      }

      const relations = ((req.query.relations as string) || "createdBy,employee,emergencyContacts").split(",").filter(Boolean);

      const recruitment = await this.recruitmentService.findById(recruitmentId, relations);

      if (!recruitment) {
        res.status(404).json({
          success: false,
          message: "Recruitment not found",
        });
        return;
      }

      const response: ApiResponse<typeof recruitment> = {
        success: true,
        data: recruitment,
        message: "Recruitment retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(`Error fetching recruitment:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch recruitment",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public createBatchRecruitment = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;
      const recruitmentData: CreateRecruitmentDto[] = req.body;

      const recruitments = await this.recruitmentService.createBatch(recruitmentData);

      const response: ApiResponse<typeof recruitments> = {
        success: true,
        data: recruitments,
        message: "Recruitments created successfully",
      };

      res.status(201).json(response);
    } catch (error: any) {
      this.logger.error("Error creating batch recruitment:", error);
      res.status(error.message.includes("not found") ? 404 : 500).json({
        success: false,
        message: "Failed to create batch recruitment",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public createRecruitment = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;
      const recruitmentData: CreateRecruitmentDto = req.body;

      const recruitment = await this.recruitmentService.create(recruitmentData, userId);

      const response: ApiResponse<typeof recruitment> = {
        success: true,
        data: recruitment,
        message: "Recruitment created successfully",
      };

      res.status(201).json(response);
    } catch (error: any) {
      this.logger.error("Error creating recruitment:", error);
      res.status(error.message.includes("not found") ? 404 : 500).json({
        success: false,
        message: "Failed to create recruitment",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public updateRecruitment = async (req: Request, res: Response): Promise<void> => {
    try {
      const recruitmentId = req.params.id;

      if (!recruitmentId) {
        res.status(400).json({
          success: false,
          message: "Invalid recruitment ID",
        });
        return;
      }

      const recruitmentData: UpdateRecruitmentDto = req.body;

      const updatedRecruitment = await this.recruitmentService.update(recruitmentId, recruitmentData);

      const response: ApiResponse<typeof updatedRecruitment> = {
        success: true,
        data: updatedRecruitment,
        message: "Recruitment updated successfully",
      };

      res.status(200).json(response);
    } catch (error: any) {
      this.logger.error(`Error updating recruitment:`, error);
      res.status(error.message.includes("not found") ? 404 : 500).json({
        success: false,
        message: "Failed to update recruitment",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public updateRecruitmentStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const recruitmentId = req.params.id;

      if (!recruitmentId) {
        res.status(400).json({
          success: false,
          message: "Invalid recruitment ID",
        });
        return;
      }

      const { status, failStage, failReason }: StatusUpdateDto = req.body;

      if (!Object.values(RecruitmentStatus).includes(status)) {
        res.status(400).json({
          success: false,
          message: "Invalid status value",
        });
        return;
      }

      if (status === RecruitmentStatus.NOT_HIRED && !failStage) {
        res.status(400).json({
          success: false,
          message: "Fail stage is required when status is 'Not Hired'",
        });
        return;
      }

      const updatedRecruitment = await this.recruitmentService.updateStatus(recruitmentId, status, failStage, failReason);

      const response: ApiResponse<typeof updatedRecruitment> = {
        success: true,
        data: updatedRecruitment,
        message: "Recruitment status updated successfully",
      };

      res.status(200).json(response);
    } catch (error: any) {
      this.logger.error(`Error updating recruitment status:`, error);
      res.status(error.message.includes("not found") ? 404 : 500).json({
        success: false,
        message: "Failed to update recruitment status",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public deleteRecruitment = async (req: Request, res: Response): Promise<void> => {
    try {
      const recruitmentId = req.params.id;

      if (!recruitmentId) {
        res.status(400).json({
          success: false,
          message: "Invalid recruitment ID",
        });
        return;
      }

      await this.recruitmentService.delete(recruitmentId);

      res.status(200).json({
        success: true,
        message: "Recruitment deleted successfully",
      });
    } catch (error: any) {
      this.logger.error(`Error deleting recruitment:`, error);
      res.status(error.message.includes("not found") ? 404 : 500).json({
        success: false,
        message: "Failed to delete recruitment",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getRecruitmentStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const statistics = await this.recruitmentService.getStatistics();

      const response: ApiResponse<typeof statistics> = {
        success: true,
        data: statistics,
        message: "Recruitment statistics retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(`Error fetching recruitment statistics:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch recruitment statistics",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getUpcomingDueDates = async (req: Request, res: Response): Promise<void> => {
    try {
      const days = parseInt(req.query.days as string) || 7;

      const upcomingRecruitments = await this.recruitmentService.getByDueDate(days);

      const response: ApiResponse<typeof upcomingRecruitments> = {
        success: true,
        data: upcomingRecruitments,
        message: "Upcoming due date recruitments retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(`Error fetching upcoming due dates:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch upcoming due dates",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public markAsNotified = async (req: Request, res: Response): Promise<void> => {
    try {
      const recruitmentId = req.params.id;

      if (!recruitmentId) {
        res.status(400).json({
          success: false,
          message: "Invalid recruitment ID",
        });
        return;
      }

      const updatedRecruitment = await this.recruitmentService.markAsNotified(recruitmentId);

      const response: ApiResponse<typeof updatedRecruitment> = {
        success: true,
        data: updatedRecruitment,
        message: "Recruitment marked as notified successfully",
      };

      res.status(200).json(response);
    } catch (error: any) {
      this.logger.error(`Error marking recruitment as notified:`, error);
      res.status(error.message.includes("not found") ? 404 : 500).json({
        success: false,
        message: "Failed to mark recruitment as notified",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}
