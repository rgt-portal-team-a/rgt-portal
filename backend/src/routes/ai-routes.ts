import { Router } from "express";
import { AuthMiddleware } from "@/middleware/auth.middleware";
import { Roles } from "@/defaults/role";
import { AiController } from "@/controllers/ai.controller";
import { AttritionRequestDto } from "@/dtos/ai.dto";
import { validateDto } from "@/middleware/validator.middleware";

const aiRouter = Router();
const authMiddleware = new AuthMiddleware();
const aiController = new AiController();

aiRouter.post(
  "/predict-attrition",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRole([Roles.HR, Roles.MANAGER, Roles.ADMIN]),
  validateDto(AttritionRequestDto),
  aiController.predictAttrition.bind(aiController)
);

export default aiRouter;
