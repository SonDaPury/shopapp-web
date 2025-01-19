import { TokenIndexer } from "morgan";
import { configs } from "./configs";
import { Request, Response } from "express";

export const morganConfig = (
  tokens: TokenIndexer,
  req: Request,
  res: Response
) => {
  const status = tokens.status(req, res);
  const method = tokens.method(req, res);
  const url = tokens.url(req, res);
  const responseTime = tokens["response-time"](req, res);
  const message = `[${method}] ${url} ${status} - ${responseTime}ms`;

  if (Number(status) >= 500) {
    configs.logger.error(message);
  } else if (Number(status) >= 400) {
    configs.logger.warn(message);
  } else {
    configs.logger.info(message);
  }

  return null;
};
