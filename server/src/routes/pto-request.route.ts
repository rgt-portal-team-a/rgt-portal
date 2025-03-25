import { Router } from "express";
import { PtoRequestController } from "@/controllers/pto-request.controller";
import { AuthMiddleware } from "@/middleware/auth.middleware";
import { Roles } from "@/defaults/role";
import { DepartmentService } from "@/services/department.service";

const ptoRouter = Router();
const authMiddleware = new AuthMiddleware();
const ptoController = new PtoRequestController();
const departmentService = new DepartmentService();

ptoRouter.get("/my-requests", authMiddleware.isAuthenticated, ptoController.getMyPtoRequests);
ptoRouter.get("/summary", ptoController.getDaysOffSummary);
ptoRouter.get(
  "/department/:departmentId",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRole([Roles.MANAGER]),
  authMiddleware.ownAccess(async (req) => {
    const department = await departmentService.findById(parseInt(req.params.departmentId));
    return department?.manager.id || null;
  }),
  ptoController.getDepartmentPtoRequests
);

ptoRouter.get(
  "/summary/:employeeId",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRole([Roles.HR, Roles.MANAGER, Roles.ADMIN]),
  ptoController.getDaysOffSummary,
);

ptoRouter.get(
  "/all",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRole([Roles.HR, Roles.MANAGER, Roles.ADMIN]),
  ptoController.getAllPtoRequests,
);

ptoRouter.get("/:id", ptoController.getPtoRequestById)
ptoRouter.put(
  "/:id",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRole([Roles.MANAGER, Roles.HR, Roles.ADMIN]),
  authMiddleware.ownAccessOrHrOrAdmin(async (req) => {
    const department = await departmentService.findById(parseInt(req.body.departmentId));
    return department?.manager.id || null;
  }),
  ptoController.updatePtoRequest,
);
ptoRouter.delete("/:id", ptoController.deletePtoRequest);
ptoRouter.post("/", ptoController.createPtoRequest);


export default ptoRouter;
