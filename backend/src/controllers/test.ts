import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { UserService } from "@/services/user.service";
import { EmployeeService } from "@/services/employee.service";
import { googleConfig } from "@/config/google-oauth.config";

const userService = new UserService();
const employeeService = new EmployeeService();

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

        if (!email || !email.endsWith(googleConfig.allowedDomain)) {
          return done(null, false, { message: "Invalid email domain" });
        }

        let user = await userService.findByEmail(email);

        if (!user) {
          user = await userService.create({
            email,
            username: profile.displayName,
            profileImage: profile.photos?.[0].value,
            role_id: googleConfig.defaultRoleId,
          });

          await employeeService.create({
            userId: user.id,
            firstName: profile.name?.givenName || profile.displayName.split(" ")[0],
            lastName: profile.name?.familyName || profile.displayName.split(" ").slice(1).join(" "),
          });
        }

        const employee = await employeeService.findByUserId(user.id);

        const userData = {
          ...user,
          employee,
        };

        return done(null, userData);
      } catch (error) {
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
    if (user) {
      const employee = await employeeService.findByUserId(id);
      const userData = { ...user, employee };
      done(null, userData);
    } else {
      done(null, null);
    }
  } catch (error) {
    done(error);
  }
});

export default passport;
