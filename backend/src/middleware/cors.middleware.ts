import type { CorsOptions } from "cors";

const cors: CorsOptions = {
  origin: process.env.NODE_ENV === "development" ? process.env.DEV_CLIENT_URL?.trim() : process.env.CLIENT_URL?.trim(),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Access-Control-Allow-Origin", "Access-Control-Allow-Credentials"],
  exposedHeaders: ["Set-Cookie"],
};

export { cors };
