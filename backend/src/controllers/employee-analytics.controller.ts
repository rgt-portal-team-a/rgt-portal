import { Request, Response } from "express";
import { EmployeeAnalyticsService } from "@/services/employee-analytics.service";
import { Logger } from "@/services/logger.service";
import { ApiResponse } from "@/dtos/response.dto";

export class EmployeeAnalyticsController {
  private employeeAnalyticsService: EmployeeAnalyticsService;
  private logger: Logger;

  constructor() {
    this.employeeAnalyticsService = new EmployeeAnalyticsService();
    this.logger = new Logger("EmployeeAnalyticsController");
  }

  public getTurnoverTrendsOverTime = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;
      
      const data = await this.employeeAnalyticsService.getTurnoverTrendsOverTime(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      const response: ApiResponse<typeof data> = {
        success: true,
        data,
        message: "Turnover trends data retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error fetching turnover trends data:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch turnover trends data",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getReasonsForLeaving = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.employeeAnalyticsService.getReasonsForLeaving();

      const response: ApiResponse<typeof data> = {
        success: true,
        data,
        message: "Reasons for leaving data retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error fetching reasons for leaving data:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch reasons for leaving data",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getTurnoverRatesByPosition = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.employeeAnalyticsService.getTurnoverRatesByPosition();

      const response: ApiResponse<typeof data> = {
        success: true,
        data,
        message: "Turnover rates by position data retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error fetching turnover rates by position data:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch turnover rates by position data",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getTurnoverByTenure = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.employeeAnalyticsService.getTurnoverByTenure();

      const response: ApiResponse<typeof data> = {
        success: true,
        data,
        message: "Turnover by tenure data retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error fetching turnover by tenure data:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch turnover by tenure data",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
} 