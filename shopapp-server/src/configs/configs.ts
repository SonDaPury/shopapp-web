import { Database } from "./database.config";
import { envConfig } from "./env.config";
import logger from "./logger.config";
import { morganConfig } from "./morgan.config";

export const configs = {
  env: envConfig,
  logger,
  morganConfig,
};
