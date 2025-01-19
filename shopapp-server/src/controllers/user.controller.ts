import { Request, Response, Router } from "express";
import { UserService } from "../services/user.service";
import { METHOD_LOGIN, UserRole } from "../utils/constant";
import passport from "passport";
import { User } from "../models/user.model";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";

export class UserController {
  public router: Router;
  private userService: UserService;

  constructor() {
    this.router = Router();
    this.userService = new UserService();
  }

  // Tạo user với role
  public async register(req: Request, res: Response) {
    console.log(req.body);
    const { email, password, role, name, avatar, phoneNumber } = req.body;
    try {
      const userRole = role === UserRole.ADMIN ? UserRole.ADMIN : UserRole.USER;
      const user = await this.userService.register(
        email,
        password,
        userRole,
        name,
        avatar,
        phoneNumber
      );
      res.status(201).json({
        message: "User created successfully",
        statusCode: 200,
        data: {
          user,
        },
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // Lấy danh sách user theo role
  public async getUsersByRole(req: Request, res: Response) {
    const role = req.params.role as UserRole;
    try {
      const users = await this.userService.getUsersByRole(role);
      res.status(200).json({
        message: "List users by role",
        statusCode: 200,
        data: {
          users,
        },
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message, statusCode: 400 });
    }
  }

  // Verify OTP
  public async verifyOtp(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      const accessToken = await this.userService.verifyOtp(email, otp);
      res.status(200).json({
        message: "OTP verified",
        data: { accessToken },
        statusCode: 200,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // Login
  public async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const tokens = await this.userService.login(email, password);
      res.status(200).json({
        message: "Login successfully",
        data: { tokens },
        statusCode: 200,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message, statusCode: 400 });
    }
  }

  // Refresh token
  public async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const tokens = await this.userService.refreshToken(refreshToken);
      res.status(200).json({
        message: "Refresh token successfully",
        data: { tokens },
        statusCode: 200,
      });
    } catch (error: any) {
      res.status(401).json({ message: error.message, statusCode: 401 });
    }
  }

  // Forgot password
  public async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const otp = await this.userService.forgotPassword(email);
      res.status(200).json({
        message: "OTP sent to your email.",
        data: { otp },
        statusCode: 200,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message, statusCode: 400 });
    }
  }

  // Reset password
  public async resetPassword(req: Request, res: Response) {
    try {
      const { email, otp, newPassword } = req.body;
      await this.userService.resetPassword(email, otp, newPassword);
      res
        .status(200)
        .json({ message: "Password reset successfully.", statusCode: 200 });
    } catch (error: any) {
      res.status(400).json({ message: error.message, statusCode: 400 });
    }
  }

  // Google OAuth Callback
  public async googleCallback(req: Request, res: Response) {
    try {
      const user = req.user as User;
      const accessToken = generateAccessToken({
        id: user.id,
        name: user.name,
        role: UserRole.USER,
        method: METHOD_LOGIN.GOOGLE,
      });
      const refreshToken = generateRefreshToken({
        id: user.id,
        name: user.name,
        role: UserRole.USER,
        method: METHOD_LOGIN.GOOGLE,
      });

      res.status(200).json({
        data: { accessToken, refreshToken },
        statusCode: 200,
        message: "Login successfully",
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message, statusCode: 500 });
    }
  }
}
