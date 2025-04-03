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
  "/extract-cv",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRole([Roles.HR, Roles.ADMIN]),
  upload.single("file"),
  validateDto(CvExtractionRequestDto, true),
  aiController.extractCv.bind(aiController)
);

aiRouter.get(
  "/get-all-job-match-results",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRole([Roles.HR, Roles.ADMIN]),
  aiController.getAllJobMatchResults.bind(aiController)
);

aiRouter.get(
  "/get-program-of-study-hired",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRole([Roles.HR, Roles.ADMIN]),
  aiController.getProgramOfStudyHired.bind(aiController)
);

export default aiRouter;
