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
  console.log("req.sessionID", req.sessionID);

  res.status(200).json(req.user ? { 
    ...req.user, 
    token: req.sessionID ,
  } : {});
});

router.get("/session", (req: Request, res: Response) => {
  console.log("req.sessionID", req.sessionID);
  console.log("req.session", req.session);
  res.status(200).json({session: req.session, sessionID: req.sessionID});
});

export default router;
