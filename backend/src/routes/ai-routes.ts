import { Router } from "express";
import { AuthMiddleware } from "@/middleware/auth.middleware";
import { Roles } from "@/defaults/role";
import { AiController } from "@/controllers/ai.controller";
import { 
  AttritionRequestDto,
  CandidateMatchRequestDto,
  CvExtractionRequestDto 
} from "@/dtos/ai.dto";
import { validateDto } from "@/middleware/validator.middleware";
import multer from "multer";

const aiRouter = Router();
const authMiddleware = new AuthMiddleware();
const aiController = new AiController();

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

aiRouter.post(
  "/predict-attrition",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRole([Roles.HR, Roles.MANAGER, Roles.ADMIN]),
  validateDto(AttritionRequestDto),
  aiController.predictAttrition.bind(aiController)
);

aiRouter.post(
  "/predict-match",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRole([Roles.HR, Roles.ADMIN]),
  validateDto(CandidateMatchRequestDto),
  aiController.predictMatch.bind(aiController)
);

aiRouter.post(
  "/extract-cv",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRole([Roles.HR, Roles.ADMIN]),
  upload.single("file"),
  validateDto(CvExtractionRequestDto, true),
  aiController.extractCv.bind(aiController)
);

export default aiRouter;
