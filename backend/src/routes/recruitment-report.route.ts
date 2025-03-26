import { Router } from "express";
import { RecruitmentReportController } from "@/controllers/recruitment-report.controller";
import { AuthMiddleware } from "@/middleware/auth.middleware";
import { Roles } from "@/defaults/role";

const recruitmentReportRouter = Router();
const recruitmentReportController = new RecruitmentReportController();
const authMiddleware = new AuthMiddleware();

// All routes require authentication and HR/Admin role
recruitmentReportRouter.use(authMiddleware.isAuthenticated);
recruitmentReportRouter.use(authMiddleware.hasRoleOrApiKey([Roles.ADMIN, Roles.HR]));

// Hiring Ladder Data
recruitmentReportRouter.get(
  "/hiring-ladder",
  recruitmentReportController.getHiringLadderData
);

// Conversion Rate by Stage
recruitmentReportRouter.get(
  "/conversion-rate",
  recruitmentReportController.getConversionRateByStage
);

// Source to Hire Success Rate
recruitmentReportRouter.get(
  "/source-success-rate",
  recruitmentReportController.getSourceToHireSuccessRate
);

// Dropout Rate by Stage
recruitmentReportRouter.get(
  "/dropout-rate",
  recruitmentReportController.getDropoutRateByStage
);

// Headcount by Work Type
recruitmentReportRouter.get(
  "/headcount-worktype",
  recruitmentReportController.getHeadcountByWorkType
);

// Candidates by Department
recruitmentReportRouter.get(
  "/candidates-department",
  recruitmentReportController.getCandidatesByDepartment
);

export default recruitmentReportRouter; 