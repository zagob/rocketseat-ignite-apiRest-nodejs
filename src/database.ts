import { knex as setupKnex, Knex as KnexProps } from "knex";
import { env } from "./env";

export const config: KnexProps.Config = {
  client: env.DATABASE_CLIENT,
  connection:
    env.DATABASE_CLIENT === "sqlite"
      ? {
          filename: env.DATABASE_URL,
        }
      : env.DATABASE_URL,
  useNullAsDefault: true,
  migrations: {
    extension: "ts",
    directory: "./database/migrations",
  },
};

export const Knex = setupKnex(config);
