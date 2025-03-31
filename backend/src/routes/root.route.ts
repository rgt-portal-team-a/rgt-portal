import { Router, Request, Response, NextFunction } from "express";
import path from "path";
import { EmployeeService } from "@/services/employee.service";

const router = Router();
const employeeService = new EmployeeService();

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

router.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

router.get("/user", (req: Request, res: Response) => {
  console.log("Environment:", process.env.NODE_ENV);
  console.log("Client URL:", process.env.CLIENT_URL);
  console.log("Full session:", JSON.stringify(req.session, null, 2));
  console.log("Is Authenticated:", req.isAuthenticated());
  console.log("User object:", req.user);
  console.log("Session ID:", req.sessionID);

  res.status(200).json(
    req.user
      ? {
          ...req.user,
          sessionDetails: {
            authenticated: req.isAuthenticated(),
            sessionID: req.sessionID,
            environment: process.env.NODE_ENV,
          },
        }
      : {
          message: "No user authenticated",
          environment: process.env.NODE_ENV,
        },
  );
});

router.get("/session", (req: Request, res: Response) => {
  console.log("req.sessionID", req.sessionID);
  console.log("req.session", req.session);
  res.status(200).json({session: req.session, sessionID: req.sessionID});
});

export default router;
