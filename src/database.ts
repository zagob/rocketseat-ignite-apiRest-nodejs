import { knex as setupKnex, Knex as KnexProps } from "knex";
import { env } from "./env";

export const config: KnexProps.Config = {
  client: "sqlite",
  connection: {
    filename: env.DATABASE_URL,
  },
  useNullAsDefault: true,
  migrations: {
    extension: "ts",
    directory: "./database/migrations",
  },
};

export const Knex = setupKnex(config);
