import { Request, Response } from "express";
import { ProjectService } from "@/services/project.service";
import { ApiResponse } from "@/dtos/response.dto";
import { Logger } from "@/services/logger.service";
import { CreateProjectDto, UpdateProjectDto, AddEmployeeToProjectDto, AddEmployeesToProjectDto, UpdateEmployeeRoleDto } from "@/dtos/project.dto";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

export class ProjectController {
  private projectService: ProjectService;
  private logger: Logger;

  constructor() {
    this.projectService = new ProjectService();
    this.logger = new Logger("ProjectController");
  }

  public getAllProjects = async (req: Request, res: Response): Promise<void> => {
    try {
      const includeAssignments = req.query.includeAssignments === "true";
      const relations = includeAssignments ? ["lead", "assignments", "assignments.employee"] : ["lead"];

      const projects = await this.projectService.findAll(relations);

      const response: ApiResponse<typeof projects> = {
        success: true,
        data: projects,
        message: "Projects retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error fetching projects:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch projects",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getProjectById = async (req: Request, res: Response): Promise<void> => {
    try {
      const projectId = parseInt(req.params.id);

      if (isNaN(projectId)) {
        res.status(400).json({
          success: false,
          message: "Invalid project ID",
        });
        return;
      }

      const includeAssignments = req.query.includeAssignments === "true";
      const relations = includeAssignments ? ["lead", "assignments", "assignments.employee"] : ["lead"];

      const project = await this.projectService.findById(projectId, relations);

      if (!project) {
        res.status(404).json({
          success: false,
          message: "Project not found",
        });
        return;
      }

      const response: ApiResponse<typeof project> = {
        success: true,
        data: project,
        message: "Project retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(`Error fetching project:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch project",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getProjectsByLeadId = async (req: Request, res: Response): Promise<void> => {
    try {
      const leadId = parseInt(req.params.leadId);

      if (isNaN(leadId)) {
        res.status(400).json({
          success: false,
          message: "Invalid lead ID",
        });
        return;
      }

      const projects = await this.projectService.findByLeadId(leadId);

      const response: ApiResponse<typeof projects> = {
        success: true,
        data: projects,
        message: "Lead's projects retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(`Error fetching lead's projects:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch lead's projects",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getProjectsByStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status } = req.params;

      const projects = await this.projectService.findByStatus(status);

      const response: ApiResponse<typeof projects> = {
        success: true,
        data: projects,
        message: `Projects with status '${status}' retrieved successfully`,
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(`Error fetching projects by status:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch projects by status",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getProjectsByDateRange = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: "Both startDate and endDate are required",
        });
        return;
      }

      const projects = await this.projectService.findByDateRange(new Date(startDate as string), new Date(endDate as string));

      const response: ApiResponse<typeof projects> = {
        success: true,
        data: projects,
        message: "Projects in date range retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(`Error fetching projects by date range:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch projects by date range",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getProjectsByEmployee = async (req: Request, res: Response): Promise<void> => {
    try {
      const employeeId = parseInt(req.params.employeeId);

      if (isNaN(employeeId)) {
        res.status(400).json({
          success: false,
          message: "Invalid employee ID",
        });
        return;
      }

      const projects = await this.projectService.findByEmployee(employeeId);

      const response: ApiResponse<typeof projects> = {
        success: true,
        data: projects,
        message: "Employee's projects retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(`Error fetching employee's projects:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch employee's projects",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public createProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const projectDto = plainToInstance(CreateProjectDto, req.body);
      const errors = await validate(projectDto);

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.map((error) => ({
            property: error.property,
            constraints: error.constraints,
          })),
        });
        return;
      }

      const project = await this.projectService.create(projectDto);

      const response: ApiResponse<typeof project> = {
        success: true,
        data: project,
        message: "Project created successfully",
      };

      res.status(201).json(response);
    } catch (error) {
      this.logger.error("Error creating project:", error);
      res.status(error instanceof Error && error.message.includes("already exists") ? 409 : 500).json({
        success: false,
        message: "Failed to create project",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public updateProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const projectId = parseInt(req.params.id);

      if (isNaN(projectId)) {
        res.status(400).json({
          success: false,
          message: "Invalid project ID",
        });
        return;
      }

      const projectDto = plainToInstance(UpdateProjectDto, req.body);
      const errors = await validate(projectDto);

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.map((error) => ({
            property: error.property,
            constraints: error.constraints,
          })),
        });
        return;
      }

      const project = await this.projectService.update(projectId, projectDto);

      const response: ApiResponse<typeof project> = {
        success: true,
        data: project,
        message: "Project updated successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(`Error updating project:`, error);

      if (error instanceof Error && error.message.includes("not found")) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(error instanceof Error && error.message.includes("already exists") ? 409 : 500).json({
        success: false,
        message: "Failed to update project",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public deleteProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const projectId = parseInt(req.params.id);

      if (isNaN(projectId)) {
        res.status(400).json({
          success: false,
          message: "Invalid project ID",
        });
        return;
      }

      await this.projectService.delete(projectId);

      const response: ApiResponse<null> = {
        success: true,
        data: null,
        message: "Project deleted successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(`Error deleting project:`, error);

      if (error instanceof Error && error.message.includes("not found")) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      if (error instanceof Error && error.message.includes("assigned employees")) {
        res.status(409).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Failed to delete project",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public addEmployeeToProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const projectId = parseInt(req.params.id);

      if (isNaN(projectId)) {
        res.status(400).json({
          success: false,
          message: "Invalid project ID",
        });
        return;
      }

      const assignmentDto = plainToInstance(AddEmployeeToProjectDto, req.body);
      const errors = await validate(assignmentDto);

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.map((error) => ({
            property: error.property,
            constraints: error.constraints,
          })),
        });
        return;
      }

      const assignment = await this.projectService.addEmployeeToProject(projectId, assignmentDto.employeeId, assignmentDto.role);

      const response: ApiResponse<typeof assignment> = {
        success: true,
        data: assignment,
        message: "Employee added to project successfully",
      };

      res.status(201).json(response);
    } catch (error) {
      this.logger.error(`Error adding employee to project:`, error);

      if (error instanceof Error && (error.message.includes("not found") || error.message.includes("already assigned"))) {
        res.status(error.message.includes("not found") ? 404 : 409).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Failed to add employee to project",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public addEmployeesToProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const projectId = parseInt(req.params.id);

      if (isNaN(projectId)) {
        res.status(400).json({
          success: false,
          message: "Invalid project ID",
        });
        return;
      }

      const assignmentsDto = plainToInstance(AddEmployeesToProjectDto, req.body);
      const errors = await validate(assignmentsDto);

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.map((error) => ({
            property: error.property,
            constraints: error.constraints,
          })),
        });
        return;
      }

      const results = [];
      const failures = [];

      for (const assignment of assignmentsDto.assignments) {
        try {
          const result = await this.projectService.addEmployeeToProject(projectId, assignment.employeeId, assignment.role);
          results.push(result);
        } catch (error) {
          failures.push({
            employeeId: assignment.employeeId,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      const response: ApiResponse<{
        successful: typeof results;
        failed: typeof failures;
      }> = {
        success: failures.length === 0,
        data: {
          successful: results,
          failed: failures,
        },
        message:
          failures.length === 0
            ? "All employees added to project successfully"
            : `Added ${results.length} employees to project, ${failures.length} failed`,
      };

      res.status(failures.length === 0 ? 201 : 207).json(response);
    } catch (error) {
      this.logger.error(`Error adding employees to project:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to add employees to project",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public removeEmployeeFromProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const projectId = parseInt(req.params.id);
      const employeeId = parseInt(req.params.employeeId);

      if (isNaN(projectId) || isNaN(employeeId)) {
        res.status(400).json({
          success: false,
          message: "Invalid project ID or employee ID",
        });
        return;
      }

      await this.projectService.removeEmployeeFromProject(projectId, employeeId);

      const response: ApiResponse<null> = {
        success: true,
        data: null,
        message: "Employee removed from project successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(`Error removing employee from project:`, error);

      if (error instanceof Error && error.message.includes("not assigned")) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Failed to remove employee from project",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public updateEmployeeRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const projectId = parseInt(req.params.id);

      if (isNaN(projectId)) {
        res.status(400).json({
          success: false,
          message: "Invalid project ID",
        });
        return;
      }

      const roleDto = plainToInstance(UpdateEmployeeRoleDto, req.body);
      const errors = await validate(roleDto);

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.map((error) => ({
            property: error.property,
            constraints: error.constraints,
          })),
        });
        return;
      }

      const assignment = await this.projectService.updateEmployeeRole(projectId, roleDto.employeeId, roleDto.newRole);

      const response: ApiResponse<typeof assignment> = {
        success: true,
        data: assignment,
        message: "Employee role updated successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(`Error updating employee role:`, error);

      if (error instanceof Error && error.message.includes("not assigned")) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Failed to update employee role",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}
