import { Request, Response } from "express";
import { EmployeeService } from "@/services/employee.service";
import { CreateEmployeeDto, UpdateEmployeeDto } from "@/dtos/employee.dto";
import { Agency } from "@/entities/employee.entity";
import { HttpException } from "@/exceptions/HttpException";
import { StatusCodes } from "http-status-codes";

export class EmployeeController {
  private employeeService: EmployeeService;

  constructor() {
    this.employeeService = new EmployeeService();
  }

  public getAllEmployees = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, name } = req.query;

      let employees;

      if (email) {
        // Search by email parameter
        employees = await this.employeeService.findByEmail(email as string);
      } else if (name) {
        // Search by name parameter
        employees = await this.employeeService.findByName(name as string);
      } else {
        // No query parameters, return all employees
        employees = await this.employeeService.findAll();
      }

      res.status(StatusCodes.OK).json({ data: employees, message: "getAllEmployees" });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        res.status(error.status).json({ message: error.message });
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
      }
    }
  };

  public getEmployeeById = async (req: Request, res: Response): Promise<void> => {
    try {
      const employeeId = Number(req.params.id);
      const employee = await this.employeeService.findById(employeeId);

      if (!employee) {
        throw new HttpException(StatusCodes.NOT_FOUND, "Employee not found");
      }

      res.status(StatusCodes.OK).json({ data: employee, message: "getEmployeeById" });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        res.status(error.status).json({ message: error.message });
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
      }
    }
  };

  public getEmployeeByUserId = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = Number(req.params.userId);
      const employee = await this.employeeService.findByUserId(userId);

      if (!employee) {
        throw new HttpException(StatusCodes.NOT_FOUND, "Employee not found");
      }

      res.status(StatusCodes.OK).json({ data: employee, message: "getEmployeeByUserId" });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        res.status(error.status).json({ message: error.message });
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
      }
    }
  };

  public createEmployee = async (req: Request, res: Response): Promise<void> => {
    try {
      const employeeData: CreateEmployeeDto = req.body;
      const employee = await this.employeeService.create(employeeData);
      res.status(StatusCodes.CREATED).json({ data: employee, message: "created" });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        res.status(error.status).json({ message: error.message });
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
      }
    }
  };

  public updateEmployee = async (req: Request, res: Response): Promise<void> => {
    try {
      const employeeId = Number(req.params.id);
      const employeeData: UpdateEmployeeDto = req.body;
      const employee = await this.employeeService.update(employeeId, employeeData);

      if (!employee) {
        throw new HttpException(StatusCodes.NOT_FOUND, "Employee not found");
      }

      res.status(StatusCodes.OK).json({ data: employee, message: "updated" });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        res.status(error.status).json({ message: error.message });
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error", error: error });
      }
    }
  };

  public deleteEmployee = async (req: Request, res: Response): Promise<void> => {
    try {
      const employeeId = Number(req.params.id);
      await this.employeeService.delete(employeeId);
      res.status(StatusCodes.OK).json({ message: "deleted" });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        res.status(error.status).json({ message: error.message });
      } else {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" });
      }
    }
  };

  public updateLeaveBalance = async (req: Request, res: Response): Promise<void> => {
    try {
      const employeeId = Number(req.params.id);
      const { type, days } = req.body;

      if (!["sick", "vacation"].includes(type)) {
        throw new HttpException(StatusCodes.BAD_REQUEST, "Invalid leave type");
      }

      const employee = await this.employeeService.updateLeaveBalance(employeeId, type as "sick" | "vacation", days);
      res.status(StatusCodes.OK).json({ data: employee, message: "leave balance updated" });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        res.status(error.status).json({ message: error.message });
      } else {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" });
      }
    }
  };

  public updateAgency = async (req: Request, res: Response): Promise<void> => {
    try {
      const employeeId = Number(req.params.id);
      const { agency } = req.body;

      if (!agency) {
        throw new HttpException(StatusCodes.BAD_REQUEST, "Agency is required");
      }

      const employee = await this.employeeService.updateAgency(employeeId, agency);
      res.status(StatusCodes.OK).json({ data: employee, message: "agency updated" });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        res.status(error.status).json({ message: error.message });
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
      }
    }
  };

  public removeEmployeeFromDepartment = async (req: Request, res: Response): Promise<void> => {
    try {
      const employeeId = Number(req.params.id);
      await this.employeeService.removeEmployeeFromDepartment(employeeId);
      res.status(StatusCodes.OK).json({ message: "employee removed from department" });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        res.status(error.status).json({ message: error.message });
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
      }
    }
  };
}
