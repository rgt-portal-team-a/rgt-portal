import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { RecruitmentService } from "@/services/recruitment.service";
import { Recruitment } from "@/entities/recruitment.entity";
import { Employee } from "@/entities/employee.entity";
import { User } from "@/entities/user.entity";
import { EmergencyContact } from "@/entities/emergency-contact.entity";
import { AppDataSource } from "@/database/data-source";
import { Repository } from "typeorm";
import { CreateRecruitmentDto, UpdateRecruitmentDto, RecruitmentFilterDto } from "@/dtos/recruitment.dto";
import { RecruitmentStatus, FailStage, RelationshipType } from "@/defaults/enum";

vi.mock("@/database/data-source", () => ({
  AppDataSource: {
    getRepository: vi.fn(),
    createQueryRunner: vi.fn(),
  },
}));

describe("RecruitmentService", () => {
  let recruitmentService: RecruitmentService;
  let mockRecruitmentRepository: Repository<Recruitment>;
  let mockEmployeeRepository: Repository<Employee>;
  let mockUserRepository: Repository<User>;
  let mockEmergencyContactRepository: Repository<EmergencyContact>;
  let mockQueryRunner: any;

  const mockUser = {
    id: 1,
    username: "johndoe",
    email: "john@example.com",
  } as User;

  const mockEmployee = {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    departmentId: 1,
  } as Employee;

  const mockRecruitment = {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phoneNumber: "1234567890",
    position: "Software Engineer",
    currentStatus: RecruitmentStatus.CV_REVIEW,
    createdBy: mockUser,
    employee: null,
    emergencyContacts: [],
  } as unknown as Recruitment;

  const mockEmergencyContact = {
    id: 1,
    name: "Jane Doe",
    relationship: RelationshipType.FATHER,
    phoneNumber: "0987654321",
    recruitment: mockRecruitment,
  } as unknown as EmergencyContact;

  beforeEach(() => {
    mockRecruitmentRepository = {
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
      if (entity === Recruitment) return mockRecruitmentRepository;
      if (entity === Employee) return mockEmployeeRepository;
      if (entity === User) return mockUserRepository;
      if (entity === EmergencyContact) return mockEmergencyContactRepository;
      return {};
    });

    (AppDataSource.createQueryRunner as any).mockReturnValue(mockQueryRunner);

    recruitmentService = new RecruitmentService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return paginated recruitments with filters", async () => {
      const filters: RecruitmentFilterDto = {
        name: "John",
        status: RecruitmentStatus.CV_REVIEW,
      };

      const mockRecruitments = [mockRecruitment];
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getCount: vi.fn().mockResolvedValue(1),
        getMany: vi.fn().mockResolvedValue(mockRecruitments),
      };

      (mockRecruitmentRepository.createQueryBuilder as any).mockReturnValue(mockQueryBuilder);

      const result = await recruitmentService.findAll(filters);

      expect(result).toEqual({
        recruitments: mockRecruitments,
        total: 1,
        page: 1,
        totalPages: 1,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(expect.stringContaining("recruitment.name LIKE :name"), expect.any(Object));
    });
  });

  describe("findById", () => {
    it("should return a recruitment by id with relations", async () => {
      (mockRecruitmentRepository.findOne as any).mockResolvedValue(mockRecruitment);

      const result = await recruitmentService.findById(1);

      expect(result).toEqual(mockRecruitment);
      expect(mockRecruitmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ["createdBy", "employee", "emergencyContacts"],
      });
    });
  });

  describe("create", () => {
    const createData: CreateRecruitmentDto = {
      name: "John Doe",
      email: "john@example.com",
      phoneNumber: "1234567890",
      position: "Software Engineer",
      emergencyContacts: [
        {
          name: "Jane Doe",
          relationship: RelationshipType.FATHER,
          phoneNumber: "0987654321",
        },
      ],
    };

    it("should create a new recruitment with emergency contacts", async () => {
      (mockUserRepository.findOne as any).mockResolvedValue(mockUser);
      (mockRecruitmentRepository.create as any).mockReturnValue(mockRecruitment);
      (mockQueryRunner.manager.save as any).mockResolvedValue(mockRecruitment);
      (mockEmergencyContactRepository.create as any).mockReturnValue(mockEmergencyContact);

      // Mock findById method which is called at the end of create method
      (mockRecruitmentRepository.findOne as any).mockResolvedValue(mockRecruitment);

      const result = await recruitmentService.create(createData, 1);

      expect(result).toEqual(mockRecruitment);
      expect(mockRecruitmentRepository.create).toHaveBeenCalledWith({
        ...createData,
        createdBy: mockUser,
      });
      expect(mockQueryRunner.manager.save).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it("should throw error if user not found", async () => {
      (mockUserRepository.findOne as any).mockResolvedValue(null);

      await expect(recruitmentService.create(createData, 1)).rejects.toThrow("User not found");
    });
  });

  describe("update", () => {
    const updateData: UpdateRecruitmentDto = {
      name: "John Updated",
      currentStatus: RecruitmentStatus.FIRST_INTERVIEW,
    };

    it("should update a recruitment", async () => {
      (mockRecruitmentRepository.findOne as any).mockResolvedValue(mockRecruitment);
      (mockQueryRunner.manager.save as any).mockResolvedValue(mockRecruitment);

      const result = await recruitmentService.update(1, updateData);

      expect(result).toEqual(mockRecruitment);
      expect(mockQueryRunner.manager.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: updateData.name,
          currentStatus: updateData.currentStatus,
        }),
      );
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it("should throw error if recruitment not found", async () => {
      (mockRecruitmentRepository.findOne as any).mockResolvedValue(null);

      await expect(recruitmentService.update(1, updateData)).rejects.toThrow("Recruitment not found");
    });
  });

  describe("updateStatus", () => {
    it("should update recruitment status", async () => {
      (mockRecruitmentRepository.findOne as any).mockResolvedValue(mockRecruitment);
      (mockRecruitmentRepository.save as any).mockResolvedValue(mockRecruitment);

      const result = await recruitmentService.updateStatus(1, RecruitmentStatus.IN_QUESTION);

      expect(result).toEqual(mockRecruitment);
      expect(mockRecruitmentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          currentStatus: RecruitmentStatus.IN_QUESTION,
        }),
      );
    });

    it("should set fail stage and reason when status is NOT_HIRED", async () => {
      (mockRecruitmentRepository.findOne as any).mockResolvedValue(mockRecruitment);
      (mockRecruitmentRepository.save as any).mockResolvedValue(mockRecruitment);

      const result = await recruitmentService.updateStatus(
        1,
        RecruitmentStatus.NOT_HIRED,
        FailStage.TECHNICAL_INTERVIEW,
        "Failed technical interview",
      );

      expect(result).toEqual(mockRecruitment);
      expect(mockRecruitmentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          currentStatus: RecruitmentStatus.NOT_HIRED,
          failStage: FailStage.TECHNICAL_INTERVIEW,
          failReason: "Failed technical interview",
        }),
      );
    });
  });

  describe("delete", () => {
    it("should delete a recruitment and its emergency contacts", async () => {
      const recruitmentWithContacts = {
        ...mockRecruitment,
        emergencyContacts: [mockEmergencyContact],
      };
      (mockRecruitmentRepository.findOne as any).mockResolvedValue(recruitmentWithContacts);
      (mockEmergencyContactRepository.remove as any).mockResolvedValue(true);
      (mockRecruitmentRepository.remove as any).mockResolvedValue(true);

      const result = await recruitmentService.delete(1);

      expect(result).toBe(true);
      expect(mockEmergencyContactRepository.remove).toHaveBeenCalledWith(recruitmentWithContacts.emergencyContacts);
      expect(mockRecruitmentRepository.remove).toHaveBeenCalledWith(recruitmentWithContacts);
    });
  });

  describe("getStatistics", () => {
    it("should return recruitment statistics", async () => {
      // Create multiple mock query builders for the different queries in getStatistics
      const statusQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        addSelect: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        getRawMany: vi.fn().mockResolvedValue([
          { status: RecruitmentStatus.CV_REVIEW, count: "5" },
          { status: RecruitmentStatus.FIRST_INTERVIEW, count: "3" },
        ]),
      };

      const sourceQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        addSelect: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        getRawMany: vi.fn().mockResolvedValue([
          { source: "LinkedIn", count: "4" },
          { source: "Referral", count: "6" },
        ]),
      };

      const monthlyQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        addSelect: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        getRawMany: vi.fn().mockResolvedValue([
          { month: "2023-01", count: "3" },
          { month: "2023-02", count: "7" },
        ]),
      };

      // Mock createQueryBuilder to return different builders for each call
      (mockRecruitmentRepository.createQueryBuilder as any)
        .mockReturnValueOnce(statusQueryBuilder)
        .mockReturnValueOnce(sourceQueryBuilder)
        .mockReturnValueOnce(monthlyQueryBuilder);

      // Mock the count method - make sure it returns a number
      (mockRecruitmentRepository.count as any) = vi.fn();
      // First call is for total count
      (mockRecruitmentRepository.count as any).mockResolvedValueOnce(10);
      // Second call is for hired count
      (mockRecruitmentRepository.count as any).mockResolvedValueOnce(3);

      const result = await recruitmentService.getStatistics();

      // Verify the result matches the expected structure
      expect(result).toEqual({
        statusStats: [
          { status: RecruitmentStatus.CV_REVIEW, count: "5" },
          { status: RecruitmentStatus.FIRST_INTERVIEW, count: "3" },
        ],
        sourceStats: [
          { source: "LinkedIn", count: "4" },
          { source: "Referral", count: "6" },
        ],
        monthlyStats: [
          { month: "2023-01", count: "3" },
          { month: "2023-02", count: "7" },
        ],
        conversionRate: 30, // (3/10) * 100
        totalRecruitments: 10,
        totalHired: 3,
      });

      // Verify the repository methods were called
      expect(mockRecruitmentRepository.createQueryBuilder).toHaveBeenCalledTimes(3);
      expect(mockRecruitmentRepository.count).toHaveBeenCalledTimes(2);
    });
  });
});
