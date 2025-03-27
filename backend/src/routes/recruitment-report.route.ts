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

// Employee Count by Department
recruitmentReportRouter.get(
  "/employee-count-department",
  recruitmentReportController.getEmployeeCountByDepartment
);

// Employee Head Count by Work Type
recruitmentReportRouter.get(
  "/employee-headcount-worktype",
  recruitmentReportController.getEmployeeHeadCountByWorkType
);

// Set All Employees to Hybrid
recruitmentReportRouter.post(
  "/set-all-employees-to-hybrid",
  recruitmentReportController.setAllEmployeesToHybrid
);

export default recruitmentReportRouter; 