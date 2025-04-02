import { Router } from "express";
import { PollController } from "@/controllers/poll.controller";
import { AuthMiddleware } from "@/middleware/auth.middleware";
import { Roles } from "@/defaults/role";

const pollRouter = Router();
const authMiddleware = new AuthMiddleware();
const pollController = new PollController();
const pollService = new PollController().pollService;

pollRouter.get("/", authMiddleware.isAuthenticated, pollController.getAllPolls);

pollRouter.get("/:id", authMiddleware.isAuthenticated, pollController.getPollById);

pollRouter.post(
  "/",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRole([Roles.ADMIN, Roles.HR, Roles.MANAGER, Roles.MODERATOR]),
  pollController.createPoll,
);

pollRouter.post("/:id/vote", authMiddleware.isAuthenticated, pollController.vote);

pollRouter.put(
  "/:id",
  authMiddleware.isAuthenticated,
  authMiddleware.ownAccess(async (req) => {
    const poll = await pollService.findById(parseInt(req.params.id));
    return poll?.createdById || null;
  }),
  pollController.updatePoll,
);

pollRouter.delete(
  "/:id",
  authMiddleware.isAuthenticated,
  authMiddleware.ownAccess(async (req) => {
    const poll = await pollService.findById(parseInt(req.params.id));
    return poll?.createdById || null;
  }),
  pollController.deletePoll,
);

pollRouter.delete(
  "/:id/vote/:optionId",
  authMiddleware.isAuthenticated,
  authMiddleware.ownAccess(async (req) => {
    const vote = await pollService.findByPollIdAndUserId(parseInt(req.params.id), (req.user as any).employee.id);
    return vote?.employeeId || null;
  }),
  pollController.removeVote,
);

pollRouter.get("/:id/stats", authMiddleware.isAuthenticated, pollController.getPollStats);

pollRouter.get("/department/:departmentId", authMiddleware.isAuthenticated, pollController.getAllPolls);

pollRouter.put("/:id/status", authMiddleware.isAuthenticated, authMiddleware.hasRole([Roles.ADMIN, Roles.HR]), pollController.updatePoll);

// pollRouter.post("/:id/options", authMiddleware.isAuthenticated, pollController.addPollOption);

// pollRouter.delete("/:id/options/:optionId", authMiddleware.isAuthenticated, pollController.deletePollOption);

export default pollRouter;
