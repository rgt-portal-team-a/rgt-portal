import { Router } from "express";
import { OnboardController } from "@/controllers/onboard.controller";
import { AuthMiddleware } from "@/middleware/auth.middleware";
import { Roles } from "@/defaults/role";
import { validateDto } from "@/middleware/validator.middleware";
import { OnboardUserDto, UpdateUserStatusDto } from "@/dtos/user.dto";

const router = Router();
const onboardController = new OnboardController();
const authMiddleware = new AuthMiddleware();

router.use(authMiddleware.isAuthenticated);
router.use(authMiddleware.hasRole([Roles.HR, Roles.ADMIN]));

router.get("/awaiting", onboardController.getAwaitingUsers);

router.post(
  "/",
  validateDto(OnboardUserDto),
  onboardController.onboardUser
);

router.post(
  "/status",
  validateDto(UpdateUserStatusDto),
  onboardController.updateUserStatus
);

export default router; 