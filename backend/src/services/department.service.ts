import { AppDataSource } from "@/database/data-source";
import { Repository, QueryRunner, IsNull, Not } from "typeorm";
import { Department } from "@/entities/department.entity";
import { Employee } from "@/entities/employee.entity";
import { CreateDepartmentDto, UpdateDepartmentDto } from "@/dtos/department.dto";
import { DatabaseService } from "@/services/database.service";
import { Logger } from "@/services/logger.service";
import { NotificationService } from "./notifications/ntofication.service";
import { NotificationTemplates } from "./notifications/templates";
import { User } from "@/entities/user.entity";
import { Roles } from "@/defaults/role";
import { Role } from "@/entities/role.entity";

export class DepartmentService {
  private departmentRepository: Repository<Department>;
  private employeeRepository: Repository<Employee>;
  private logger: Logger;
  private notificationService: NotificationService;
  private roleRepository: Repository<Role>;

  constructor() {
    this.departmentRepository = AppDataSource.getRepository(Department);
    this.employeeRepository = AppDataSource.getRepository(Employee);
    this.logger = new Logger("DepartmentService");
    this.notificationService = new NotificationService();
    this.roleRepository = AppDataSource.getRepository(Role);
  }

  async findAll(relations: string[] = ["manager"]): Promise<Department[]> {
    try {
      const hasEmployees = relations.includes("employees");

      let expandedRelations = [...relations];

      if (hasEmployees) {
        if (!expandedRelations.includes("employees.user")) {
          expandedRelations.push("employees.user");
        }
        if (!expandedRelations.includes("employees.user.role")) {
          expandedRelations.push("employees.user.role");
        }
      }

      return this.departmentRepository.find({
        relations: expandedRelations,
        order: { name: "ASC" },
      });
    } catch (error) {
      this.logger.error("Error fetching all departments:", error);
      throw error;
    }
  }

  async findById(id: number, relations: string[] = ["manager", "employees"]): Promise<Department | null> {
    try {
      const department = await this.departmentRepository.findOne({ where: { id }, relations });
      if (!department) {
        throw new Error("Department not found");
      }

      return department;
    } catch (error) {
      this.logger.error(`Error fetching department with ID ${id}:`, error);
      throw error;
    }
  }

  async findByName(name: string): Promise<Department | null> {
    try {
      return this.departmentRepository.findOne({
        where: { name },
        relations: ["manager"],
      });
    } catch (error) {
      this.logger.error(`Error fetching department with name ${name}:`, error);
      throw error;
    }
  }

  async findByManagerId(managerId: number): Promise<Department[]> {
    try {
      return this.departmentRepository.find({
        where: { managerId },
        relations: ["employees"],
        order: { name: "ASC" },
      });
    } catch (error) {
      this.logger.error(`Error fetching departments managed by employee ID ${managerId}:`, error);
      throw error;
    }
  }

  async create(departmentData: CreateDepartmentDto): Promise<Department> {
    let queryRunner: QueryRunner | null = null;

    try {
      const manager = await this.employeeRepository.findOne({ where: { id: departmentData.managerId } });

      if (!manager) {
        throw new Error("Manager not found");
      }

      const existingManager = await this.employeeRepository.findOne({ where: { id: departmentData.managerId, departmentId: Not(IsNull()), user: { role: { name: Roles.MANAGER } } } });
      if (existingManager) {
        throw new Error("Manager is already a manager for another department or manager belongs to other department");
      }

      const existingDepartment = await this.findByName(departmentData.name);
      if (existingDepartment) {
        throw new Error("Department with this name already exists");
      }

      queryRunner = await DatabaseService.createTransaction();
      const department = this.departmentRepository.create(departmentData);
      department.manager = manager;

      const savedDepartment = await queryRunner.manager.save(Department, department);

      await queryRunner.manager.update(Employee, manager.id, {
        departmentId: savedDepartment.id,
        department: { id: savedDepartment.id },
      });

      if (manager.user) {
        await this.notificationService.createNotification(NotificationTemplates.departmentCreated(savedDepartment, manager));
      }

      await DatabaseService.commitTransaction(queryRunner);

      return await this.departmentRepository.findOne({
        where: { id: savedDepartment.id },
        relations: ["manager", "manager.user", "manager.user.role"]
      }) as Department;
    } catch (error) {
      if (queryRunner) {
        await DatabaseService.rollbackTransaction(queryRunner);
      }
      throw error;
    }
  }

