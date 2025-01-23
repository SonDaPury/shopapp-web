import { DataSource } from "typeorm";
import { configs } from "./configs";
import logger, { log } from "./logger.config";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: configs.env.db.username,
  password: configs.env.db.password,
  database: configs.env.db.dbName,
  logging: true,
  synchronize: false,
  entities: [__dirname + "/../models/*.ts"],
  migrations: [__dirname + "/../migrations/*.ts"],
  migrationsTableName: "migrations",
});

export class Database {
  private static dbInstance: DataSource;

  public static getDbInstance(): DataSource {
    if (!this.dbInstance) {
      this.dbInstance = AppDataSource;
    }
    return this.dbInstance;
  }

  public static async connect(): Promise<void> {
    try {
      const dataSource = this.getDbInstance();
      if (!dataSource.isInitialized) {
        await dataSource.initialize();
        log.info("Database connected successfully!");
      } else {
        log.info("Database already connected!");
      }
    } catch (error) {
      log.error("Error connecting to the database:", error);
      logger.error("Error connecting to the database:", error);
      process.exit(1);
    }
  }
}
