import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { PtoRequestService } from "@/services/pto-request.service";
import { PtoRequest } from "@/entities/pto-request.entity";
import { Employee } from "@/entities/employee.entity";
import { PtoStatusType } from "@/defaults/enum";
import { AppDataSource } from "@/database/data-source";
import { Repository } from "typeorm";
import { CreatePtoRequestDto } from "@/dtos/pto-request.dto";
import { User } from "@/entities/user.entity";
import { Role } from "@/entities/role.entity";
import { EmergencyContact } from "@/entities/emergency-contact.entity";
import { QueryRunner } from "typeorm/query-runner/QueryRunner";

vi.mock("@/database/data-source", () => ({
  AppDataSource: {
    getRepository: vi.fn(),
    createQueryRunner: vi.fn(),
  },
}));

describe("PtoRequestService", () => {
  let ptoRequestService: PtoRequestService;
  let mockPtoRequestRepository: Repository<PtoRequest>;
  let mockEmployeeRepository: Repository<Employee>;
  let mockUserRepository: Repository<User>;
  let mockRoleRepository: Repository<Role>;
  let mockEmergencyContactRepository: Repository<EmergencyContact>;
  let mockQueryRunner: QueryRunner;

  const mockEmployee = {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    departmentId: 1,
    vacationDaysBalance: 20,
    sickDaysBalance: 10,
    activePtoRequest: false,
  } as Employee;

  const mockPtoRequest = {
    id: 1,
    employee: mockEmployee,
    startDate: new Date("2024-03-20"),
    endDate: new Date("2024-03-22"),
    type: "vacation",
    status: PtoStatusType.PENDING,
    departmentId: 1,
    reason: "Family vacation",
    statusReason: null,
    approver: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as PtoRequest;

  beforeEach(() => {
    mockPtoRequestRepository = {
      create: vi.fn(),
      save: vi.fn(),
      findOne: vi.fn(),
      find: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      createQueryBuilder: vi.fn(),
    } as any;

    mockEmployeeRepository = {
      findOne: vi.fn(),
      save: vi.fn(),
    } as any;

    mockUserRepository = {
      findOne: vi.fn(),
    } as any;

    mockRoleRepository = {
      findOne: vi.fn(),
      find: vi.fn(),
    } as any;

    mockEmergencyContactRepository = {
      create: vi.fn(),
      save: vi.fn(),
      remove: vi.fn(),
    } as any;

    mockQueryRunner = {
      connect: vi.fn(),
      startTransaction: vi.fn(),
      commitTransaction: vi.fn(),
      rollbackTransaction: vi.fn(),
      release: vi.fn(),
      manager: {
        save: vi.fn(),
        remove: vi.fn(),
      },
    };

    (AppDataSource.getRepository as any).mockImplementation((entity: any) => {
      if (entity === PtoRequest) return mockPtoRequestRepository;
      if (entity === Employee) return mockEmployeeRepository;
      if (entity === User) return mockUserRepository;
      if (entity === Role) return mockRoleRepository;
      if (entity === EmergencyContact) return mockEmergencyContactRepository;
      return {};
    });

    (AppDataSource.createQueryRunner as any).mockReturnValue(mockQueryRunner);

    ptoRequestService = new PtoRequestService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return all PTO requests with relations", async () => {
      const mockRequests = [mockPtoRequest];
      mockPtoRequestRepository.find.mockResolvedValue(mockRequests);

      const result = await ptoRequestService.findAll();

      expect(result).toEqual(mockRequests);
      expect(mockPtoRequestRepository.find).toHaveBeenCalledWith({
        relations: ["employee", "approver", "employee.user", "approver.user"],
      });
    });
  });

  describe("findById", () => {
    it("should return a PTO request by id with relations", async () => {
      (mockPtoRequestRepository.findOne as any).mockResolvedValue(mockPtoRequest);

      const result = await ptoRequestService.findById(1);

      expect(result).toEqual(mockPtoRequest);
      expect(mockPtoRequestRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ["employee", "approver"],
      });
    });
  });

  describe("findByStatus", () => {
    it("should return PTO requests by status", async () => {
      const mockRequests = [mockPtoRequest];
      (mockPtoRequestRepository.find as any).mockResolvedValue(mockRequests);

      const result = await ptoRequestService.findByStatus(PtoStatusType.PENDING);

      expect(result).toEqual(mockRequests);
      expect(mockPtoRequestRepository.find).toHaveBeenCalledWith({
        where: { status: PtoStatusType.PENDING },
        relations: ["employee", "approver"],
        order: { createdAt: "DESC" },
      });
    });
  });

  describe("findByEmployeeId", () => {
    it("should return PTO requests by employee id", async () => {
      const mockRequests = [mockPtoRequest];
      (mockPtoRequestRepository.find as any).mockResolvedValue(mockRequests);

      const result = await ptoRequestService.findByEmployeeId(1);

      expect(result).toEqual(mockRequests);
      expect(mockPtoRequestRepository.find).toHaveBeenCalledWith({
        where: { employee: { id: 1 } },
      });
    });
  });

  describe("findByDepartmentId", () => {
    it("should return PTO requests by department id", async () => {
      const mockRequests = [mockPtoRequest];
      (mockPtoRequestRepository.find as any).mockResolvedValue(mockRequests);

      const result = await ptoRequestService.findByDepartmentId(1);

      expect(result).toEqual(mockRequests);
      expect(mockPtoRequestRepository.find).toHaveBeenCalledWith({
        where: { departmentId: 1 },
        relations: ["employee"],
      });
    });
  });

  describe("create", () => {
    it("should create a new PTO request", async () => {
      const createPtoRequestDto: CreatePtoRequestDto = {
        employeeId: 1,
        startDate: new Date(),
        endDate: new Date(),
        type: "ANNUAL",
        reason: "Vacation",
      };

      const mockEmployee = {
        id: 1,
        user: { id: 1 },
      };

      const mockRole = {
        name: "EMPLOYEE",
      };

      mockEmployeeRepository.findOne.mockResolvedValue(mockEmployee);
      mockRoleRepository.findOne.mockResolvedValue(mockRole);
      mockPtoRequestRepository.create.mockReturnValue(mockPtoRequest);
      mockPtoRequestRepository.save.mockResolvedValue(mockPtoRequest);

      const result = await ptoRequestService.create(createPtoRequestDto);

      expect(result).toEqual(mockPtoRequest);
      expect(mockEmployeeRepository.findOne).toHaveBeenCalledWith({
        where: { id: createPtoRequestDto.employeeId },
        relations: ["user"],
      });
      expect(mockRoleRepository.findOne).toHaveBeenCalledWith({
        where: { name: "EMPLOYEE" },
      });
      expect(mockPtoRequestRepository.create).toHaveBeenCalledWith({
        ...createPtoRequestDto,
        status: "PENDING",
        employee: mockEmployee,
      });
      expect(mockPtoRequestRepository.save).toHaveBeenCalledWith(mockPtoRequest);
    });

    it("should throw an error if employee not found", async () => {
      const createPtoRequestDto: CreatePtoRequestDto = {
        employeeId: 1,
        startDate: new Date(),
        endDate: new Date(),
        type: "ANNUAL",
        reason: "Vacation",
      };

      mockEmployeeRepository.findOne.mockResolvedValue(null);

      await expect(ptoRequestService.create(createPtoRequestDto)).rejects.toThrow("Employee not found");
    });

    it("should throw an error if employee role is not found", async () => {
      const createPtoRequestDto: CreatePtoRequestDto = {
        employeeId: 1,
        startDate: new Date(),
        endDate: new Date(),
        type: "ANNUAL",
        reason: "Vacation",
      };

      const mockEmployee = {
        id: 1,
        user: { id: 1 },
      };

      mockEmployeeRepository.findOne.mockResolvedValue(mockEmployee);
      mockRoleRepository.findOne.mockResolvedValue(null);

      await expect(ptoRequestService.create(createPtoRequestDto)).rejects.toThrow("Employee role not found");
    });
  });

  describe("update", () => {
    const updateData = {
      status: PtoStatusType.HR_APPROVED,
    };

    it("should update PTO request status successfully", async () => {
      (mockPtoRequestRepository.findOne as any).mockResolvedValue(mockPtoRequest);
      (mockEmployeeRepository.findOne as any).mockResolvedValue(mockEmployee);
      (mockPtoRequestRepository.update as any).mockResolvedValue({ affected: 1 } as any);
      (mockPtoRequestRepository.findOne as any).mockResolvedValue(mockPtoRequest);
      (mockEmployeeRepository.save as any).mockResolvedValue(mockEmployee);

      const result = await ptoRequestService.update(1, updateData);

      expect(result).toEqual(mockPtoRequest);
      expect(mockPtoRequestRepository.update).toHaveBeenCalledWith(1, updateData);
      expect(mockEmployeeRepository.save).toHaveBeenCalledWith({
        ...mockEmployee,
        activePtoRequest: false,
      });
    });

    it("should throw error if PTO request not found", async () => {
      (mockPtoRequestRepository.findOne as any).mockResolvedValue(null);

      await expect(ptoRequestService.update(1, updateData)).rejects.toThrow("PTO request not found");
    });

    it("should throw error if employee not found", async () => {
      (mockPtoRequestRepository.findOne as any).mockResolvedValue(mockPtoRequest);
      (mockEmployeeRepository.findOne as any).mockResolvedValue(null);

      await expect(ptoRequestService.update(1, updateData)).rejects.toThrow("Employee not found");
    });

    it("should update employee vacation days balance when approved", async () => {
      const approvedRequest = {
        ...mockPtoRequest,
        type: "vacation",
        status: PtoStatusType.PENDING,
        startDate: new Date("2024-03-20"),
        endDate: new Date("2024-03-22"),
      };

      const updatedEmployee = {
        ...mockEmployee,
        vacationDaysBalance: 14, // 20 - 6 days (including both start and end dates)
      };

      (mockPtoRequestRepository.findOne as any).mockResolvedValue(approvedRequest);
      (mockEmployeeRepository.findOne as any).mockResolvedValue(mockEmployee);
      (mockPtoRequestRepository.update as any).mockResolvedValue({ affected: 1 } as any);
      (mockPtoRequestRepository.findOne as any).mockResolvedValue(approvedRequest);
      (mockEmployeeRepository.save as any).mockResolvedValue(updatedEmployee);

      await ptoRequestService.update(1, { status: PtoStatusType.HR_APPROVED });

      expect(mockEmployeeRepository.save).toHaveBeenCalledWith(updatedEmployee);
    });

    it("should update employee sick days balance when approved", async () => {
      const approvedRequest = {
        ...mockPtoRequest,
        type: "sick",
        status: PtoStatusType.PENDING,
      };

      const updatedEmployee = {
        ...mockEmployee,
        sickDaysBalance: 7, // 10 - 3 days
      };

      (mockPtoRequestRepository.findOne as any).mockResolvedValue(approvedRequest);
      (mockEmployeeRepository.findOne as any).mockResolvedValue(mockEmployee);
      (mockPtoRequestRepository.update as any).mockResolvedValue({ affected: 1 } as any);
      (mockPtoRequestRepository.findOne as any).mockResolvedValue(approvedRequest);
      (mockEmployeeRepository.save as any).mockResolvedValue(updatedEmployee);

      await ptoRequestService.update(1, { status: PtoStatusType.HR_APPROVED });

      expect(mockEmployeeRepository.save).toHaveBeenCalledWith(updatedEmployee);
    });
  });

  describe("delete", () => {
    it("should delete a PTO request", async () => {
      await ptoRequestService.delete(1);

      expect(mockPtoRequestRepository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe("calculateDaysOff", () => {
    it("should calculate days off by type for a given year", async () => {
      const mockRequests = [
        {
          ...mockPtoRequest,
          type: "vacation",
          startDate: new Date("2024-01-01"),
          endDate: new Date("2024-01-03"),
          status: PtoStatusType.HR_APPROVED,
        },
        {
          ...mockPtoRequest,
          type: "sick",
          startDate: new Date("2024-02-01"),
          endDate: new Date("2024-02-02"),
          status: PtoStatusType.HR_APPROVED,
        },
      ];

      (mockPtoRequestRepository.find as any).mockResolvedValue(mockRequests);

      const result = await ptoRequestService.calculateDaysOff(1, 2024);

      expect(result).toEqual({
        vacation: 3,
        sick: 2,
        personal: 0,
        other: 0,
      });
      expect(mockPtoRequestRepository.find).toHaveBeenCalledWith({
        where: {
          employee: { id: 1 },
          status: PtoStatusType.HR_APPROVED,
          startDate: new Date("2024-01-01"),
          endDate: new Date("2024-12-31"),
        },
      });
    });
  });

  describe("approve", () => {
    it("should approve a PTO request", async () => {
      const mockPtoRequest = {
        id: 1,
        status: "PENDING",
        employee: {
          id: 1,
          user: { id: 1 },
        },
      };

      const mockApprover = {
        id: 2,
        user: { id: 2 },
      };

      const mockRole = {
        name: "MANAGER",
      };

      mockPtoRequestRepository.findOne.mockResolvedValue(mockPtoRequest);
      mockEmployeeRepository.findOne.mockResolvedValue(mockApprover);
      mockRoleRepository.findOne.mockResolvedValue(mockRole);
      mockPtoRequestRepository.save.mockResolvedValue({
        ...mockPtoRequest,
        status: "APPROVED",
        approver: mockApprover,
      });

      const result = await ptoRequestService.approve(1, 2);

      expect(result.status).toBe("APPROVED");
      expect(result.approver).toBe(mockApprover);
      expect(mockPtoRequestRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ["employee", "employee.user"],
      });
      expect(mockEmployeeRepository.findOne).toHaveBeenCalledWith({
        where: { id: 2 },
        relations: ["user"],
      });
      expect(mockRoleRepository.findOne).toHaveBeenCalledWith({
        where: { name: "MANAGER" },
      });
      expect(mockPtoRequestRepository.save).toHaveBeenCalledWith({
        ...mockPtoRequest,
        status: "APPROVED",
        approver: mockApprover,
      });
    });

    it("should throw an error if PTO request not found", async () => {
      mockPtoRequestRepository.findOne.mockResolvedValue(null);

      await expect(ptoRequestService.approve(1, 2)).rejects.toThrow("PTO request not found");
    });

    it("should throw an error if PTO request is not pending", async () => {
      const mockPtoRequest = {
        id: 1,
        status: "APPROVED",
      };

      mockPtoRequestRepository.findOne.mockResolvedValue(mockPtoRequest);

      await expect(ptoRequestService.approve(1, 2)).rejects.toThrow("PTO request is not pending");
    });

    it("should throw an error if approver not found", async () => {
      const mockPtoRequest = {
        id: 1,
        status: "PENDING",
      };

      mockPtoRequestRepository.findOne.mockResolvedValue(mockPtoRequest);
      mockEmployeeRepository.findOne.mockResolvedValue(null);

      await expect(ptoRequestService.approve(1, 2)).rejects.toThrow("Approver not found");
    });

    it("should throw an error if approver is not a manager", async () => {
      const mockPtoRequest = {
        id: 1,
        status: "PENDING",
      };

      const mockApprover = {
        id: 2,
        user: { id: 2 },
      };

      mockPtoRequestRepository.findOne.mockResolvedValue(mockPtoRequest);
      mockEmployeeRepository.findOne.mockResolvedValue(mockApprover);
      mockRoleRepository.findOne.mockResolvedValue(null);

      await expect(ptoRequestService.approve(1, 2)).rejects.toThrow("Approver must be a manager");
    });
  });

  describe("reject", () => {
    it("should reject a PTO request", async () => {
      const mockPtoRequest = {
        id: 1,
        status: "PENDING",
        employee: {
          id: 1,
          user: { id: 1 },
        },
      };

      const mockRejector = {
        id: 2,
        user: { id: 2 },
      };

      const mockRole = {
        name: "MANAGER",
      };

      mockPtoRequestRepository.findOne.mockResolvedValue(mockPtoRequest);
      mockEmployeeRepository.findOne.mockResolvedValue(mockRejector);
      mockRoleRepository.findOne.mockResolvedValue(mockRole);
      mockPtoRequestRepository.save.mockResolvedValue({
        ...mockPtoRequest,
        status: "REJECTED",
        approver: mockRejector,
      });

      const result = await ptoRequestService.reject(1, 2);

      expect(result.status).toBe("REJECTED");
      expect(result.approver).toBe(mockRejector);
      expect(mockPtoRequestRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ["employee", "employee.user"],
      });
      expect(mockEmployeeRepository.findOne).toHaveBeenCalledWith({
        where: { id: 2 },
        relations: ["user"],
      });
      expect(mockRoleRepository.findOne).toHaveBeenCalledWith({
        where: { name: "MANAGER" },
      });
      expect(mockPtoRequestRepository.save).toHaveBeenCalledWith({
        ...mockPtoRequest,
        status: "REJECTED",
        approver: mockRejector,
      });
    });

    it("should throw an error if PTO request not found", async () => {
      mockPtoRequestRepository.findOne.mockResolvedValue(null);

      await expect(ptoRequestService.reject(1, 2)).rejects.toThrow("PTO request not found");
    });

    it("should throw an error if PTO request is not pending", async () => {
      const mockPtoRequest = {
        id: 1,
        status: "APPROVED",
      };

      mockPtoRequestRepository.findOne.mockResolvedValue(mockPtoRequest);

      await expect(ptoRequestService.reject(1, 2)).rejects.toThrow("PTO request is not pending");
    });

    it("should throw an error if rejector not found", async () => {
      const mockPtoRequest = {
        id: 1,
        status: "PENDING",
      };

      mockPtoRequestRepository.findOne.mockResolvedValue(mockPtoRequest);
      mockEmployeeRepository.findOne.mockResolvedValue(null);

      await expect(ptoRequestService.reject(1, 2)).rejects.toThrow("Rejector not found");
    });

    it("should throw an error if rejector is not a manager", async () => {
      const mockPtoRequest = {
        id: 1,
        status: "PENDING",
      };

      const mockRejector = {
        id: 2,
        user: { id: 2 },
      };

      mockPtoRequestRepository.findOne.mockResolvedValue(mockPtoRequest);
      mockEmployeeRepository.findOne.mockResolvedValue(mockRejector);
      mockRoleRepository.findOne.mockResolvedValue(null);

      await expect(ptoRequestService.reject(1, 2)).rejects.toThrow("Rejector must be a manager");
    });
  });
});
