import { Request, Response } from "express";
import { validate } from "class-validator";
import { EmployeeRecognitionService } from "@/services/employee-recognition.service";
import { Logger } from "@/services/logger.service";
import { ApiResponse } from "@/dtos/response.dto";
import { CreateRecognitionDto } from "@/dtos/employee-recognition.dto";

export class EmployeeRecognitionController {
  private recognitionService: EmployeeRecognitionService;
  private logger: Logger;

  constructor() {
    this.recognitionService = new EmployeeRecognitionService();
    this.logger = new Logger("EmployeeRecognitionController");
  }

  public getRecognitions = async (req: Request, res: Response): Promise<void> => {
    try {
      const recognitions = await this.recognitionService.findAll();

      const response: ApiResponse<typeof recognitions> = {
        success: true,
        data: recognitions,
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error fetching recognitions:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch recognitions",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getRecognitionsByEmployee = async (req: Request, res: Response): Promise<void> => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      const recognitions = await this.recognitionService.findByEmployee(employeeId);

      const response: ApiResponse<typeof recognitions> = {
        success: true,
        data: recognitions,
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(`Error fetching recognitions for employee ${req.params.employeeId}:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch recognitions",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public createRecognition = async (req: Request, res: Response): Promise<void> => {
    try {
      const recognitionData: CreateRecognitionDto = req.body;

      const errors = await validate(recognitionData);
      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.map((error: any) => ({
            property: error.property,
            constraints: error.constraints,
          })),
        });
        return;
      }

      const newRecognition = await this.recognitionService.create(recognitionData);

      const response: ApiResponse<typeof newRecognition> = {
        success: true,
        data: newRecognition,
        message: "Recognition created successfully",
      };

      res.status(201).json(response);
    } catch (error) {
      this.logger.error("Error creating recognition:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create recognition",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public createBulkRecognitions = async (req: Request, res: Response): Promise<void> => {
    try {
      const recognitionsData: CreateRecognitionDto[] = req.body;

      for (const recognitionData of recognitionsData) {
        const errors = await validate(recognitionData);
        if (errors.length > 0) {
          res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors.map((error: any) => ({
              property: error.property,
              constraints: error.constraints,
            })),
          });
          return;
        }
      }

      const newRecognitions = await this.recognitionService.createBulk(recognitionsData);

      const response: ApiResponse<typeof newRecognitions> = {
        success: true,
        data: newRecognitions,
        message: `${newRecognitions.length} recognitions created successfully`,
      };

      res.status(201).json(response);
    } catch (error) {
      this.logger.error("Error creating bulk recognitions:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create bulk recognitions",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public deleteRecognition = async (req: Request, res: Response): Promise<void> => {
    try {
      const recognitionId = parseInt(req.params.id);
      await this.recognitionService.delete(recognitionId);

      res.status(200).json({
        success: true,
        message: "Recognition deleted successfully",
      });
    } catch (error) {
      this.logger.error(`Error deleting recognition ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to delete recognition",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getRecognitionsByCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const category = req.params.category;
      const recognitions = await this.recognitionService.findByCategory(category);

      const response: ApiResponse<typeof recognitions> = {
        success: true,
        data: recognitions,
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(`Error fetching recognitions for category ${req.params.category}:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch recognitions",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getRecognitionsByEmployeeId = async (employeeId: number): Promise<any> => {
    try {
      const recognitions = await this.recognitionService.findByEmployee(employeeId);
      return recognitions;
    } catch (error) {
      this.logger.error(`Error fetching recognitions for employee ${employeeId}:`, error);
      throw error;
    }
  };
}
