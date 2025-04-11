import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { UserService } from "@/services/user.service";
import { googleConfig } from "@/config/google-oauth.config";
import { QueueService, QueueName, JobType } from "@/services/queue.service";
import { Roles } from "@/defaults/role";
import { UserStatus } from "@/entities/user.entity";
import { Logger } from "@/services/logger.service";

const userService = new UserService();
const queueService = QueueService.getInstance();
const logger = new Logger("AuthController");

passport.use(
  new GoogleStrategy(
    {
      clientID: googleConfig.google.clientId,
      clientSecret: googleConfig.google.clientSecret,
      callbackURL: googleConfig.google.callbackUrl,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0].value;

        // if (!email || !email.endsWith(googleConfig.allowedDomain)) {
        //   return done(null, false, { message: "Invalid email domain. Please use a @reallygreattech.com email address." });
        // }

        if (!email) {
          return done(null, false, { message: "Invalid email domain. Please use a @reallygreattech.com email address." });
        }

        let user = await userService.findByEmail(email);
        let isNewUser = false;

        if (!user) {
          isNewUser = true;
          // Generate username from email if displayName is not available
          const username = profile.displayName || email.split('@')[0];
          user = await userService.create({
            email,
            username,
            profileImage: profile.photos?.[0].value,
            role: { id: googleConfig.defaultRoleId },
            status: UserStatus.AWAITING
          });

          // Send notifications to HR for onboarding
          const hrUsers = await userService.findByRole(Roles.HR);
          for (const hrUser of hrUsers) {
            await queueService.addJob(
              QueueName.NOTIFICATIONS,
              JobType.NEW_USER_SIGNUP,
              {
                newUser: user,
                recipientId: hrUser.id
              }
            );
          }
        }

        return done(null, user);
      } catch (error) {
        logger.error("Error in Google OAuth strategy", { error });
        return done(error as Error);
      }
    },
  ),
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await userService.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});
