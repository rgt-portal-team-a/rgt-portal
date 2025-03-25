import { Router } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { UserService } from "@/services/auth.service";
import rateLimiter from "express-rate-limit";
import { asyncHandler } from "@/utils/function";
import { LoginDto, VerifyOtpDto, RequestOtpDto, SetPasswordDto, ForgotPasswordDto, VerifyResetTokenDto, ResetPasswordDto } from "@/dtos/auth.dto";
import { validateDto } from "@/middleware/validator.middleware";
import { AuthController } from "@/controllers/user.controller";
import "@/controllers/auth.controller";

const userRouter = Router();
const authController = new AuthController();
const userService = new UserService();

const env = process.env.NODE_ENV;
const clientURL = env === "development" ? process.env.DEV_CLIENT_URL : process.env.CLIENT_URL;

const authLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 25,
  message: "Too many login attempts from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email: string, password: string, done: Function) => {
      try {
        const result = await userService.authenticateLocal(email);
        return done(null, { user: result.user, requiresOtp: result.requiresOtp, otpId: result?.otpId });
      } catch (error: any) {
        return done(null, false, { message: error.message });
      }
    },
  ),
);

userRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

userRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: `${clientURL}${process.env.SUCCESS_REDIRECT}`,
    failureRedirect: `${clientURL}${process.env.FAILURE_REDIRECT}`,
  }),
);

userRouter.post("/login", authLimiter, validateDto(LoginDto), asyncHandler(authController.login));

userRouter.post("/verify-otp", validateDto(VerifyOtpDto), asyncHandler(authController.verifyOtp));

userRouter.post("/request-otp", validateDto(RequestOtpDto), asyncHandler(authController.requestOtp));

userRouter.post("/set-password", validateDto(SetPasswordDto), asyncHandler(authController.setPassword));

userRouter.post("/forgot-password", validateDto(ForgotPasswordDto), asyncHandler(authController.forgotPassword));

userRouter.post("/verify-reset-token", validateDto(VerifyResetTokenDto), asyncHandler(authController.verifyResetToken));

userRouter.post("/reset-password", validateDto(ResetPasswordDto), asyncHandler(authController.resetPassword));

userRouter.post("/logout", authController.logout);

export default userRouter;
