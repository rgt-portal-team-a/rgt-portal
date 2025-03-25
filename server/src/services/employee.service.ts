import { AppDataSource } from "@/database/data-source";
import { Repository } from "typeorm";
import { Agency, Employee } from "@/entities/employee.entity";
import { EmployeeRecognition } from "@/entities/employee-recognition.entity";
import { Role, User } from "@/entities";
import { CreateEmployeeDto, UpdateEmployeeDto } from "@/dtos/employee.dto";
import { DepartmentService } from "./department.service";

export class EmployeeService {
  private employeeRepository: Repository<Employee>;
  private userRepository: Repository<User>;
  private roleRepository: Repository<Role>;
  private departmentService: DepartmentService;

  constructor() {
    this.employeeRepository = AppDataSource.getRepository(Employee);
    this.userRepository = AppDataSource.getRepository(User);
    this.roleRepository = AppDataSource.getRepository(Role);
    this.departmentService = new DepartmentService();
  }

  async findAll(): Promise<Employee[]> {
    return this.employeeRepository.find({
      relations: ["department", "user", "projectAssignments"],
    });
  }

  async findById(id: number): Promise<Employee | null> {
    return this.employeeRepository.findOne({
      where: { id },
      relations: ["department", "user", "projectAssignments", "givenRecognitions", "receivedRecognitions"],
    });
  }

  async findByUserId(userId: number): Promise<any> {
    const employee = await this.employeeRepository.findOne({
      where: { user: { id: userId } },
      relations: ["user", "role"],
    });

    if (!employee) return null;

    return employee;
  }

  async findByEmail(email: string): Promise<Employee[]> {
    return this.employeeRepository
      .createQueryBuilder("employee")
      .innerJoinAndSelect("employee.user", "user")
      .leftJoinAndSelect("employee.department", "department")
      .leftJoinAndSelect("employee.projectAssignments", "projectAssignments")
      .where("LOWER(user.email) LIKE LOWER(:email)", { email: `%${email}%` })
      .getMany();
  }

  async findByName(name: string): Promise<Employee[]> {
    return this.employeeRepository
      .createQueryBuilder("employee")
      .innerJoinAndSelect("employee.user", "user")
      .leftJoinAndSelect("employee.department", "department")
      .leftJoinAndSelect("employee.projectAssignments", "projectAssignments")
      .where("LOWER(employee.firstName) LIKE LOWER(:name)", { name: `%${name}%` })
      .orWhere("LOWER(employee.lastName) LIKE LOWER(:name)", { name: `%${name}%` })
      .orWhere("LOWER(CONCAT(employee.firstName, ' ', employee.lastName)) LIKE LOWER(:name)", { name: `%${name}%` })
      .getMany();
  }

  async create(employeeData: CreateEmployeeDto): Promise<Employee> {
    const employee = this.employeeRepository.create(employeeData);
    return this.employeeRepository.save(employee);
  }

  async update(id: number, updateData: UpdateEmployeeDto): Promise<Employee> {
    if (updateData.roleId && updateData.user?.id) {
      const user = await this.userRepository.findOne({ where: { id: updateData.user.id } });
      if (user) {
        const role = await this.roleRepository.findOne({ where: { id: updateData.roleId } });
        if (role) {
          user.role = role;
          await this.userRepository.save(user);
        }
      }
    }

    if (updateData.roleId) {
      delete updateData.roleId;
    }

    await this.employeeRepository.update(id, updateData);

    return this.findById(id) as Promise<Employee>;
  }

  async delete(id: number): Promise<void> {
    await this.employeeRepository.delete(id);
  }

  async updateLeaveBalance(id: number, type: "sick" | "vacation", days: number): Promise<Employee> {
    const employee = await this.findById(id);
    if (!employee) throw new Error("Employee not found");

    if (type === "sick") {
      employee.sickDaysBalance = days;
    } else {
      employee.vacationDaysBalance = days;
    }

    return this.employeeRepository.save(employee);
  }

  async updateAgency(id: number, agency: Agency): Promise<Employee> {
    const employee = await this.findById(id);
    if (!employee) throw new Error("Employee not found");

    employee.agency = agency;
    return this.employeeRepository.save(employee);
  }

  async removeEmployeeFromDepartment(id: number): Promise<Employee> {
    const employee = await this.findById(id);
    if (!employee) throw new Error("Employee not found");

    if (!employee.departmentId) throw new Error("Employee is not in a department");

    const department = await this.departmentService.findById(employee.departmentId);
    if (!department) throw new Error("Department not found");

    employee.department = null;
    employee.departmentId = null;
    return this.employeeRepository.save(employee);
  }
}
