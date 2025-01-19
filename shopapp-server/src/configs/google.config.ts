import passport from "passport";
import { UserService } from "../services/user.service";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model";
import { configs } from "./configs";

const userService = new UserService();

passport.use(
  new GoogleStrategy(
    {
      clientID: configs.env.auth.googleClientId,
      clientSecret: configs.env.auth.googleClientSecret,
      callbackURL: "/api/users/google-login/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await userService.getUserByGoogleId(profile.id);

        if (!user) {
          user = await userService.createGoogleUser(
            profile.id,
            profile.emails?.[0]?.value || "",
            profile.photos?.[0]?.value || ""
          );
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Serialize user ID vào session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user ID từ session
passport.deserializeUser(async (id: string, done) => {
  const user = await userService.getUserById(id);
  done(null, user);
});
