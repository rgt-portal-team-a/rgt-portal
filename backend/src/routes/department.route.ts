import { Router } from "express";
import { DepartmentController } from "@/controllers/department.controller";
import { AuthMiddleware } from "@/middleware/auth.middleware";
import { Roles } from "@/defaults/role";

const departmentRouter = Router();
const authMiddleware = new AuthMiddleware();
const departmentController = new DepartmentController();

departmentRouter.get("/", authMiddleware.isAuthenticated, departmentController.getAllDepartments);

departmentRouter.get("/:id", authMiddleware.isAuthenticated, departmentController.getDepartmentById);

departmentRouter.post("/", authMiddleware.isAuthenticated, authMiddleware.hasRole([Roles.ADMIN, Roles.HR]), departmentController.createDepartment);

departmentRouter.put("/:id", authMiddleware.isAuthenticated, authMiddleware.hasRole([Roles.ADMIN, Roles.HR]), departmentController.updateDepartment);

departmentRouter.delete("/:id", authMiddleware.isAuthenticated, authMiddleware.hasRole([Roles.ADMIN, Roles.HR]), departmentController.deleteDepartment);

departmentRouter.get("/:id/stats", departmentController.getDepartmentStats);

departmentRouter.get("/manager/:managerId", authMiddleware.isAuthenticated, departmentController.getDepartmentsByManagerId);

departmentRouter.post(
  "/transfer-employees",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRole([Roles.ADMIN, Roles.HR]),
  departmentController.transferEmployees,
);

departmentRouter.post(
  "/:id/employees",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRole([Roles.ADMIN, Roles.HR, Roles.MANAGER]),
  departmentController.addEmployeeToDepartment,
);

departmentRouter.post(
  "/:id/employees/bulk",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRole([Roles.ADMIN, Roles.HR]),
  departmentController.addEmployeesToDepartment,
);

departmentRouter.delete(
  "/:id/employees/:employeeId",
  // authMiddleware.isAuthenticated,
  // authMiddleware.hasRole([Roles.ADMIN, Roles.HR, Roles.MANAGER]),
  departmentController.removeEmployeeFromDepartment,
);

departmentRouter.put(
  "/:id/manager",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRole([Roles.ADMIN, Roles.HR]),
  departmentController.updateManager,
);

export default departmentRouter;
