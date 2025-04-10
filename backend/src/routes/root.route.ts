import { Router, Request, Response, NextFunction } from "express";
import path from "path";
import { EmployeeService } from "@/services/employee.service";
import { logger } from "@/config/logger.config";

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

  console.log("Is Authenticated:", req.isAuthenticated());

  res.status(200).json(
    req.user
      ? {
        ...req.user,
        token: req.sessionID,
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
  res.status(200).json({ session: req.session, sessionID: req.sessionID });
});

router.post("/test-cookie", (req, res) => {
  try {
    res.cookie("thirdPartyTestCookie", "testValue", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000, 
    });

    const cookieExists = req.cookies?.thirdPartyTestCookie === "testValue";

    res.json({
      success: true,
      hasCookie: cookieExists,
      message: cookieExists ? "Third-party cookies are working properly" : "Third-party cookies might be blocked",
    });
  } catch (error) {
    logger.error("Cookie test failed:", error);
    res.status(500).json({
      success: false,
      hasCookie: false,
      message: "Cookie test failed",
    });
  }
});

export default router;
