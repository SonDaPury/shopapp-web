import jwt from "jsonwebtoken";
import { configs } from "../configs/configs";

const {
  env: { auth },
} = configs;

const generateAccessToken = (payload: object): string => {
  return jwt.sign(payload, auth.jwtSecret, {
    expiresIn: auth.jwtExpire,
  });
};

const generateRefreshToken = (payload: object): string => {
  return jwt.sign(payload, auth.refreshSecret, {
    expiresIn: auth.refreshExpire,
  });
};

const verifyAccessToken = (token: string): object | string => {
  return jwt.verify(token, auth.jwtSecret);
};

const verifyRefreshToken = (token: string): object | string => {
  return jwt.verify(token, auth.refreshSecret);
};

export {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
