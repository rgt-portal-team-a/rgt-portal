import { Router } from "express";
import passport from "passport";
import "@/controllers/auth.controller";
import { Roles } from "@/defaults/role";

const router = Router();

const env = process.env.NODE_ENV;
const clientURL = env === "development" ? process.env.DEV_CLIENT_URL : process.env.CLIENT_URL;

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: `${clientURL}${process.env.FAILURE_REDIRECT}`, session: true }),
  (req, res) => {    
    const userRole = (req.user as any)?.role.name;

    let redirectPath;
    switch (userRole) {
      case Roles.ADMIN:
        redirectPath = process.env.ADMIN_REDIRECT;
        break;
      case Roles.EMPLOYEE:
      case Roles.MANAGER:
      case Roles.MARKETER:
        redirectPath = process.env.EMPLOYEE_REDIRECT;
        break;
      case Roles.HR:
        redirectPath = process.env.HR_REDIRECT;
        break;
        
      default:
        redirectPath = process.env.USER_REDIRECT;
    }

    res.redirect(`${clientURL}${redirectPath}`);
  },
);

router.post("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

export default router;
