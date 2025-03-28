import { Router } from "express";
import { EmployeeController } from "@/controllers/employee.controller";
import { AuthMiddleware } from "@/middleware/auth.middleware";
import { Roles } from "@/defaults/role";

const employeeRouter = Router();
const employeeController = new EmployeeController();
const authMiddleware = new AuthMiddleware();

employeeRouter.use(authMiddleware.isAuthenticated);


employeeRouter.get("/user/:userId", employeeController.getEmployeeByUserId);
employeeRouter.put("/:id/leave-balance", employeeController.updateLeaveBalance);

employeeRouter.get("/", authMiddleware.hasRoleOrApiKey([Roles.HR, Roles.MANAGER, Roles.ADMIN]), employeeController.getAllEmployees);
employeeRouter.post("/", authMiddleware.hasRole([Roles.HR, Roles.ADMIN]), employeeController.createEmployee);
employeeRouter.put(
  "/:id",
  authMiddleware.hasRoleOrIsAuthor([Roles.HR, Roles.ADMIN], async (req) => parseInt(req.params.id)),
  employeeController.updateEmployee,
);
employeeRouter.delete("/:id", authMiddleware.hasRole([Roles.HR, Roles.ADMIN]), employeeController.deleteEmployee);
employeeRouter.put("/:id/agency", authMiddleware.hasRole([Roles.HR, Roles.ADMIN]), employeeController.updateAgency);

employeeRouter.get("/:id", employeeController.getEmployeeById);
employeeRouter.delete("/:id/department", authMiddleware.hasRole([Roles.HR, Roles.ADMIN, Roles.MANAGER]), employeeController.removeEmployeeFromDepartment);

employeeRouter.post("/batch", authMiddleware.hasRole([Roles.HR, Roles.ADMIN]), employeeController.createBatchEmployee);

export default employeeRouter;
