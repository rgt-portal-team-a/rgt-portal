import { AppDataSource } from "@/database/data-source";
import { ApiKey } from "@/entities/api-keys.entity";

export class ApiKeyService {
  private apiKeyRepository = AppDataSource.getRepository(ApiKey);

  async validateApiKey(key: string): Promise<boolean> {
    const apiKey = await this.apiKeyRepository.findOne({ where: { key, isActive: true } });
    return !!apiKey;
  }

  async createApiKey(description: string): Promise<ApiKey> {
    const apiKey = this.apiKeyRepository.create({ key: this.generateApiKey(), description });
    return this.apiKeyRepository.save(apiKey);
  }

  private generateApiKey(): string {
    return [...Array(30)].map(() => Math.random().toString(36)[2]).join("");
  }
}
