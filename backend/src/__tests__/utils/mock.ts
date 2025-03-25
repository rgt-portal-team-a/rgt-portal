import { vi } from "vitest";

vi.mock("@/services/database.service", () => ({
  DatabaseService: {
    createTransaction: vi.fn().mockResolvedValue({
      manager: {
        save: vi.fn().mockImplementation((_:any, entity: any) => Promise.resolve(entity)),
        update: vi.fn().mockResolvedValue({ affected: 1 }),
        delete: vi.fn().mockResolvedValue({ affected: 1 }),
        createQueryBuilder: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnThis(),
          set: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          whereInIds: vi.fn().mockReturnThis(),
          execute: vi.fn().mockResolvedValue({}),
        }),
      },
    }),
    commitTransaction: vi.fn().mockResolvedValue(undefined),
    rollbackTransaction: vi.fn().mockResolvedValue(undefined),
  },
}));

// Also mock the Logger
vi.mock("@/services/logger.service", () => ({
  Logger: vi.fn().mockImplementation(() => ({
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  })),
}));
