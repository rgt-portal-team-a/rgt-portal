import { AppDataSource } from "@/database/data-source";
import { Repository, QueryRunner, Between, FindOptionsRelations } from "typeorm";
import { Project } from "@/entities/project.entity";
import { Employee } from "@/entities/employee.entity";
import { ProjectAssignment } from "@/entities/project-assignment.entity";
import { CreateProjectDto, UpdateProjectDto } from "@/dtos/project.dto";
import { DatabaseService } from "@/services/database.service";
import { Logger } from "@/services/logger.service";
import { NotificationService } from "./notifications/ntofication.service";
import { NotificationTemplates } from "./notifications/templates";
import { User } from "@/entities/user.entity";

export class ProjectService {
  private projectRepository: Repository<Project>;
  private employeeRepository: Repository<Employee>;
  private projectAssignmentRepository: Repository<ProjectAssignment>;
  private logger: Logger;
  private notificationService: NotificationService;

  constructor() {
    this.projectRepository = AppDataSource.getRepository(Project);
    this.employeeRepository = AppDataSource.getRepository(Employee);
    this.projectAssignmentRepository = AppDataSource.getRepository(ProjectAssignment);
    this.logger = new Logger("ProjectService");
    this.notificationService = new NotificationService();
  }

  async findAll(relations: string[] = ["lead"]): Promise<Project[]> {
    try {
      return this.projectRepository.find({
        relations,
        order: { name: "ASC" },
      });
    } catch (error) {
      this.logger.error("Error fetching all projects:", error);
      throw error;
    }
  }

  async findById(id: number, relations: string[] = ["lead", "assignments", "assignments.employee"]): Promise<Project | null> {
    try {
      return this.projectRepository.findOne({
        where: { id },
        relations,
      });
    } catch (error) {
      this.logger.error(`Error fetching project with ID ${id}:`, error);
      throw error;
    }
  }

  async findByName(name: string): Promise<Project | null> {
    try {
      return this.projectRepository.findOne({
        where: { name },
        relations: ["lead"],
      });
    } catch (error) {
      this.logger.error(`Error fetching project with name ${name}:`, error);
      throw error;
    }
  }

  async findByLeadId(leadId: number): Promise<Project[]> {
    try {
      return this.projectRepository.find({
        where: { leadId },
        relations: ["assignments", "assignments.employee"],
        order: { name: "ASC" },
      });
    } catch (error) {
      this.logger.error(`Error fetching projects led by employee ID ${leadId}:`, error);
      throw error;
    }
  }

