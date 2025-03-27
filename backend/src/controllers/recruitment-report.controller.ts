import { Request, Response } from "express";
import { RecruitmentService } from "@/services/recruitment.service";
import { Logger } from "@/services/logger.service";
import { ApiResponse } from "@/dtos/response.dto";
import { RecruitmentStatus } from "@/defaults/enum";

export class RecruitmentReportController {
  private recruitmentService: RecruitmentService;
  private logger: Logger;

  constructor() {
    this.recruitmentService = new RecruitmentService();
    this.logger = new Logger("RecruitmentReportController");
  }

  public getHiringLadderData = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;
      
      const data = await this.recruitmentService.getHiringLadderData(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      const response: ApiResponse<typeof data> = {
        success: true,
        data,
        message: "Hiring ladder data retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error fetching hiring ladder data:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch hiring ladder data",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getConversionRateByStage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;
      
      const data = await this.recruitmentService.getConversionRateByStage(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      const response: ApiResponse<typeof data> = {
        success: true,
        data,
        message: "Conversion rate by stage data retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error fetching conversion rate by stage data:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch conversion rate by stage data",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getSourceToHireSuccessRate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;
      
      const data = await this.recruitmentService.getSourceToHireSuccessRate(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      const response: ApiResponse<typeof data> = {
        success: true,
        data,
        message: "Source to hire success rate data retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error fetching source to hire success rate data:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch source to hire success rate data",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getDropoutRateByStage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;
      
      const data = await this.recruitmentService.getDropoutRateByStage(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      const response: ApiResponse<typeof data> = {
        success: true,
        data,
        message: "Dropout rate by stage data retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error fetching dropout rate by stage data:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch dropout rate by stage data",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getHeadcountByWorkType = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.recruitmentService.getHeadcountByWorkType();

      const response: ApiResponse<typeof data> = {
        success: true,
        data,
        message: "Headcount by work type data retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error fetching headcount by work type data:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch headcount by work type data",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getCandidatesByDepartment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;
      
      const data = await this.recruitmentService.getCandidatesByDepartment(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      const response: ApiResponse<typeof data> = {
        success: true,
        data,
        message: "Candidates by department data retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error fetching candidates by department data:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch candidates by department data",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
    
  public getEmployeeCountByDepartment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;
      
      const data = await this.recruitmentService.getEmployeeCountByDepartment(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      const response: ApiResponse<typeof data> = {
        success: true,
        data,
        message: "Employee count by department data retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error fetching employee count by department data:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch employee count by department data",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getEmployeeHeadCountByWorkType = async (req: Request, res: Response): Promise<void> => {
    try {
        const { startDate, endDate } = req.query;
        
        const data = await this.recruitmentService.getEmployeeHeadCountByWorkType(
            startDate ? new Date(startDate as string) : undefined,
            endDate ? new Date(endDate as string) : undefined
        );
        
        const response: ApiResponse<typeof data> = {
            success: true,
            data,
            message: "Employee head count by work type data retrieved successfully",
        };
        
        res.status(200).json(response);
    } catch (error) {
        this.logger.error("Error fetching employee head count by work type data:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch employee head count by work type data",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
  }
    
  public setAllEmployeesToHybrid = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.recruitmentService.setAllEmployeesToHybrid();
    } catch (error) {
      this.logger.error("Error setting all employees to hybrid:", error);
    }
  }
} 