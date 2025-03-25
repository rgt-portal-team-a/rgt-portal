import type { CorsOptions } from "cors";

const cors: CorsOptions = {
  origin: process.env.NODE_ENV === "development" ? process.env.DEV_CLIENT_URL : process.env.CLIENT_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

export { cors };
