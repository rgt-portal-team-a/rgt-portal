import { Router } from "express";
import { EmployeeRecognitionController } from "@/controllers/employee-recognition.controller";
import { AuthMiddleware } from "@/middleware/auth.middleware";
import { Roles } from "@/defaults/role";

const router = Router();
const recognitionController = new EmployeeRecognitionController();
const authMiddleware = new AuthMiddleware();

router.get(
  "/",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRole([Roles.HR, Roles.MANAGER, Roles.ADMIN]),
  recognitionController.getRecognitions,
);

router.get("/employee/:employeeId", authMiddleware.isAuthenticated, recognitionController.getRecognitionsByEmployee);

router.get("/category/:category", authMiddleware.isAuthenticated, recognitionController.getRecognitionsByCategory);

router.post(
  "/",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRole([Roles.HR, Roles.MANAGER, Roles.ADMIN]),
  recognitionController.createRecognition,
);

router.post(
  "/bulk",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRole([Roles.HR, Roles.MANAGER, Roles.ADMIN]),
  recognitionController.createBulkRecognitions,
);

router.delete(
  "/:id",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRoleOrIsAuthor([Roles.HR, Roles.MANAGER, Roles.ADMIN], async (req) => {
    const recognition: any = await recognitionController.getRecognitionsByEmployeeId(parseInt(req.params.id));
    return recognition.length > 0 ? recognition[0].recognizedBy.id : -1;
  }),
  recognitionController.deleteRecognition,
);

export default router;
