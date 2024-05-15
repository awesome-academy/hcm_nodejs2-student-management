import { join } from "path";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { DEFAULT_DB_PORT } from "../common/constants";
dotenv.config();

const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE } = process.env;

const port = DB_PORT ? parseInt(DB_PORT) : DEFAULT_DB_PORT;

export const AppDataSource = new DataSource({
  type: "mysql",
  host: DB_HOST,
  port: port,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  synchronize: true,
  logging: false,
  migrations: ['src/migration/**/*.ts'],
  entities: [join(__dirname, "../entities/*.entity.{ts, js}")],
});
