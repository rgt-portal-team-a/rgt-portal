import { Request, Response } from "express";
import { DepartmentService } from "@/services/department.service";
import { ApiResponse } from "@/dtos/response.dto";
import { Logger } from "@/services/logger.service";
import { CreateDepartmentDto, UpdateDepartmentDto, AddEmployeeToDepartmentDto, AddEmployeesToDepartmentDto } from "@/dtos/department.dto";

export class DepartmentController {
  private departmentService: DepartmentService;
  private logger: Logger;

  constructor() {
    this.departmentService = new DepartmentService();
    this.logger = new Logger("DepartmentController");
  }

  public getAllDepartments = async (req: Request, res: Response): Promise<void> => {
    try {
      const includeEmployees = req.query.includeEmployees === "true";
      const relations = includeEmployees ? ["manager", "employees", "employees.user", "employees.user.role", "manager.user", "manager.user.role"] : ["manager", "manager.user", "manager.user.role"];

      const departments = await this.departmentService.findAll(relations);

      const response: ApiResponse<typeof departments> = {
        success: true,
        data: departments,
        message: "Departments retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error fetching departments:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch departments",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getDepartmentById = async (req: Request, res: Response): Promise<void> => {
    try {
      const departmentId = parseInt(req.params.id);

      if (isNaN(departmentId)) {
        res.status(400).json({
          success: false,
          message: "Invalid department ID",
        });
        return;
      }

      const includeEmployees = req.query.includeEmployees === "true";
      const relations = includeEmployees ? ["manager", "employees"] : ["manager"];

      const department = await this.departmentService.findById(departmentId, relations);

      if (!department) {
        res.status(404).json({
          success: false,
          message: "Department not found",
        });
        return;
      }

      const response: ApiResponse<typeof department> = {
        success: true,
        data: department,
        message: "Department retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(`Error fetching department:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch department",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getDepartmentsByManagerId = async (req: Request, res: Response): Promise<void> => {
    try {
      const managerId = parseInt(req.params.managerId);

      if (isNaN(managerId)) {
        res.status(400).json({
          success: false,
          message: "Invalid manager ID",
        });
        return;
      }

      const departments = await this.departmentService.findByManagerId(managerId);

      const response: ApiResponse<typeof departments> = {
        success: true,
        data: departments,
        message: "Manager's departments retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(`Error fetching manager's departments:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch manager's departments",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public createDepartment = async (req: Request, res: Response): Promise<void> => {
    try {
      const departmentData: CreateDepartmentDto = req.body;

      if (!departmentData.name || !departmentData.managerId) {
        res.status(400).json({
          success: false,
          message: "Department name and manager ID are required",
        });
        return;
      }

      const department = await this.departmentService.create(departmentData);

      const response: ApiResponse<typeof department> = {
        success: true,
        data: department,
        message: "Department created successfully",
      };

      res.status(201).json(response);
    } catch (error) {
      this.logger.error("Error creating department:", error);

      if (error instanceof Error) {
        if (error.message.includes("already exists")) {
          res.status(409).json({
            success: false,
            message: "Department creation failed, department with this name already exists",
            error: error.message,
          });
          return;
        }

        if (error.message.includes("not found")) {
          res.status(404).json({
            success: false,
            message: "Department creation failed, manager not found",
            error: error.message,
          });
          return;
        }

        if (error.message.includes("already a manager for another department")) {
          res.status(409).json({
            success: false,
            message: "Department creation failed",
            error: error.message,
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        message: "Failed to create department",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public updateDepartment = async (req: Request, res: Response): Promise<void> => {
    try {
      const departmentId = parseInt(req.params.id);

      if (isNaN(departmentId)) {
        res.status(400).json({
          success: false,
          message: "Invalid department ID",
        });
        return;
      }

      const updateData: UpdateDepartmentDto = req.body;

      if (Object.keys(updateData).length === 0) {
        res.status(400).json({
          success: false,
          message: "No update data provided",
        });
        return;
      }

      const department = await this.departmentService.update(departmentId, updateData);

      const response: ApiResponse<typeof department> = {
        success: true,
        data: department,
        message: "Department updated successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(`Error updating department:`, error);

      if (error instanceof Error) {
        if (error.message === "Department not found") {
          res.status(404).json({
            success: false,
            message: "Department update failed",
            error: error.message,
          });
          return;
        }

        if (error.message.includes("already exists")) {
          res.status(409).json({
            success: false,
            message: "Department update failed",
            error: error.message,
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        message: "Failed to update department",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public deleteDepartment = async (req: Request, res: Response): Promise<void> => {
    try {
      const departmentId = parseInt(req.params.id);

      if (isNaN(departmentId)) {
        res.status(400).json({
          success: false,
          message: "Invalid department ID",
        });
        return;
      }

      await this.departmentService.delete(departmentId);

      res.status(200).json({
        success: true,
        message: "Department deleted successfully",
      });
    } catch (error) {
      this.logger.error(`Error deleting department:`, error);

      if (error instanceof Error) {
        if (error.message === "Department not found") {
          res.status(404).json({
            success: false,
            message: "Department deletion failed",
            error: error.message,
          });
          return;
        }

        if (error.message.includes("assigned employees")) {
          res.status(409).json({
            success: false,
            message: "Department deletion failed",
            error: error.message,
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        message: "Failed to delete department",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getDepartmentStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const departmentId = parseInt(req.params.id);

      // Handle NaN
      if (isNaN(departmentId)) {
        res.status(400).json({
          success: false,
          message: "Invalid department ID",
        });
        return;
      }

      const stats = await this.departmentService.getDepartmentStats(departmentId);

      const response: ApiResponse<typeof stats> = {
        success: true,
        data: stats,
        message: "Department statistics retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(`Error fetching department stats:`, error);

      if (error instanceof Error && error.message === "Department not found") {
        res.status(404).json({
          success: false,
          message: "Failed to retrieve department statistics",
          error: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Failed to retrieve department statistics",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public transferEmployees = async (req: Request, res: Response): Promise<void> => {
    try {
      const { fromDepartmentId, toDepartmentId } = req.body;

      if (!fromDepartmentId || !toDepartmentId) {
        res.status(400).json({
          success: false,
          message: "Source and target department IDs are required",
        });
        return;
      }

      const sourceDeptId = parseInt(fromDepartmentId);
      const targetDeptId = parseInt(toDepartmentId);

      if (isNaN(sourceDeptId) || isNaN(targetDeptId)) {
        res.status(400).json({
          success: false,
          message: "Invalid department IDs",
        });
        return;
      }

      if (sourceDeptId === targetDeptId) {
        res.status(400).json({
          success: false,
          message: "Source and target departments cannot be the same",
        });
        return;
      }

      await this.departmentService.transferEmployees(sourceDeptId, targetDeptId);

      res.status(200).json({
        success: true,
        message: "Employees transferred successfully",
      });
    } catch (error) {
      this.logger.error("Error transferring employees:", error);

      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          res.status(404).json({
            success: false,
            message: "Employee transfer failed",
            error: error.message,
          });
          return;
        }

        if (error.message.includes("no employees")) {
          res.status(400).json({
            success: false,
            message: "Employee transfer failed",
            error: error.message,
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        message: "Failed to transfer employees",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public addEmployeeToDepartment = async (req: Request, res: Response): Promise<void> => {
    try {
      const departmentId = parseInt(req.params.id);
      const { employeeId } = req.body as AddEmployeeToDepartmentDto;

      if (isNaN(departmentId) || !employeeId || isNaN(parseInt(employeeId.toString()))) {
        res.status(400).json({
          success: false,
          message: "Valid department and employee IDs are required",
        });
        return;
      }

      const department = await this.departmentService.addEmployeeToDepartment(departmentId, parseInt(employeeId.toString()));

      const response: ApiResponse<typeof department> = {
        success: true,
        data: department,
        message: "Employee added to department successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error adding employee to department:", error);

      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          res.status(404).json({
            success: false,
            message: "Failed to add employee to department",
            error: error.message,
          });
          return;
        }

        if (error.message.includes("already in this department")) {
          res.status(409).json({
            success: false,
            message: "Failed to add employee to department",
            error: error.message,
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        message: "Failed to add employee to department",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public addEmployeesToDepartment = async (req: Request, res: Response): Promise<void> => {
    try {
      const departmentId = parseInt(req.params.id);
      const { employeeIds } = req.body as AddEmployeesToDepartmentDto;

      if (isNaN(departmentId) || !employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
        res.status(400).json({
          success: false,
          message: "Valid department ID and non-empty array of employee IDs are required",
        });
        return;
      }

      const parsedEmployeeIds = employeeIds.map((id) => parseInt(id.toString()));
      if (parsedEmployeeIds.some(isNaN)) {
        res.status(400).json({
          success: false,
          message: "All employee IDs must be valid numbers",
        });
        return;
      }

      const department = await this.departmentService.addEmployeesToDepartment(departmentId, parsedEmployeeIds);

      const response: ApiResponse<typeof department> = {
        success: true,
        data: department,
        message: "Employees added to department successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error adding employees to department:", error);

      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          res.status(404).json({
            success: false,
            message: "Failed to add employees to department",
            error: error.message,
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        message: "Failed to add employees to department",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public removeEmployeeFromDepartment = async (req: Request, res: Response): Promise<void> => {
    try {
      const departmentId = parseInt(req.params.id);
      const employeeId = parseInt(req.params.employeeId);

      if (isNaN(departmentId) || isNaN(employeeId)) {
        res.status(400).json({
          success: false,
          message: "Valid department and employee IDs are required",
        });
        return;
      }

      const department = await this.departmentService.removeEmployeeFromDepartment(departmentId, employeeId);

      const response: ApiResponse<typeof department> = {
        success: true,
        data: department,
        message: "Employee removed from department successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error removing employee from department:", error);

      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          res.status(404).json({
            success: false,
            message: "Failed to remove employee from department",
            error: error.message,
          });
          return;
        }

        if (error.message.includes("not in this department")) {
          res.status(400).json({
            success: false,
            message: "Failed to remove employee from department",
            error: error.message,
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        message: "Failed to remove employee from department",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public updateManager = async (req: Request, res: Response): Promise<void> => {
    try {
      const departmentId = parseInt(req.params.id);
      const { managerId } = req.body as { managerId: number };

      if (isNaN(departmentId) || isNaN(managerId)) {
        res.status(400).json({
          success: false,
          message: "Valid department and manager IDs are required",
        });
        return;
      }

      const department = await this.departmentService.updateManager(departmentId, managerId);

      const response: ApiResponse<typeof department> = {
        success: true,
        data: department,
        message: "Manager updated successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error updating manager:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update manager",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
