import { AppDataSource } from "@/database/data-source";
import { Repository } from "typeorm";
import { PtoRequest } from "@/entities/pto-request.entity";
import { Employee } from "@/entities/employee.entity";
import { CreatePtoRequestDto, UpdatePtoRequestDto } from "@/dtos/pto-request.dto";
import { PtoStatusType } from "@/defaults/enum";
import { NotificationService } from "./notifications/ntofication.service";
import { NotificationTemplates } from "./notifications/templates";
import { User } from "@/entities/user.entity";
import { Role } from "@/entities/role.entity";
import { DepartmentService } from "./department.service";
import { QueueService, QueueName, JobType } from "./queue.service";

export class PtoRequestService {
  private ptoRequestRepository: Repository<PtoRequest>;
  private employeeRepository: Repository<Employee>;
  private userRepository: Repository<User>;
  private roleRepository: Repository<Role>;
  private notificationService: NotificationService;
  private departmentService: DepartmentService;
  private queueService: QueueService;

  constructor() {
    this.ptoRequestRepository = AppDataSource.getRepository(PtoRequest);
    this.employeeRepository = AppDataSource.getRepository(Employee);
    this.userRepository = AppDataSource.getRepository(User);
    this.roleRepository = AppDataSource.getRepository(Role);
    this.notificationService = new NotificationService();
    this.departmentService = new DepartmentService();
    this.queueService = QueueService.getInstance();
  }

  async findAll(): Promise<PtoRequest[]> {
    return await this.ptoRequestRepository.find({
      relations: ["employee", "approver", "employee.user", "approver.user"],
    });
  }

  async findById(id: number): Promise<PtoRequest | null> {
    return await this.ptoRequestRepository.findOne({
      where: { id },
      relations: ["employee", "approver"],
    });
  }

  async findByStatus(status: PtoStatusType): Promise<PtoRequest[]> {
    return this.ptoRequestRepository.find({
      where: { status },
      relations: ["employee", "approver"],
      order: { createdAt: "DESC" },
    });
  }

  async findByEmployeeId(employeeId: number): Promise<PtoRequest[]> {
    return this.ptoRequestRepository.find({
      where: { employee: { id: employeeId } },
    });
  }

  async findByDepartmentId(departmentId: number): Promise<PtoRequest[]> {
    return this.ptoRequestRepository.find({
      where: { departmentId: departmentId },
      relations: ["employee"],
    });
  }

  async create(ptoData: CreatePtoRequestDto, employee: any): Promise<PtoRequest> {
    if (!employee) {
      throw new Error("Employee not found");
    }

    const startDate = new Date(ptoData.startDate);
    const endDate = new Date(ptoData.endDate);

    if (startDate > endDate) {
      throw new Error("Start date cannot be greater than end date");
    }

    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    console.log("diffTime:", diffTime);
    console.log("diffDays:", diffDays);
    // balance based on PTO type
    if (ptoData.type === "vacation") {
      if (employee.vacationDaysBalance < diffDays) {
        throw new Error("Insufficient vacation days balance");
      }
    } else if (ptoData.type === "sick") {
      if (employee.sickDaysBalance < diffDays) {
        throw new Error("Insufficient sick days balance");
      }
    }

    const ptoRequest = this.ptoRequestRepository.create({
      ...ptoData,
      status: PtoStatusType.PENDING,
      departmentId: employee.departmentId,
      employee: { id: employee.id },
    });

    employee.activePtoRequest = true;
    await this.employeeRepository.save(employee);

    const savedRequest = await this.ptoRequestRepository.save(ptoRequest);

    const savedRequestWithEmployee = await this.ptoRequestRepository.findOne({
      where: { id: savedRequest.id },
      relations: ["employee", "employee.user"],
    });

    const adminRole = await this.roleRepository.findOne({ where: { name: "admin" } });
    const hrRole = await this.roleRepository.findOne({ where: { name: "hr" } });

    if (adminRole || hrRole) {
      const adminAndHrUsers = await this.userRepository.find({
        where: [{ role: { id: adminRole?.id } }, { role: { id: hrRole?.id } }],
        relations: ["employee"],
      });
      // Send notifications to all admins and HRs using queue service
      for (const user of adminAndHrUsers) {
        if (user.employee) {
          await this.queueService.addJob(QueueName.NOTIFICATIONS, JobType.PTO_REQUEST_CREATED, {
            ptoRequest: savedRequestWithEmployee,
            recipientId: user.id,
          });
        }
      }
    }

    if (employee.departmentId) {
      const department = await this.departmentService.findById(employee.departmentId, ["manager", "manager.user"]);
      if (department?.manager?.user) {
        // Send notification to department manager using queue service
        await this.queueService.addJob(QueueName.NOTIFICATIONS, JobType.PTO_REQUEST_CREATED, {
          ptoRequest: savedRequestWithEmployee,
          recipientId: department.manager.user.id,
        });
      }
    }

    return savedRequest;
  }