  async update(id: number, updateData: UpdateDepartmentDto): Promise<Department> {
    let queryRunner: QueryRunner | null = null;

    try {
      const department = await this.findById(id);
      if (!department) {
        throw new Error("Department not found");
      }

      if (updateData.managerId && updateData.managerId !== department.managerId) {
        const manager = await this.employeeRepository.findOne({ where: { id: updateData.managerId } });
        if (!manager) {
          throw new Error("Manager not found");
        }
      }

      if (updateData.name && updateData.name !== department.name) {
        const existingDepartment = await this.findByName(updateData.name);
        if (existingDepartment) {
          throw new Error("Department with this name already exists");
        }
      }

      queryRunner = await DatabaseService.createTransaction();

      await queryRunner.manager.update(Department, id, updateData);

      await DatabaseService.commitTransaction(queryRunner);

      return this.findById(id) as Promise<Department>;
    } catch (error) {
      if (queryRunner) {
        await DatabaseService.rollbackTransaction(queryRunner);
      }
      this.logger.error(`Error updating department with ID ${id}:`, error);
      throw error;
    }
  }

  async updateManager(id: number, managerId: number): Promise<Department> {
    let queryRunner: QueryRunner | null = null;

    try {
      const department = await this.findById(id);
      if (!department) {
        throw new Error("Department not found");
      }

      const manager = await this.employeeRepository.findOne({ 
        where: { id: managerId },
        relations: ["user", "user.role"]
      });
      
      if (!manager) {
        throw new Error("Manager not found");
      }

      if (!manager.user) {
        throw new Error("Manager must have an associated user account");
      }

      queryRunner = await DatabaseService.createTransaction();

      await queryRunner.manager.update(Department, id, { 
        managerId,
        manager: { id: managerId }
      });

      const role = await this.roleRepository.findOne({ where: { name: Roles.MANAGER } });
      if (role) {
        await queryRunner.manager.update(User, manager.user.id, { role: { id: role.id } });
      }

      await DatabaseService.commitTransaction(queryRunner);

      return this.findById(id) as Promise<Department>;
    } catch (error) {
      if (queryRunner) {
        await DatabaseService.rollbackTransaction(queryRunner);
      }
      this.logger.error(`Error updating manager for department ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    let queryRunner: QueryRunner | null = null;

    try {
      const department = await this.findById(id);
      if (!department) {
        throw new Error("Department not found");
      }

      // remove all department references from employees and managers
      // await this.employeeRepository.update(department.employees.map((e) => e.id), { departmentId: null });
      // await this.employeeRepository.update(department.manager.id, { departmentId: null });
      // await this.employeeRepository.update(department.manager.id, { department: null });
      

      queryRunner = await DatabaseService.createTransaction();

      await queryRunner.manager.delete(Department, id);

      await DatabaseService.commitTransaction(queryRunner);
    } catch (error) {
      if (queryRunner) {
        await DatabaseService.rollbackTransaction(queryRunner);
      }
      this.logger.error(`Error deleting department with ID ${id}:`, error);
      throw error;
    }
  }

  async getDepartmentStats(id: number): Promise<Record<string, any>> {
    try {
      const department = await this.findById(id, ["employees", "manager"]);
      if (!department) {
        throw new Error("Department not found");
      }

      const employeeCount = department.employees ? department.employees.length : 0;

      const stats = {
        id: department.id,
        name: department.name,
        manager: department.manager
          ? {
              id: department.manager.id,
              name: `${department.manager.firstName} ${department.manager.lastName}`,
            }
          : null,
        employeeCount,
      };

      return stats;
    } catch (error) {
      this.logger.error(`Error fetching stats for department ID ${id}:`, error);
      throw error;
    }
  }

  async transferEmployees(fromDepartmentId: number, toDepartmentId: number): Promise<void> {
    let queryRunner: QueryRunner | null = null;

    try {
      const sourceDepartment = await this.findById(fromDepartmentId, ["employees"]);
      const targetDepartment = await this.findById(toDepartmentId);

      if (!sourceDepartment) {
        throw new Error("Source department not found");
      }

      if (!targetDepartment) {
        throw new Error("Target department not found");
      }

      if (!sourceDepartment.employees || sourceDepartment.employees.length === 0) {
        throw new Error("Source department has no employees to transfer");
      }

      queryRunner = await DatabaseService.createTransaction();

      // Get all employees before transfer for notifications
      const employees = await this.employeeRepository.find({
        where: { departmentId: fromDepartmentId },
        relations: ["user"],
      });

      await queryRunner.manager
        .createQueryBuilder()
        .update(Employee)
        .set({ departmentId: toDepartmentId })
        .where("departmentId = :deptId", { deptId: fromDepartmentId })
        .execute();

      await DatabaseService.commitTransaction(queryRunner);

      // Send notifications for department transfer
      for (const employee of employees) {
        if (employee.user) {
          await this.notificationService.createNotification(
            NotificationTemplates.departmentTransfer(employee, sourceDepartment, targetDepartment, employee.user),
          );
        }
      }
    } catch (error) {
      if (queryRunner) {
        await DatabaseService.rollbackTransaction(queryRunner);
      }
      this.logger.error(`Error transferring employees from department ${fromDepartmentId} to ${toDepartmentId}:`, error);
      throw error;
    }
  }

  async addEmployeeToDepartment(departmentId: number, employeeId: number): Promise<Department> {
    let queryRunner: QueryRunner | null = null;

    try {
      const department = await this.findById(departmentId);
      if (!department) {
        throw new Error("Department not found");
      }

      const employee = await this.employeeRepository.findOne({
        where: { id: employeeId },
        relations: ["department", "user"],
      });

      if (!employee) {
        throw new Error("Employee not found");
      }

      if (employee.departmentId === departmentId) {
        throw new Error("Employee is already in this department");
      }

      queryRunner = await DatabaseService.createTransaction();

      employee.departmentId = departmentId;
      employee.department = department;

      await queryRunner.manager.save(Employee, employee);

      await DatabaseService.commitTransaction(queryRunner);

      // Send notification for department assignment
      if (employee.user) {
        await this.notificationService.createNotification(NotificationTemplates.departmentAssignment(employee, department, employee.user));
      }

      return this.findById(departmentId) as Promise<Department>;
    } catch (error) {
      if (queryRunner) {
        await DatabaseService.rollbackTransaction(queryRunner);
      }
      this.logger.error(`Error adding employee ${employeeId} to department ${departmentId}:`, error);
      throw error;
    }
  }

  async addEmployeesToDepartment(departmentId: number, employeeIds: number[]): Promise<Department> {
    let queryRunner: QueryRunner | null = null;

    try {
      if (!employeeIds.length) {
        throw new Error("No employee IDs provided");
      }

      const department = await this.findById(departmentId);
      if (!department) {
        throw new Error("Department not found");
      }

      const employees = await this.employeeRepository.findByIds(employeeIds);
      if (employees.length !== employeeIds.length) {
        throw new Error("One or more employees not found");
      }

      queryRunner = await DatabaseService.createTransaction();

      await queryRunner.manager.createQueryBuilder().update(Employee).set({ departmentId }).whereInIds(employeeIds).execute();

      await DatabaseService.commitTransaction(queryRunner);

      return this.findById(departmentId) as Promise<Department>;
    } catch (error) {
      if (queryRunner) {
        await DatabaseService.rollbackTransaction(queryRunner);
      }
      this.logger.error(`Error adding employees to department ${departmentId}:`, error);
      throw error;
    }
  }

  async removeEmployeeFromDepartment(departmentId: number, employeeId: number): Promise<Department> {
    let queryRunner: QueryRunner | null = null;

    try {
      const department = await this.findById(departmentId);
      if (!department) {
        throw new Error("Department not found");
      }

      const employee = await this.employeeRepository.findOne({
        where: { id: employeeId },
        relations: ["department", "user"],
      });

      if (!employee) {
        throw new Error("Employee not found");
      }

      if (employee.departmentId !== departmentId) {
        throw new Error("Employee is not in this department");
      }

      queryRunner = await DatabaseService.createTransaction();

      employee.departmentId = null;
      employee.department = null;
      await queryRunner.manager.save(Employee, employee);

      department.employees = department.employees.filter((e) => e.id !== employeeId);
      await queryRunner.manager.save(Department, department);

      await DatabaseService.commitTransaction(queryRunner);

      // Send notification for department removal
      if (employee.user) {
        await this.notificationService.createNotification(NotificationTemplates.departmentRemoval(employee, department, employee.user));
      }

      return this.findById(departmentId) as Promise<Department>;
    } catch (error) {
      if (queryRunner) {
        await DatabaseService.rollbackTransaction(queryRunner);
      }
      this.logger.error(`Error removing employee ${employeeId} from department ${departmentId}:`, error);
      throw error;
    }
  }
}
