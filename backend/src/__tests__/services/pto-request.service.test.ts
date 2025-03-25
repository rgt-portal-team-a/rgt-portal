import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { PtoRequestService } from "@/services/pto-request.service";
import { PtoRequest } from "@/entities/pto-request.entity";
import { Employee } from "@/entities/employee.entity";
import { PtoStatusType } from "@/defaults/enum";
import { AppDataSource } from "@/database/data-source";
import { Repository } from "typeorm";
import { CreatePtoRequestDto } from "@/dtos/pto-request.dto";

vi.mock("@/database/data-source", () => ({
  AppDataSource: {
    getRepository: vi.fn(),
  },
}));

describe("PtoRequestService", () => {
  let ptoRequestService: PtoRequestService;
  let mockPtoRequestRepository: Repository<PtoRequest>;
  let mockEmployeeRepository: Repository<Employee>;
  let mockRoleRepository: Repository<any>;
  let mockUserRepository: Repository<any>;

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
      find: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as any;

    mockEmployeeRepository = {
      findOne: vi.fn(),
      save: vi.fn(),
    } as any;

    mockRoleRepository = {
      findOne: vi.fn(),
    } as any;

    mockUserRepository = {
      find: vi.fn(),
    } as any;

    (AppDataSource.getRepository as any).mockImplementation((entity: any) => {
      if (entity === PtoRequest) return mockPtoRequestRepository;
      if (entity === Employee) return mockEmployeeRepository;
      if (entity.name === "Role") return mockRoleRepository;
      if (entity.name === "User") return mockUserRepository;
      return {};
    });

    ptoRequestService = new PtoRequestService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return all PTO requests with relations", async () => {
      const mockRequests = [mockPtoRequest];
      (mockPtoRequestRepository.find as any).mockResolvedValue(mockRequests);

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
    const createPtoData: CreatePtoRequestDto = {
      startDate: new Date("2024-03-20"),
      endDate: new Date("2024-03-22"),
      type: "vacation",
      reason: "Family vacation",
    };

   

    it("should throw error if employee not found", async () => {
      (mockEmployeeRepository.findOne as any).mockResolvedValue(null);

      await expect(ptoRequestService.create(createPtoData, null)).rejects.toThrow("Employee not found");
    });

    it("should throw error if start date is greater than end date", async () => {
      const invalidData: CreatePtoRequestDto = {
        ...createPtoData,
        startDate: new Date("2024-03-22"),
        endDate: new Date("2024-03-20"),
      };

      await expect(ptoRequestService.create(invalidData, mockEmployee)).rejects.toThrow("Start date cannot be greater than end date");
    });

    it("should throw error if insufficient vacation days balance", async () => {
      const employeeWithLowBalance = {
        ...mockEmployee,
        vacationDaysBalance: 1,
      };

      await expect(ptoRequestService.create(createPtoData, employeeWithLowBalance)).rejects.toThrow("Insufficient vacation days balance");
    });

    it("should throw error if insufficient sick days balance for sick leave", async () => {
      const employeeWithLowBalance = {
        ...mockEmployee,
        sickDaysBalance: 1,
      };

      const sickLeaveData: CreatePtoRequestDto = {
        ...createPtoData,
        type: "sick",
      };

      await expect(ptoRequestService.create(sickLeaveData, employeeWithLowBalance)).rejects.toThrow("Insufficient sick days balance");
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
});
