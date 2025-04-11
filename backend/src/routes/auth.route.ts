import { Router } from "express";
import passport from "passport";
import "@/controllers/auth.controller";
import { Roles } from "@/defaults/role";
import { UserStatus } from "@/entities/user.entity";

const router = Router();

const env = process.env.NODE_ENV;
const clientURL = env === "development" ? process.env.DEV_CLIENT_URL : process.env.CLIENT_URL;

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", (err: Error | null, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.redirect(`${clientURL}${process.env.FAILURE_REDIRECT}?error=${encodeURIComponent(info?.message || 'Authentication failed')}`);
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }

        if (user.status === UserStatus.AWAITING) {
          return res.redirect(`${clientURL}/wait-room`);
        }

        const userRole = user.role.name;
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
            redirectPath = process.env.ADMIN_REDIRECT;
            break;
          default:
            redirectPath = process.env.USER_REDIRECT;
        }
        return res.redirect(`${clientURL}${redirectPath}`);
      });
    })(req, res, next);
  }
);

router.post("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

export default router;
