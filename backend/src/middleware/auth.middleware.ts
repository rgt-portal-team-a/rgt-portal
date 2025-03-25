import { Request, Response, NextFunction, RequestHandler } from "express";
import { UserService } from "@/services/user.service";
import { ApiKeyService } from "@/services/api-key.service";
import { User } from "@/entities/user.entity";
import { sessionStore } from "./session.middleware";
import { logger } from "@/config/logger.config";
import { Roles } from "@/defaults/role";

export class AuthMiddleware {
  private userService: UserService;
  private apiKeyService: ApiKeyService;

  constructor() {
    this.userService = new UserService();
    this.apiKeyService = new ApiKeyService();
  }

  isAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized: User not authenticated" });
  }

  hasRole(roles: string[]): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const userRole = (req.user as any)?.role?.name;
      console.log("user role:", userRole);

      if (!roles.includes(userRole)) {
        res.status(403).json({ message: "Forbidden: User does not have the required permissions" });
        return;
      }

      next();
    };
  }

  hasRoleOrIsAuthor(roles: string[], authorIdExtractor: (req: Request) => Promise<number>): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const user = req.user as any;
      if (!user) {
        res.status(401).json({ message: "Unauthorized: User not authenticated" });
        return;
      }

      const userRole = (req.user as any)?.role?.name;

      if (roles.includes(userRole)) {
        next();
        return;
      }

      try {
        const authorId = await authorIdExtractor(req);
        if (user && user.id === authorId) {
          next();
          return;
        }
      } catch (error) {
        res.status(403).json({ message: "Forbidden: User does not have the required permissions" });
        return;
      }

      res.status(403).json({ message: "Forbidden: User does not have the required permissions" });
    };
  }

  ownAccess = (getOwnerId: (req: Request) => Promise<number | null>) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      if (!req.user) {
        res.status(401).json({ message: "Unauthorized: User not authenticated" });
        return;
      }

      try {
        const ownerId = await getOwnerId(req);

        if (!ownerId) {
          res.status(404).json({ message: "Resource not found" });
          return;
        }

        if ((req.user as any).employee.id !== ownerId) {
          res.status(403).json({ message: "Forbidden: You do not have permission to modify this resource" });
          return;
        }

        next();
      } catch (error: any) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
      }
    };
  };

  ownAccessOrHrOrAdmin = (getOwnerId: (req: Request) => Promise<number | null>) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      if (!req.user) {
        res.status(401).json({ message: "Unauthorized: User not authenticated" });
        return;
      }

      const user = req.user as any;
      const userRole = user?.role?.name;

      if (userRole === Roles.ADMIN || userRole === Roles.HR) {
        return next();
      }

      try {
        const ownerId = await getOwnerId(req);

        if (!ownerId) {
          res.status(404).json({ message: "Resource not found" });
          return;
        }

        if (user.employee.id === ownerId) {
          return next();
        }

        res.status(403).json({ message: "Forbidden: You do not have permission to access this resource" });
      } catch (error: any) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
      }
    };
  };

  hasRoleOrApiKey(roles: string[]): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const user = req.user as any;
      const apiKey = req.headers["x-api-key"] as string;

      if (user && roles.includes(user.role?.name)) {
        return next();
      }

      if (apiKey) {
        const isValidApiKey = await this.apiKeyService.validateApiKey(apiKey);
        if (isValidApiKey) {
          return next();
        }
      }

      res.status(403).json({ message: "Forbidden: User does not have the required permissions or a valid API key" });
    };
  }

  getAuthUser(req: Request): Promise<User | null> {
    const user = req.user as any;
    return user || null;
  }

  async validateToken(token: string): Promise<User | null> {
    try {
      if (!sessionStore) {
        console.error("Session store not available");
        return null;
      }

      const util = require("util");
      const getSession = util.promisify(sessionStore.get.bind(sessionStore));

      logger.info("Getting session for token:", token);

      const session = await getSession(token);

      if (!session || !session.passport || !session.passport.user) {
        return null;
      }

      const userId = session.passport.user;
      return await this.userService.findById(userId);
    } catch (error) {
      console.error("Token validation error:", error);
      return null;
    }
  }
}
