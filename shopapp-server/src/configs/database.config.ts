import { DataSource } from "typeorm";
import { configs } from "./configs";

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
        console.log("Database connected successfully!");
      } else {
        console.log("Database already connected!");
      }
    } catch (error) {
      console.error("Error connecting to the database:", error);
      process.exit(1);
    }
  }
}
