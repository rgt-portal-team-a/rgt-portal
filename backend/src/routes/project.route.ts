import { Router } from "express";
import { ProjectController } from "@/controllers/project.controller";
import { AuthMiddleware } from "@/middleware/auth.middleware";
import { Roles } from "@/defaults/role";
import { CreateProjectDto, UpdateProjectDto, AddEmployeeToProjectDto, AddEmployeesToProjectDto, UpdateEmployeeRoleDto } from "@/dtos/project.dto";
import { validateDto } from "@/middleware/validator.middleware";

const projectRouter = Router();
const authMiddleware = new AuthMiddleware();
const projectController = new ProjectController();

projectRouter.get("/", authMiddleware.isAuthenticated, projectController.getAllProjects);

projectRouter.get("/:id", authMiddleware.isAuthenticated, projectController.getProjectById);

projectRouter.get("/lead/:leadId", authMiddleware.isAuthenticated, projectController.getProjectsByLeadId);

projectRouter.get("/status/:status", authMiddleware.isAuthenticated, projectController.getProjectsByStatus);

projectRouter.get("/employee/:employeeId", authMiddleware.isAuthenticated, projectController.getProjectsByEmployee);

projectRouter.get("/date-range", authMiddleware.isAuthenticated, projectController.getProjectsByDateRange);

projectRouter.post(
  "/",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRole([Roles.ADMIN, Roles.MANAGER]),
  validateDto(CreateProjectDto),
  projectController.createProject,
);

projectRouter.post(
  "/:id/employees",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRole([Roles.ADMIN, Roles.MANAGER]),
  validateDto(AddEmployeeToProjectDto),
  projectController.addEmployeeToProject,
);

projectRouter.post(
  "/:id/employees/batch",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRole([Roles.ADMIN, Roles.MANAGER]),
  validateDto(AddEmployeesToProjectDto),
  projectController.addEmployeesToProject,
);

projectRouter.put(
  "/:id",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRole([Roles.ADMIN, Roles.MANAGER]),
  validateDto(UpdateProjectDto),
  projectController.updateProject,
);

projectRouter.put(
  "/:id/employees/role",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRole([Roles.ADMIN, Roles.MANAGER]),
  validateDto(UpdateEmployeeRoleDto),
  projectController.updateEmployeeRole,
);

projectRouter.delete("/:id", authMiddleware.isAuthenticated, authMiddleware.hasRole([Roles.ADMIN, Roles.MANAGER]), projectController.deleteProject);

projectRouter.delete(
  "/:id/employees/:employeeId",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRole([Roles.ADMIN, Roles.MANAGER]),
  projectController.removeEmployeeFromProject,
);

export default projectRouter;
