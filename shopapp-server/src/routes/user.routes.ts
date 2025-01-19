import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import passport from "passport";

const router = Router();
const userController = new UserController();

router.get("/role/:role", userController.getUsersByRole.bind(userController));
router.post("/register", userController.register.bind(userController));
router.post("/verify-otp", userController.verifyOtp.bind(userController));
router.post("/login", userController.login.bind(userController));
router.post("/refresh", userController.refreshToken.bind(userController));
router.post(
  "/forgot-password",
  userController.forgotPassword.bind(userController)
);
router.post(
  "/reset-password",
  userController.resetPassword.bind(userController)
);

// Google OAuth Routes
router.get(
  "/google-login",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google-login/callback",
  passport.authenticate("google", { session: false }),
  userController.googleCallback.bind(userController)
);

export default router;
