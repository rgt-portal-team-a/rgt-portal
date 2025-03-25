import { Router } from "express";
import { EventController } from "@/controllers/event.controller";
import { AuthMiddleware } from "@/middleware/auth.middleware";
import { Roles } from "@/defaults/role";

const eventRouter = Router();
const eventController = new EventController();
const authMiddleware = new AuthMiddleware();

eventRouter.get("/", authMiddleware.isAuthenticated, eventController.getAllEvents);

eventRouter.get("/upcoming", authMiddleware.isAuthenticated, eventController.getUpcomingEvents);

eventRouter.get("/date-range", authMiddleware.isAuthenticated, eventController.getEventsByDateRange);

eventRouter.get("/:id", authMiddleware.isAuthenticated, eventController.getEventById);

eventRouter.get("/organizer/:organizerId", authMiddleware.isAuthenticated, eventController.getEventsByOrganizerId);

eventRouter.get("/employee/:employeeId", authMiddleware.isAuthenticated, eventController.getEventsByEmployeeParticipation);

eventRouter.post("/", authMiddleware.isAuthenticated, authMiddleware.hasRole([Roles.ADMIN, Roles.HR]), eventController.createEvent);

eventRouter.put("/:id", authMiddleware.isAuthenticated, authMiddleware.hasRole([Roles.ADMIN, Roles.HR]), eventController.updateEvent);

eventRouter.delete(
  "/:id",
  authMiddleware.isAuthenticated,
  (req, res, next) => {
    const allowedRoles = [Roles.ADMIN, Roles.HR];
    if (authMiddleware.hasRole(allowedRoles)(req, res, () => true)) {
      return next();
    }
    next();
  },
  eventController.deleteEvent,
);

eventRouter.post(
  "/:id/participants/:employeeId",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRole([Roles.ADMIN, Roles.HR]),
  eventController.addParticipant,
);

eventRouter.post(
  "/:id/participants",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRole([Roles.ADMIN, Roles.HR]),
  eventController.addMultipleParticipants,
);

eventRouter.delete(
  "/:id/participants/:employeeId",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRole([Roles.ADMIN, Roles.HR]),
  eventController.removeParticipant,
);

export default eventRouter;
