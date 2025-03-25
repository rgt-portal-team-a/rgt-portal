import { Router } from "express";
import { RecruitmentController } from "@/controllers/recruitment.controller";
import { AuthMiddleware } from "@/middleware/auth.middleware";
import { Roles } from "@/defaults/role";

const recruitmentRouter = Router();
const recruitmentController = new RecruitmentController();
const authMiddleware = new AuthMiddleware();

recruitmentRouter.get("/", authMiddleware.isAuthenticated, authMiddleware.hasRoleOrApiKey([Roles.ADMIN, Roles.HR]), recruitmentController.getAllRecruitments);

recruitmentRouter.get(
  "/:id",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRoleOrApiKey([Roles.ADMIN, Roles.HR]),
  recruitmentController.getRecruitmentById,
);

recruitmentRouter.post("/", authMiddleware.isAuthenticated, authMiddleware.hasRoleOrApiKey([Roles.HR, Roles.ADMIN]), recruitmentController.createRecruitment);

recruitmentRouter.put(
  "/:id",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRoleOrApiKey([Roles.HR, Roles.ADMIN]),
  recruitmentController.updateRecruitment,
);

recruitmentRouter.patch(
  "/:id/status",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRoleOrApiKey([Roles.HR, Roles.ADMIN]),
  recruitmentController.updateRecruitmentStatus,
);

recruitmentRouter.delete(
  "/:id",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRoleOrApiKey([Roles.HR, Roles.ADMIN]),
  recruitmentController.deleteRecruitment,
);

recruitmentRouter.get(
  "/statistics/summary",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRoleOrApiKey([Roles.ADMIN, Roles.HR]),
  recruitmentController.getRecruitmentStatistics,
);

recruitmentRouter.get(
  "/due-dates/upcoming",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRoleOrApiKey([Roles.ADMIN, Roles.HR]),
  recruitmentController.getUpcomingDueDates,
);

recruitmentRouter.patch(
  "/:id/notify",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRoleOrApiKey([Roles.HR, Roles.ADMIN]),
  recruitmentController.markAsNotified,
);

export default recruitmentRouter;
