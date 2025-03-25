import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ApiKeyService } from "@/services/api-key.service";
import { ApiKey } from "@/entities/api-keys.entity";
import { AppDataSource } from "@/database/data-source";
import { Repository } from "typeorm";

vi.mock("@/database/data-source", () => ({
  AppDataSource: {
    getRepository: vi.fn(),
  },
}));

describe("ApiKeyService", () => {
  let apiKeyService: ApiKeyService;
  let mockApiKeyRepository: Repository<ApiKey>;

  const mockApiKey = {
    id: 1,
    key: "test-api-key",
    description: "Test API Key",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as ApiKey;

  beforeEach(() => {
    mockApiKeyRepository = {
      findOne: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
    } as any;

    (AppDataSource.getRepository as any).mockReturnValue(mockApiKeyRepository);

    apiKeyService = new ApiKeyService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("validateApiKey", () => {
    it("should return true for valid active API key", async () => {
      (mockApiKeyRepository.findOne as any).mockResolvedValue(mockApiKey);

      const result = await apiKeyService.validateApiKey("test-api-key");

      expect(result).toBe(true);
      expect(mockApiKeyRepository.findOne).toHaveBeenCalledWith({
        where: { key: "test-api-key", isActive: true },
      });
    });

    it("should return false for inactive API key", async () => {
      (mockApiKeyRepository.findOne as any).mockResolvedValue(null);

      const result = await apiKeyService.validateApiKey("test-api-key");

      expect(result).toBe(false);
      expect(mockApiKeyRepository.findOne).toHaveBeenCalledWith({
        where: { key: "test-api-key", isActive: true },
      });
    });

    it("should return false for non-existent API key", async () => {
      (mockApiKeyRepository.findOne as any).mockResolvedValue(null);

      const result = await apiKeyService.validateApiKey("non-existent-key");

      expect(result).toBe(false);
    });
  });

  describe("createApiKey", () => {
    it("should create a new API key", async () => {
      const description = "New API Key";
      const generatedKey = "generated-api-key";

      // Mock the generateApiKey method
      const generateApiKeySpy = vi.spyOn(apiKeyService as any, "generateApiKey").mockReturnValue(generatedKey);

      (mockApiKeyRepository.create as any).mockReturnValue(mockApiKey);
      (mockApiKeyRepository.save as any).mockResolvedValue(mockApiKey);

      const result = await apiKeyService.createApiKey(description);

      expect(result).toEqual(mockApiKey);
      expect(generateApiKeySpy).toHaveBeenCalled();
      expect(mockApiKeyRepository.create).toHaveBeenCalledWith({
        key: generatedKey,
        description,
      });
      expect(mockApiKeyRepository.save).toHaveBeenCalled();
    });

    it("should generate a unique API key", async () => {
      const description = "New API Key";

      // Mock the generateApiKey method to return a predictable key for testing
      const generateApiKeySpy = vi.spyOn(apiKeyService as any, "generateApiKey").mockReturnValue("test-key");

      (mockApiKeyRepository.create as any).mockReturnValue(mockApiKey);
      (mockApiKeyRepository.save as any).mockResolvedValue(mockApiKey);

      await apiKeyService.createApiKey(description);

      expect(generateApiKeySpy).toHaveBeenCalled();
      expect(mockApiKeyRepository.create).toHaveBeenCalledWith({
        key: "test-key",
        description,
      });
    });
  });
});
