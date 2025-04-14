import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@critic/prisma";
import ws from "ws";
import { env } from "./env.server";

declare namespace globalThis {
  let prisma: PrismaClient | undefined;
}

export function getPrismaClient(): PrismaClient {
  if (globalThis.prisma) {
    return globalThis.prisma;
  }
  neonConfig.webSocketConstructor = ws;
  neonConfig.poolQueryViaFetch = true;
  const connectionString = `${env.DATABASE_URL}`;
  const adapter = new PrismaNeon({ connectionString });
  const prisma = new PrismaClient({ adapter });
  if (env.NODE_ENV === "development") {
    globalThis.prisma = prisma;
  }
  return prisma;
}

export type { User, Section } from "@critic/prisma";
