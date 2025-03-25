import { Request, Response } from "express";
import { PtoRequestService } from "@/services/pto-request.service";
import { ApiResponse } from "@/dtos/response.dto";
import { Logger } from "@/services/logger.service";
import { CreatePtoRequestDto, UpdatePtoRequestDto } from "@/dtos/pto-request.dto";
import { PtoStatusType } from "@/defaults/enum";
import { EmployeeService } from "@/services/employee.service";

export class PtoRequestController {
  private ptoRequestService: PtoRequestService;
  private logger: Logger;
  private employeeService: EmployeeService;

  constructor() {
    this.ptoRequestService = new PtoRequestService();
    this.logger = new Logger("PtoRequestController");
    this.employeeService = new EmployeeService();
  }

  public getAllPtoRequests = async (req: Request, res: Response): Promise<void> => {
    try {
      const ptoRequests = await this.ptoRequestService.findAll();

      const response: ApiResponse<typeof ptoRequests> = {
        success: true,
        data: ptoRequests,
        message: "PTO requests retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error fetching PTO requests:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch PTO requests",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getPtoRequestById = async (req: Request, res: Response): Promise<void> => {
    try {
      const ptoRequest = await this.ptoRequestService.findById(parseInt(req.params.id));

      if (!ptoRequest) {
        res.status(404).json({
          success: false,
          message: "PTO request not found",
        });
        return;
      }

      const response: ApiResponse<typeof ptoRequest> = {
        success: true,
        data: ptoRequest,
        message: "PTO request retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error fetching PTO request:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch PTO request",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getMyPtoRequests = async (req: Request, res: Response): Promise<void> => {
    try {
      const employeeId = (req.user as any).employee.id;
      const ptoRequests = await this.ptoRequestService.findByEmployeeId(employeeId);

      const response: ApiResponse<typeof ptoRequests> = {
        success: true,
        data: ptoRequests,
        message: "My PTO requests retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error fetching employee PTO requests:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch PTO requests",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getDepartmentPtoRequests = async (req: Request, res: Response): Promise<void> => {
    try {
      const departmentId = parseInt(req.params.departmentId);
      const ptoRequests = await this.ptoRequestService.findByDepartmentId(departmentId);

      const response: ApiResponse<typeof ptoRequests> = {
        success: true,
        data: ptoRequests,
        message: "Department PTO requests retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error fetching department PTO requests:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch department PTO requests",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getEmployeePtoRequests = async (req: Request, res: Response): Promise<void> => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      const ptoRequests = await this.ptoRequestService.findByEmployeeId(employeeId);

      const response: ApiResponse<typeof ptoRequests> = {
        success: true,
        data: ptoRequests,
        message: "Employee PTO requests retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error fetching employee PTO requests:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch employee PTO requests",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public createPtoRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const employee = await (req.user as any).employee;
      const ptoData: CreatePtoRequestDto = {
        ...req.body,
      };

      console.log("Employee", employee);
      console.log("PTO Data", ptoData);
      
      

      const newPtoRequest = await this.ptoRequestService.create(ptoData, employee);

      const response: ApiResponse<typeof newPtoRequest> = {
        success: true,
        data: newPtoRequest,
        message: "PTO request created successfully",
      };

      res.status(201).json(response);
    } catch (error) {
      this.logger.error("Error creating PTO request:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create PTO request",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public updatePtoRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.params.id || isNaN(parseInt(req.params.id))) {
        res.status(400).json({
          success: false,
          message: "PTO request ID is required",
        });
        return;
      }
      const updateData: UpdatePtoRequestDto = req.body;

      let newUpdateData = { ...updateData };

      if (
        updateData.status &&
        [PtoStatusType.HR_APPROVED, PtoStatusType.MANAGER_APPROVED, PtoStatusType.HR_DECLINED, PtoStatusType.MANAGER_DECLINED].includes(
          updateData.status,
        )
      ) {
        updateData.approver = {id: (req.user as any).employee.id};
      }

      const updatedPtoRequest = await this.ptoRequestService.update(parseInt(req.params.id), newUpdateData);

      const response: ApiResponse<typeof updatedPtoRequest> = {
        success: true,
        data: updatedPtoRequest,
        message: "PTO request updated successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error updating PTO request:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update PTO request",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public deletePtoRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const requestId = parseInt(req.params.id);
      const ptoRequest = await this.ptoRequestService.findById(requestId);

      if (!ptoRequest) {
        res.status(404).json({
          success: false,
          message: "PTO request not found",
        });
        return;
      }

      const isAdmin = (req as any).user.role.name === "admin";

      if (ptoRequest.status !== "pending" && !isAdmin) {
        res.status(400).json({
          success: false,
          message: "Cannot delete approved or rejected PTO requests",
        });
        return;
      }

      await this.ptoRequestService.delete(requestId);

      res.status(200).json({
        success: true,
        message: "PTO request deleted successfully",
      });
    } catch (error) {
      this.logger.error("Error deleting PTO request:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete PTO request",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getDaysOffSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const employeeId = parseInt(req.params.employeeId || (req as any).user.employee.id);
      const year = parseInt(req.query.year as string) || new Date().getFullYear();

      const summary = await this.ptoRequestService.calculateDaysOff(employeeId, year);

      const response: ApiResponse<typeof summary> = {
        success: true,
        data: summary,
        message: "Days off summary retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error calculating days off summary:", error);
      res.status(500).json({
        success: false,
        message: "Failed to calculate days off summary",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}