  async update(id: number, updateData: UpdatePtoRequestDto): Promise<PtoRequest> {
    const ptoRequest = await this.ptoRequestRepository.findOne({
      where: { id },
      relations: ["employee", "employee.user", "approver"]
    });

    if (!ptoRequest) {
      throw new Error("PTO request not found");
    }

    const employee = await this.employeeRepository.findOne({
      where: { id: ptoRequest.employee.id },
      relations: ["user"]
    });

    if (!employee) {
      throw new Error("Employee not found");
    }

    const updatedRequest = await this.ptoRequestRepository.update(id, updateData);

    if ([PtoStatusType.HR_APPROVED].includes(updateData.status)) {
      const startDate = new Date(ptoRequest.startDate);
      const endDate = new Date(ptoRequest.endDate);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      employee.annualDaysOff = employee.annualDaysOff - diffDays;
      if (ptoRequest.type === "vacation") {
        employee.vacationDaysBalance = employee.vacationDaysBalance - diffDays;
      } else if (ptoRequest.type === "sick") {
        employee.sickDaysBalance = employee.sickDaysBalance - diffDays;
      }

      await this.employeeRepository.save(employee);
    }

    if (updateData.status !== PtoStatusType.PENDING) {
      employee.activePtoRequest = false;
      await this.employeeRepository.save(employee!);
    }

    // Send notification for status update
    if (updateData.status && updateData.status !== ptoRequest.status) {
      const updatedPtoRequest = await this.findById(id);
      if (updatedPtoRequest) {
        const approver = await this.employeeRepository.findOne({
          where: { id: updatedPtoRequest.approver?.id },
          relations: ["user"],
        });

        if (approver?.user) {
          await this.queueService.addJob(QueueName.NOTIFICATIONS, JobType.PTO_REQUEST_STATUS, {
            ptoRequest: updatedPtoRequest,
            updatedBy: approver.user,
          });
        }
      }
    }

    return this.findById(id) as Promise<PtoRequest>;
  }

  async delete(id: number): Promise<void> {
    await this.ptoRequestRepository.delete(id);
  }

  async calculateDaysOff(employeeId: number, year: number): Promise<Record<string, number>> {
    const startDate = new Date(year, 0, 1); // Jan 1st of specified year
    const endDate = new Date(year, 11, 31); // Dec 31st of specified year

    const requests = await this.ptoRequestRepository.find({
      where: {
        employee: { id: employeeId },
        status: PtoStatusType.HR_APPROVED,
        startDate: startDate,
        endDate: endDate,
      },
    });

    const daysOffByType: Record<string, number> = {
      vacation: 0,
      sick: 0,
      personal: 0,
      other: 0,
    };

    requests.forEach((request) => {
      const start = new Date(request.startDate);
      const end = new Date(request.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const type = request.type.toLowerCase();
      if (type in daysOffByType) {
        daysOffByType[type] += diffDays;
      } else {
        daysOffByType.other += diffDays;
      }
    });

    return daysOffByType;
  }

  async resetPtoBalance(): Promise<Employee[]> {
    const employees = await this.employeeRepository.find();
    for (const employee of employees) {
      employee.annualDaysOff = 30;
      employee.sickDaysBalance = 15;
      employee.vacationDaysBalance = 15;
    }

    const savedEmployees = await this.employeeRepository.save(employees);

    return savedEmployees;
  }
}
