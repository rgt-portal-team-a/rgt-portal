import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { UserService } from "@/services/auth.service";
import { BadRequestError, UnauthorizedError } from "@/utils/error";
import { User } from "@/entities";

export class AuthController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public login = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await this.userService.findByEmail(req.body.email);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    passport.authenticate("local", (err: any, authResult: any, info: any) => {
      if (err) {
        return next(err);
      }

      if (!authResult) {
        return res.status(401).json({ message: info.message || "Authentication failed" });
      }

      const { user, requiresOtp, otpId } = authResult;

      console.log('====================================');
      console.log(authResult);
      console.log('====================================');

      if (requiresOtp) {
        return res.json({
          success: true,
          requiresOtp: true,
          userId: user.id,
          otpId: otpId,
          message: "Verification code sent to your email",
        });
      }

      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }

        return res.json({ success: true, user, token: authResult.token });
      });
    })(req, res, next);
  };

  public verifyOtp = async (req: Request, res: Response) => {
    const { userId, otpId, otp } = req.body;

    try {
      const user = await this.userService.completeAuthWithOtp(userId, otpId, otp);

      req.logIn(user, (err) => {
        if (err) {
          throw err;
        }

        const { password, ...userWithoutPassword } = user;
        return res.json({ success: true, user: userWithoutPassword });
      });
    } catch (error: any) {
      if (error instanceof UnauthorizedError || error instanceof BadRequestError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      throw error;
    }
  };

  public requestOtp = async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await this.userService.initiateEmailVerification(email);
    res.json(result);
  };

  public setPassword = async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = (req.user as any).id;
    const { password } = req.body;

    const updatedUser = await this.userService.setPassword(userId, password);

    const { password: _, ...userWithoutPassword } = updatedUser as User;
    return res.json({ success: true, user: userWithoutPassword });
  };

  public forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await this.userService.initiatePasswordReset(email);
    res.json(result);
  };

  public verifyResetToken = async (req: Request, res: Response) => {
    const { token } = req.body;
    const result = await this.userService.verifyResetToken(token);
    res.json(result);
  };

  public resetPassword = async (req: Request, res: Response) => {
    const { token, password } = req.body;
    await this.userService.resetPassword(token, password);
    res.json({ success: true, message: "Password has been reset successfully" });
  };

  public updateUserAndEmployee = async (req: Request, res: Response) => {
    const { userId, updateUserAndEmployeeDto } = req.body;
    const updatedUser = await this.userService.updateUserAndEmployee(userId, updateUserAndEmployeeDto);
    res.json(updatedUser);
  };

  public logout = (req: Request, res: Response) => {
    req.logout(() => {
      res.json({ success: true });
    });
  };
}
