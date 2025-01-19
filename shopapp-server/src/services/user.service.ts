import jwt from "jsonwebtoken";
import { Database } from "../configs/database.config";
import { User } from "../models/user.model";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { configs } from "../configs/configs";
import { METHOD_LOGIN, UserRole } from "../utils/constant";
import { sendEmail } from "../configs/email.config";

export class UserService {
  private userRepository = Database.getDbInstance().getRepository(User);
  private otpExpiryMinutes = 3;
  private auth: any;

  constructor() {
    const {
      env: { auth },
    } = configs;

    this.auth = auth;
  }

  // Lấy user theo Google ID
  public async getUserByGoogleId(googleId: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { googleId } });
  }

  // Lấy user theo ID
  public async getUserById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  // Tạo user mới với thông tin Google
  public async createGoogleUser(
    googleId: string,
    email: string,
    avatar?: string,
    role: UserRole = UserRole.USER
  ): Promise<User> {
    const newUser = this.userRepository.create({
      googleId,
      email,
      avatar,
      isVerified: true,
      role,
    });
    return await this.userRepository.save(newUser);
  }

  // Tạo OTP
  private generateOtp(): { code: string; expiresAt: Date } {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + this.otpExpiryMinutes * 60 * 1000);
    return { code, expiresAt };
  }

  // Đăng ký
  public async register(
    email: string,
    password: string,
    name?: string,
    avatar?: string,
    phoneNumber?: string,
    role: UserRole = UserRole.USER
  ): Promise<string> {
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) throw new Error("Email already registered.");

    const hashedPassword = await bcrypt.hash(password, 10);
    const { code, expiresAt } = this.generateOtp();

    const newUser = this.userRepository.create({
      email,
      password: hashedPassword,
      otpCode: code,
      otpExpiresAt: expiresAt,
      name: name || "",
      avatar: avatar || "",
      phoneNumber: phoneNumber || "",
      role,
    });

    await this.userRepository.save(newUser);

    await sendEmail(
      email,
      "Verify Your Account",
      `<p>Your verification code is: <strong>${code}</strong></p><p>This code will expire in 10 minutes.</p>`
    );
    return code;
  }

  public async getUsersByRole(role: UserRole): Promise<User[]> {
    return await this.userRepository.find({ where: { role } });
  }

  // Xác minh OTP
  public async verifyOtp(email: string, otp: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new Error("User not found.");

    if (!email || !otp) {
      throw new Error("Email and OTP are required.");
    }

    if (user.otpCode !== otp) {
      throw new Error("Invalid or expired OTP.");
    }
    if (user.otpExpiresAt! < new Date()) {
      throw new Error("OTP expired.");
    }

    user.isVerified = true;
    user.otpCode = null;
    user.otpExpiresAt = null;
    await this.userRepository.save(user);

    return generateAccessToken({
      id: user.id,
      name: user?.name,
      role: user?.role,
      method: METHOD_LOGIN.NORMAL,
    });
  }

  // Đăng nhập
  public async login(
    email: string,
    password: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new Error("User not found.");

    const isPasswordValid = await bcrypt.compare(password, user.password || "");
    if (!isPasswordValid) throw new Error("Password is incorrect.");

    const accessToken = generateAccessToken({
      id: user.id,
      name: user?.name,
      role: user?.role,
      method: METHOD_LOGIN.NORMAL,
    });
    const refreshToken = generateRefreshToken({
      id: user.id,
      name: user?.name,
      role: user?.role,
      method: METHOD_LOGIN.NORMAL,
    });

    user.refreshToken = refreshToken;
    await this.userRepository.save(user);

    return { accessToken, refreshToken };
  }

  // Refresh Token
  public async refreshToken(
    token: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: any = jwt.verify(token, this.auth.refreshSecret);

    const user = await this.userRepository.findOne({
      where: { id: payload.id, refreshToken: token },
    });
    if (!user) throw new Error("Invalid refresh token.");

    const accessToken = generateAccessToken({
      id: user.id,
      name: user?.name,
      role: user?.role,
      method: METHOD_LOGIN.NORMAL,
    });
    const newRefreshToken = generateRefreshToken({
      id: user.id,
      name: user?.name,
      role: user?.role,
      method: METHOD_LOGIN.NORMAL,
    });

    user.refreshToken = newRefreshToken;
    await this.userRepository.save(user);

    return { accessToken, refreshToken: newRefreshToken };
  }

  // Quên mật khẩu
  public async forgotPassword(email: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new Error("User not found.");

    const { code, expiresAt } = this.generateOtp();
    user.otpCode = code;
    user.otpExpiresAt = expiresAt;

    await this.userRepository.save(user);
    await sendEmail(
      email,
      "Forgot Password Code",
      `<p>Your OTP code is: <strong>${code}</strong></p><p>This code will expire in 10 minutes.</p>`
    );
    return code;
  }

  // Đặt lại mật khẩu
  public async resetPassword(
    email: string,
    otp: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new Error("User not found.");

    if (user.otpCode !== otp) {
      throw new Error("Invalid OTP.");
    }
    if (user.otpExpiresAt! < new Date()) {
      throw new Error("OTP expired.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.otpCode = null;
    user.otpExpiresAt = null;

    await this.userRepository.save(user);
  }
}
