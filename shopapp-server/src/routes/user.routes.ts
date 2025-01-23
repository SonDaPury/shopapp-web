import { NextFunction, Request, Response, Router } from "express";
import { UserController } from "../controllers/user.controller";
import passport from "passport";
import { validateSchema } from "../middlewares/validateSchema.middleware";
import {
  forgotPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
  verifyOptSchema,
} from "../schemas/users";

const router = Router();
const userController = new UserController();

router.get("/role/:role", userController.getUsersByRole.bind(userController));
router.post(
  "/register",
  (req: Request, res: Response, next: NextFunction) =>
    validateSchema(req, res, next, registerSchema),
  userController.register.bind(userController)
);
router.post(
  "/resend-otp",
  (req: Request, res: Response, next: NextFunction) =>
    validateSchema(req, res, next, forgotPasswordSchema),
  userController.resendOtp.bind(userController)
);
router.post(
  "/verify-otp",
  (req: Request, res: Response, next: NextFunction) =>
    validateSchema(req, res, next, verifyOptSchema),
  userController.verifyOtp.bind(userController)
);
router.post(
  "/login",
  (req: Request, res: Response, next: NextFunction) =>
    validateSchema(req, res, next, loginSchema),
  userController.login.bind(userController)
);
router.post(
  "/refresh",
  (req: Request, res: Response, next: NextFunction) =>
    validateSchema(req, res, next, refreshTokenSchema),
  userController.refreshToken.bind(userController)
);
router.post(
  "/forgot-password",
  (req: Request, res: Response, next: NextFunction) =>
    validateSchema(req, res, next, forgotPasswordSchema),
  userController.forgotPassword.bind(userController)
);
router.post(
  "/reset-password",
  (req: Request, res: Response, next: NextFunction) =>
    validateSchema(req, res, next, resetPasswordSchema),
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
