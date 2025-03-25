import "reflect-metadata";
import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../database/data-source";
import { logger } from "../config/logger.config";

export const initializeDatabaseConnection = async () => {
  try {
    await AppDataSource.initialize();
    logger.info("Database connection initialized");
  } catch (error) {
    console.log("Error initializing database connection:", error);
    logger.error("Error initializing database connection:", error);
    throw error;
  }
};

export const checkDatabaseConnection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!AppDataSource.isInitialized) {
      throw new Error("Database connection not initialized");
    }
    next();
  } catch (error) {
    next(error);
  }
};
