import express, { Application, NextFunction, Request, Response } from "express";
import { configs } from "./configs/configs";
import morgan from "morgan";
import { LogUnhandledError } from "./middlewares/LogUnhandledError";

import router from "./routes";
import "reflect-metadata";
import { Database } from "./configs/database.config";
import passport from "passport";
import { connectRedis } from "./configs/redis.config";
import { log } from "./configs/logger.config";
import { initQueues } from "./queues";
import "./configs/google.config";

export class App {
  public app: Application;

  constructor() {
    this.app = express();

    this.initializeMiddlewares();
    this.initializeDatabase();
    this.initializeService();
    this.initializeRoutes();
  }

  // Middleware
  private initializeMiddlewares() {
    this.app.use(
      morgan((tokens: any, req: Request, res: Response) =>
        configs.morganConfig(tokens, req, res)
      )
    ); // Log http request
    this.app.use(
      (err: Error, req: Request, res: Response, next: NextFunction) =>
        LogUnhandledError(err, req, res, next)
    ); // Log unhandled error
    this.app.use(express.json());
    this.app.use(passport.initialize()); // Initialize passport
  }

  // Connect to database
  private async initializeDatabase() {
    await Database.connect();
  }

  // Initialize Routes
  private initializeRoutes() {
    this.app.use("/api", router);
  }

  // Initialize service
  private async initializeService() {
    await connectRedis();
    await initQueues();
  }

  // KInitialize server
  public listen() {
    this.app.listen(configs.env.port, () => {
      log.info(
        `Server is running on host: http://localhost:${configs.env.port}`
      );
    });
  }
}
