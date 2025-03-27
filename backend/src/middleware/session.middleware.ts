import { RedisStore } from "connect-redis";
import type { SessionOptions } from "express-session";
import { redis } from "@/config/redis.config";

export const sessionStore = new RedisStore({ client: redis });

export const session = {
  secret: "rgtportal2025",
  resave: false,
  saveUninitialized: true,
  store: sessionStore,
  cookie: {
    maxAge: 72 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "none",
  },
} as SessionOptions;
