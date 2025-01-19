import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { UserRole } from "../utils/constant";
import { configs } from "../configs/configs";

export const checkRole = (requiredRole: UserRole) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const decoded: any = jwt.verify(token, configs.env.auth.jwtSecret);
      if (decoded.role !== requiredRole) {
        return res.status(403).json({ message: "Permission denied" });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
};

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Token not provided", statusCode: 401 });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, configs.env.auth.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Invalid token", statusCode: 401 });
  }
};
