import { join } from "path";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { DEFAULT_DB_PORT } from "../common/constants";
dotenv.config();

const {
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_DATABASE,
  DB_TEST_DATABASE,
} = process.env;

const port = DB_PORT ? parseInt(DB_PORT) : DEFAULT_DB_PORT;

const database =
  process.env.NODE_ENV === "test" ? DB_TEST_DATABASE : DB_DATABASE;

export const AppDataSource = new DataSource({
  type: "mysql",
  host: DB_HOST,
  port: port,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: database,
  synchronize: true,
  logging: false,
  migrations: ["src/migration/**/*.ts"],
  entities: [join(__dirname, "../entities/*.entity.{ts, js}")],
});
