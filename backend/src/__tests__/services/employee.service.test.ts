import { describe, it, expect, beforeEach, afterEach, vi, Mock } from "vitest";
import { EmployeeService } from "@/services/employee.service";
import { mockEmployee, mockUser, createMockRepository, setupTestDatabase, teardownTestDatabase } from "../utils/test-utils";
import { AppDataSource } from "@/database/data-source";
import { Employee } from "@/entities/employee.entity";
import { User } from "@/entities";
import { HttpException } from "@/exceptions/HttpException";
import { StatusCodes } from "http-status-codes";
import "reflect-metadata";

describe("EmployeeService", () => {
  let employeeService: EmployeeService;
  let employeeRepository: any;
  let userRepository: any;
  let roleRepository: any;

  beforeEach(async () => {
    await setupTestDatabase();

    employeeRepository = createMockRepository<Employee>();
    userRepository = createMockRepository<User>();
    roleRepository = createMockRepository();

    (AppDataSource.getRepository as Mock).mockImplementation((entity: any) => {
      if (entity === Employee) return employeeRepository;
      if (entity === User) return userRepository;
      return roleRepository;
    });

    employeeService = new EmployeeService();
  });

  afterEach(async () => {
    await teardownTestDatabase();
  });

  describe("findAll", () => {
    it("should return all employees", async () => {
      const employees = [mockEmployee];
      employeeRepository.find.mockResolvedValue(employees);

      const result = await employeeService.findAll();

      expect(result).toEqual(employees);
      expect(employeeRepository.find).toHaveBeenCalledWith({
        relations: ["department", "user", "projectAssignments"],
      });
    });
  });

  describe("findById", () => {
    it("should return employee by id", async () => {
      employeeRepository.findOne.mockResolvedValue(mockEmployee);

      const result = await employeeService.findById(1);

      expect(result).toEqual(mockEmployee);
      expect(employeeRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ["department", "user", "projectAssignments", "givenRecognitions", "receivedRecognitions"],
      });
    });

    it("should return null if employee not found", async () => {
      employeeRepository.findOne.mockResolvedValue(null);

      const result = await employeeService.findById(1);

      expect(result).toBeNull();
    });
  });

  describe("findByUserId", () => {
    it("should return employee by user id", async () => {
      employeeRepository.findOne.mockResolvedValue(mockEmployee);

      const result = await employeeService.findByUserId(1);

      expect(result).toEqual(mockEmployee);
      expect(employeeRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: 1 } },
        relations: ["user", "role"],
      });
    });

    it("should return null if employee not found", async () => {
      employeeRepository.findOne.mockResolvedValue(null);

      const result = await employeeService.findByUserId(1);

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create a new employee", async () => {
      const createData = {
        firstName: "John",
        lastName: "Doe",
        user: { id: 1 },
      };
      employeeRepository.create.mockReturnValue(mockEmployee);
      employeeRepository.save.mockResolvedValue(mockEmployee);

      const result = await employeeService.create(createData);

      expect(result).toEqual(mockEmployee);
      expect(employeeRepository.create).toHaveBeenCalledWith(createData);
      expect(employeeRepository.save).toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("should update employee and user role if roleId is provided", async () => {
      const updateData = {
        roleId: 2,
        user: { id: 1 },
      };
      userRepository.findOne.mockResolvedValue(mockUser);
      roleRepository.findOne.mockResolvedValue({ id: 2, name: "MANAGER" });
      userRepository.save.mockResolvedValue(mockUser);
      employeeRepository.update.mockResolvedValue({ affected: 1 });
      employeeRepository.findOne.mockResolvedValue(mockEmployee);

      const result = await employeeService.update(1, updateData);

      expect(result).toEqual(mockEmployee);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(roleRepository.findOne).toHaveBeenCalledWith({ where: { id: 2 } });
      expect(userRepository.save).toHaveBeenCalled();
      expect(employeeRepository.update).toHaveBeenCalledWith(1, updateData);
    });

    it("should update employee without role update if roleId is not provided", async () => {
      const updateData = {
        firstName: "John",
      };
      employeeRepository.update.mockResolvedValue({ affected: 1 });
      employeeRepository.findOne.mockResolvedValue(mockEmployee);

      const updateDataWithUser = {
        firstName: "John",
        user: { id: 1 }
      };
      employeeRepository.update.mockResolvedValue({ affected: 1 });
      
      const result = await employeeService.update(1, updateDataWithUser);

      expect(result).toEqual(mockEmployee);
      expect(employeeRepository.update).toHaveBeenCalledWith(1, updateDataWithUser);
      expect(userRepository.findOne).not.toHaveBeenCalled();
    });
  });

  describe("updateLeaveBalance", () => {
    it("should update sick leave balance", async () => {
      employeeRepository.findOne.mockResolvedValue(mockEmployee);
      employeeRepository.save.mockResolvedValue({ ...mockEmployee, sickDaysBalance: 5 });

      const result = await employeeService.updateLeaveBalance(1, "sick", 5);

      expect(result.sickDaysBalance).toBe(5);
      expect(employeeRepository.save).toHaveBeenCalled();
    });

    it("should update vacation leave balance", async () => {
      employeeRepository.findOne.mockResolvedValue(mockEmployee);
      employeeRepository.save.mockResolvedValue({ ...mockEmployee, vacationDaysBalance: 10 });

      const result = await employeeService.updateLeaveBalance(1, "vacation", 10);

      expect(result.vacationDaysBalance).toBe(10);
      expect(employeeRepository.save).toHaveBeenCalled();
    });

    it("should throw error if employee not found", async () => {
      employeeRepository.findOne.mockResolvedValue(null);

      await expect(employeeService.updateLeaveBalance(1, "sick", 5)).rejects.toThrow("Employee not found");
    });
  });

  describe("updateAgency", () => {
    it("should update employee agency", async () => {
      employeeRepository.findOne.mockResolvedValue(mockEmployee);
      employeeRepository.save.mockResolvedValue({ ...mockEmployee, agency: { name: "New Agency", paid: false, invoiceReceived: false } });

      const result = await employeeService.updateAgency(1, {
        name: "New Agency",
        paid: false,
        invoiceReceived: false
      });

      expect(result.agency).toEqual({ name: "New Agency", paid: false, invoiceReceived: false });
      expect(employeeRepository.save).toHaveBeenCalled();
    });

    it("should throw error if employee not found", async () => {
      employeeRepository.findOne.mockResolvedValue(null);

      await expect(employeeService.updateAgency(1, {
        name: "New Agency",
        paid: false,
        invoiceReceived: false
      })).rejects.toThrow("Employee not found");
    });
  });
});
