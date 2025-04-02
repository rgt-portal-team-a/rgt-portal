import { Router } from "express";
import { EmployeeAnalyticsController } from "@/controllers/employee-analytics.controller";
import { AuthMiddleware } from "@/middleware/auth.middleware";
import { Roles } from "@/defaults/role";

const employeeAnalyticsRouter = Router();
const employeeAnalyticsController = new EmployeeAnalyticsController();
const authMiddleware = new AuthMiddleware();

// All routes require authentication and HR/Admin role
employeeAnalyticsRouter.use(authMiddleware.isAuthenticated);
employeeAnalyticsRouter.use(authMiddleware.hasRoleOrApiKey([Roles.ADMIN, Roles.HR]));

// Turnover Trends Over Time
employeeAnalyticsRouter.get(
  "/turnover-trends",
  employeeAnalyticsController.getTurnoverTrendsOverTime
);

// Reasons for Leaving Analysis
employeeAnalyticsRouter.get(
  "/leaving-reasons",
  employeeAnalyticsController.getReasonsForLeaving
);

// Turnover Rates by Position
employeeAnalyticsRouter.get(
  "/turnover-by-position",
  employeeAnalyticsController.getTurnoverRatesByPosition
);

// Turnover Analysis by Employee Experience (Tenure)
employeeAnalyticsRouter.get(
  "/turnover-by-tenure",
  employeeAnalyticsController.getTurnoverByTenure
);

export default employeeAnalyticsRouter; 