  async findByStatus(status: string): Promise<Project[]> {
    try {
      return this.projectRepository.find({
        where: { status },
        relations: ["lead"],
        order: { endDate: "ASC" },
      });
    } catch (error) {
      this.logger.error(`Error fetching projects with status ${status}:`, error);
      throw error;
    }
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Project[]> {
    try {
      return this.projectRepository.find({
        where: [{ startDate: Between(startDate, endDate) }, { endDate: Between(startDate, endDate) }],
        relations: ["lead"],
        order: { startDate: "ASC" },
      });
    } catch (error) {
      this.logger.error(`Error fetching projects in date range:`, error);
      throw error;
    }
  }

  async findByEmployee(employeeId: number): Promise<Project[]> {
    try {
      const assignments = await this.projectAssignmentRepository.find({
        where: { employeeId },
        relations: ["project", "project.lead"],
      });

      return assignments.map((assignment) => assignment.project);
    } catch (error) {
      this.logger.error(`Error fetching projects for employee ID ${employeeId}:`, error);
      throw error;
    }
  }

  async create(projectData: CreateProjectDto): Promise<Project> {
    let queryRunner: QueryRunner | null = null;

    try {
      const lead = await this.employeeRepository.findOneBy({ id: projectData.leadId });
      if (!lead) {
        throw new Error("Project lead not found");
      }

      const existingProject = await this.findByName(projectData.name);
      if (existingProject) {
        throw new Error("Project with this name already exists");
      }

      queryRunner = await DatabaseService.createTransaction();

      const project = this.projectRepository.create(projectData);
      const savedProject = await queryRunner.manager.save(Project, project);

      await DatabaseService.commitTransaction(queryRunner);

      return this.findById(savedProject.id) as Promise<Project>;
    } catch (error) {
      if (queryRunner) {
        await DatabaseService.rollbackTransaction(queryRunner);
      }
      this.logger.error("Error creating project:", error);
      throw error;
    }
  }

  async update(id: number, updateData: UpdateProjectDto): Promise<Project> {
    let queryRunner: QueryRunner | null = null;

    try {
      const project = await this.findById(id);
      if (!project) {
        throw new Error("Project not found");
      }

      if (updateData.leadId && updateData.leadId !== project.leadId) {
        const lead = await this.employeeRepository.findOneBy({ id: updateData.leadId });
        if (!lead) {
          throw new Error("Project lead not found");
        }
      }

      if (updateData.name && updateData.name !== project.name) {
        const existingProject = await this.findByName(updateData.name);
        if (existingProject) {
          throw new Error("Project with this name already exists");
        }
      }

      queryRunner = await DatabaseService.createTransaction();

      await queryRunner.manager.update(Project, id, updateData);

      await DatabaseService.commitTransaction(queryRunner);

      return this.findById(id) as Promise<Project>;
    } catch (error) {
      if (queryRunner) {
        await DatabaseService.rollbackTransaction(queryRunner);
      }
      this.logger.error(`Error updating project with ID ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    let queryRunner: QueryRunner | null = null;

    try {
      const project = await this.findById(id);
      if (!project) {
        throw new Error("Project not found");
      }

      if (project.assignments && project.assignments.length > 0) {
        throw new Error("Cannot delete project with assigned employees");
      }

      queryRunner = await DatabaseService.createTransaction();

      await queryRunner.manager.delete(Project, id);

      await DatabaseService.commitTransaction(queryRunner);
    } catch (error) {
      if (queryRunner) {
        await DatabaseService.rollbackTransaction(queryRunner);
      }
      this.logger.error(`Error deleting project with ID ${id}:`, error);
      throw error;
    }
  }

  async addEmployeeToProject(projectId: number, employeeId: number, role: string): Promise<ProjectAssignment> {
    let queryRunner: QueryRunner | null = null;

    try {
      const project = await this.findById(projectId);
      if (!project) {
        throw new Error("Project not found");
      }

      const employee = await this.employeeRepository.findOne({
        where: { id: employeeId },
        relations: ["user"],
      });

      if (!employee) {
        throw new Error("Employee not found");
      }

      const existingAssignment = await this.projectAssignmentRepository.findOne({
        where: { projectId, employeeId },
      });

      if (existingAssignment) {
        throw new Error("Employee is already assigned to this project");
      }

      queryRunner = await DatabaseService.createTransaction();

      const assignment = this.projectAssignmentRepository.create({
        projectId,
        employeeId,
        role,
        assignedDate: new Date(),
      });

      const savedAssignment = await queryRunner.manager.save(ProjectAssignment, assignment);

      await DatabaseService.commitTransaction(queryRunner);

      // // Send notification for project assignment
      // if (employee.user) {
      //   await this.notificationService.createNotification(NotificationTemplates.projectAssignment(project, employee.user.id, employee.user));
      // }

      return this.projectAssignmentRepository.findOne({
        where: { id: savedAssignment.id },
        relations: ["project", "employee"],
      }) as Promise<ProjectAssignment>;
    } catch (error) {
      if (queryRunner) {
        await DatabaseService.rollbackTransaction(queryRunner);
      }
      this.logger.error(`Error adding employee to project:`, error);
      throw error;
    }
  }

  async removeEmployeeFromProject(projectId: number, employeeId: number): Promise<void> {
    let queryRunner: QueryRunner | null = null;

    try {
      const assignment = await this.projectAssignmentRepository.findOne({
        where: { projectId, employeeId },
      });

      if (!assignment) {
        throw new Error("Employee is not assigned to this project");
      }

      queryRunner = await DatabaseService.createTransaction();

      await queryRunner.manager.delete(ProjectAssignment, assignment.id);

      await DatabaseService.commitTransaction(queryRunner);
    } catch (error) {
      if (queryRunner) {
        await DatabaseService.rollbackTransaction(queryRunner);
      }
      this.logger.error(`Error removing employee from project:`, error);
      throw error;
    }
  }

  async updateEmployeeRole(projectId: number, employeeId: number, newRole: string): Promise<ProjectAssignment> {
    let queryRunner: QueryRunner | null = null;

    try {
      const assignment = await this.projectAssignmentRepository.findOne({
        where: { projectId, employeeId },
      });

      if (!assignment) {
        throw new Error("Employee is not assigned to this project");
      }

      queryRunner = await DatabaseService.createTransaction();

      await queryRunner.manager.update(ProjectAssignment, assignment.id, { role: newRole });

      await DatabaseService.commitTransaction(queryRunner);

      return this.projectAssignmentRepository.findOne({
        where: { id: assignment.id },
        relations: ["project", "employee"],
      }) as Promise<ProjectAssignment>;
    } catch (error) {
      if (queryRunner) {
        await DatabaseService.rollbackTransaction(queryRunner);
      }
      this.logger.error(`Error updating employee role in project:`, error);
      throw error;
    }
  }
}
