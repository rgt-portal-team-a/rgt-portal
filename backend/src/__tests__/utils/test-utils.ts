import { Request, Response } from "express";
import { AppDataSource } from "@/database/data-source";
import { Repository } from "typeorm";
import { Employee } from "@/entities/employee.entity";
import { User, Role, Department } from "@/entities";
import { HttpException } from "@/exceptions/HttpException";
import { StatusCodes } from "http-status-codes";
import { expect, vi } from "vitest";

// Extend Express Request type
interface AuthenticatedRequest extends Request {
  user?: User;
}

// Helper to create test instances
export const createTestInstance = <T extends object>(data: Partial<T>): T => {
  return {
    ...data,
    id: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as T;
};

// Mock Express Request and Response
export const mockRequest = (body = {}, params = {}, query = {}) => {
  return {
    body,
    params,
    query,
    headers: {},
  } as AuthenticatedRequest;
};

export const mockResponse = () => {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

export const mockQueryRunner = () => {
  return {
    manager: {
      save: vi.fn(),
    },
  };
};

export const mockDatabaseService = () => {
  return {
    createTransaction: vi.fn(),
    commitTransaction: vi.fn(),
    rollbackTransaction: vi.fn(),
  };
};

export const mockPost = () => {
  return {
    id: 1,
    title: "Test Post",
    content: "Test Content",
    author: mockUser,
    comments: [],
    likes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};


// Mock Repository
export const createMockRepository = <T extends object>() => {
  return {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    createQueryBuilder: vi.fn(),
  } as unknown as Repository<T>;
};

// Mock Database Connection
export const mockAppDataSource = {
  getRepository: vi.fn(),
  initialize: vi.fn(),
  destroy: vi.fn(),
};

// Mock Role Data
export const mockRole = createTestInstance<Role>({
  name: "EMPLOYEE",
  description: "Regular employee role",
  users: [],
});

// Mock Department Data
export const mockDepartment = createTestInstance<Department>({
  name: "Engineering",
  description: "Software Engineering Department",
  managerId: 1,
  manager: undefined,
  employees: [],
});

// Mock User Data
export const mockUser = createTestInstance<User>({
  username: "johndoe",
  email: "john.doe@example.com",
  profileImage: undefined,
  password: undefined,
  isPasswordSet: false,
  requiresVerification: false,
  role: mockRole,
  employee: undefined,
});

// Mock Employee Data
export const mockEmployee = createTestInstance<Employee>({
  firstName: "John",
  lastName: "Doe",
  phone: "+1234567890",
  position: "Software Engineer",
  hireDate: new Date(),
  annualDaysOff: 20,
  department: mockDepartment,
  departmentId: 1,
  user: mockUser,
  projectAssignments: [],
  givenRecognitions: [],
  receivedRecognitions: [],
  sickDaysBalance: 10,
  vacationDaysBalance: 15,
  contactDetails: {},
});

// Test Setup and Teardown
export const setupTestDatabase = async () => {
  vi.spyOn(AppDataSource, "getRepository").mockImplementation(mockAppDataSource.getRepository);
  vi.spyOn(AppDataSource, "initialize").mockImplementation(mockAppDataSource.initialize);
  vi.spyOn(AppDataSource, "destroy").mockImplementation(mockAppDataSource.destroy);
};

export const teardownTestDatabase = async () => {
  vi.clearAllMocks();
};

// Common Test Assertions
export const expectHttpException = async (promise: Promise<any>, expectedStatus: number, expectedMessage: string) => {
  await expect(promise).rejects.toThrow(HttpException);
  await expect(promise).rejects.toMatchObject({
    status: expectedStatus,
    message: expectedMessage,
  });
};

export const expectSuccessResponse = (response: any, expectedData: any, expectedMessage: string) => {
  expect(response.status).toHaveBeenCalledWith(StatusCodes.OK);
  expect(response.json).toHaveBeenCalledWith({
    data: expectedData,
    message: expectedMessage,
  });
};

// Mock Auth Middleware
export const mockAuthMiddleware = {
  isAuthenticated: vi.fn().mockImplementation((req: AuthenticatedRequest, res: Response, next: Function) => {
    req.user = mockUser;
    next();
  }),
  hasRole: (roles: string[]) =>
    vi.fn().mockImplementation((req: AuthenticatedRequest, res: Response, next: Function) => {
      if (req.user?.role?.name && roles.includes(req.user.role.name)) {
        next();
      } else {
        next(new HttpException(StatusCodes.FORBIDDEN, "Access denied"));
      }
    }),
  hasRoleOrApiKey: (roles: string[]) =>
    vi.fn().mockImplementation((req: AuthenticatedRequest, res: Response, next: Function) => {
      if ((req.user?.role?.name && roles.includes(req.user.role.name)) || req.headers["x-api-key"]) {
        next();
      } else {
        next(new HttpException(StatusCodes.FORBIDDEN, "Access denied"));
      }
    }),
  hasRoleOrIsAuthor: (roles: string[], getAuthorId: (req: AuthenticatedRequest) => number) =>
    vi.fn().mockImplementation((req: AuthenticatedRequest, res: Response, next: Function) => {
      if ((req.user?.role?.name && roles.includes(req.user.role.name)) || req.user?.id === getAuthorId(req)) {
        next();
      } else {
        next(new HttpException(StatusCodes.FORBIDDEN, "Access denied"));
      }
    }),
};
