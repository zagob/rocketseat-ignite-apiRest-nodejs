import { FastifyInstance } from "fastify";
import crypto from "node:crypto";
import { z } from "zod";
import { Knex } from "../database";
import { checkSessionIdExists } from "../middlewares/checkSessionIdExists";

export async function transactionsRoutes(app: FastifyInstance) {
  // app.addHook("preHandler", async (request, reply) => {
  //   console.log(`[${request.method}] ${request.url}`);
  // });

  app.get(
    "/",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies;

      const transactions = await Knex("transactions")
        .where("session_id", sessionId)
        .select();

      return { transactions };
    }
  );

  app.get(
    "/:id",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = getTransactionParamsSchema.parse(request.params);

      const { sessionId } = request.cookies;

      const transaction = await Knex("transactions")
        .where({
          session_id: sessionId,
          id,
        })
        .first();

      return { transaction };
    }
  );

  app.get(
    "/summary",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies;

      const summary = await Knex("transactions")
        .sum("amount", { as: "amount" })
        .where("session_id", sessionId)
        .first();

      return { summary };
    }
  );

  app.post("/", async (request, reply) => {
    const createTRansactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });

    const { title, amount, type } = createTRansactionBodySchema.parse(
      request.body
    );

    let sessionId = request.cookies.sessionId;

    if (!sessionId) {
      sessionId = crypto.randomUUID();

      reply.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });
    }

    await Knex("transactions").insert({
      id: crypto.randomUUID(),
      title,
      amount: type === "credit" ? amount : amount * -1,
      session_id: sessionId,
    });

    return reply.status(201).send();
  });
}
