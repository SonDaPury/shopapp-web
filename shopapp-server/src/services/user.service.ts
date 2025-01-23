import jwt from "jsonwebtoken";
import { Database } from "../configs/database.config";
import { User } from "../models/user.model";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { configs } from "../configs/configs";
import { METHOD_LOGIN, UserRole } from "../utils/constant";
import { sendEmail } from "../configs/email.config";
import { messages } from "../utils/messages";
import { omit } from "lodash";
import { DateTime } from "luxon";
import { roundNumber } from "../utils/number";
import { isEnumValue } from "../utils/helper-function";
import { templateEmailSendCode } from "../utils/templates";
import { addEmailJob } from "../queues/email.queue";
import { addOtpCleanupJob } from "../queues/otp.queue";

export class UserService {
  private userRepository = Database.getDbInstance().getRepository(User);
  private otpExpiryMinutes = 1;
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

  // Resend OTP
  public async resendOtp(email: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new Error(messages.validation.users.userNotFound);

    if (user.isVerified) {
      throw new Error(messages.validation.users.userVerified);
    }

    const { code, expiresAt } = this.generateOtp();
    user.otpCode = code;
    user.otpExpiresAt = expiresAt;

    const now = DateTime.now();
    const expiresTime = DateTime.fromJSDate(expiresAt);
    const diffInMinutes = expiresTime.diff(now, "minutes").minutes;

    await addEmailJob(
      email,
      "Resend OTP Code",
      templateEmailSendCode(code, roundNumber(diffInMinutes), now, user.name!)
    );
    await addOtpCleanupJob(user.id, diffInMinutes);
    await this.userRepository.save(user);
    return code;
  }

  // Đăng ký
  public async register(
    email: string,
    password: string,
    role: string,
    name?: string,
    avatar?: string,
    phoneNumber?: string
  ): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser)
      throw new Error(messages.validation.users.emailAlreadyExists);
    if (!isEnumValue(UserRole, role)) {
      throw new Error(messages.validation.users.roleInvalid);
    }

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
      role: role as UserRole,
    });

    const userRes = omit(newUser, ["password", "googleId", "refreshToken"]);

    const now = DateTime.now();
    const expiresTime = DateTime.fromJSDate(expiresAt);
    const diffInMinutes = expiresTime.diff(now, "minutes").minutes;

    await addEmailJob(
      email,
      "Verify Your Account",
      templateEmailSendCode(
        code,
        roundNumber(diffInMinutes),
        now,
        newUser.name!
      )
    );
    await addOtpCleanupJob(newUser.id, diffInMinutes);
    await this.userRepository.save(newUser);

    return userRes;
  }

  public async getUsersByRole(role: UserRole): Promise<User[]> {
    return await this.userRepository.find({ where: { role } });
  }

  // Xác minh OTP
  public async verifyOtp(email: string, otp: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new Error(messages.validation.users.userNotFound);

    if (!email || !otp) {
      throw new Error(messages.validation.users.verifyValidations);
    }

    if (user.otpCode !== otp) {
      throw new Error(messages.validation.users.OTPInvalid);
    }
    if (user.otpExpiresAt! < new Date()) {
      throw new Error(messages.validation.users.OTPExpired);
    }
    console.log("user.otpExpiresAt: ", user.otpExpiresAt);
    console.log("date: ", new Date());

    user.isVerified = true;
    user.otpCode = null;
    user.otpExpiresAt = null;

    const userRes = omit(user, [
      "password",
      "googleId",
      "refreshToken",
      "otpCode",
      "otpExpiresAt",
    ]);

    await this.userRepository.save(user);

    return userRes;
  }

  // Đăng nhập
  public async login(
    email: string,
    password: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    console.log(user);
    if (!user) throw new Error(messages.validation.users.userNotFound);

    if (!user.isVerified) {
      throw new Error(messages.validation.users.userNotVerified);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || "");
    if (!isPasswordValid)
      throw new Error(messages.validation.users.passwordInvalid);

    const accessToken = generateAccessToken({
      id: user.id,
      name: user?.name,
      role: user?.role,
      method: METHOD_LOGIN.NORMAL,
    });
    const refreshToken = generateRefreshToken({
      id: user.id,
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
    if (!user) throw new Error(messages.validation.users.invalidRefreshToken);

    const accessToken = generateAccessToken({
      id: user.id,
      name: user?.name,
      role: user?.role,
      method: METHOD_LOGIN.NORMAL,
    });
    const newRefreshToken = generateRefreshToken({
      id: user.id,
      method: METHOD_LOGIN.NORMAL,
    });

    user.refreshToken = newRefreshToken;
    await this.userRepository.save(user);

    return { accessToken, refreshToken: newRefreshToken };
  }

  // Quên mật khẩu
  public async forgotPassword(email: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new Error(messages.validation.users.userNotFound);

    const { code, expiresAt } = this.generateOtp();
    user.otpCode = code;
    user.otpExpiresAt = expiresAt;

    const now = DateTime.now();
    const expiresTime = DateTime.fromJSDate(expiresAt);
    const diffInMinutes = expiresTime.diff(now, "minutes").minutes;

    await addEmailJob(
      email,
      "Forgot Password Code",
      templateEmailSendCode(code, roundNumber(diffInMinutes), now, user.name!)
    );
    await addOtpCleanupJob(user.id, diffInMinutes);
    await this.userRepository.save(user);

    return code;
  }

  // Đặt lại mật khẩu
  public async resetPassword(
    email: string,
    otp: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new Error(messages.validation.users.userNotFound);

    if (user.otpCode !== otp) {
      throw new Error(messages.validation.users.OTPInvalid);
    }
    if (user.otpExpiresAt! < new Date()) {
      throw new Error(messages.validation.users.OTPExpired);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.otpCode = null;
    user.otpExpiresAt = null;

    await this.userRepository.save(user);
  }

  // Update user
  public async updateUser(id: string, data: any): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new Error(messages.validation.users.userNotFound);

    const updatedUser = this.userRepository.merge(user, data);
    return await this.userRepository.save(updatedUser);
  }
}
