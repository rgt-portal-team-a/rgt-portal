import { QueryRunner } from "typeorm";
import { AppDataSource } from "../database/data-source";

export class DatabaseService {
  static async createTransaction(): Promise<QueryRunner> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    return queryRunner;
  }

  static async commitTransaction(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.commitTransaction();
    await queryRunner.release();
  }

  static async rollbackTransaction(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  }
}
