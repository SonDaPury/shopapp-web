import { Request, Response, NextFunction } from "express";
import { configs } from "../configs/configs";

export const LogUnhandledError = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { method, url, body } = req;

  configs.logger.error(
    `Error: ${err.message} - [${method}] ${url} - Body: ${JSON.stringify(body)}`
  );

  res.status(500).json({ error: "Internal Server Error" });
};
