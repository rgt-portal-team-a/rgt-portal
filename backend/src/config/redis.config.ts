import Redis from "ioredis";
import "dotenv/config";
import { logger } from "./logger.config";

export const redis = new Redis(process.env.REDIS_URI as string, {
  password: process.env.REDIS_PASSWORD,
});

redis.on("error", (err) => {
  logger.error({ level: "error", message: `${err}` });
});

redis.on("ready", () => {
  logger.info({ level: "info", message: "Connected to Redis instance" });
});

redis.on("end", () => {
  logger.info({ level: "info", message: "Disconnected from Redis instance" });
});
