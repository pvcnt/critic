import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Prisma, PrismaClient, type Section } from "@critic/prisma";
import ws from "ws";
import { env } from "./env.server";
import { PullSchema, type Pull } from "./pull";

declare namespace globalThis {
  let prisma: PrismaClient | undefined;
}

// TODO: ensure there is a single instance even in production.
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

export type { User, Section, PullData } from "@critic/prisma";

export async function getUser(prisma: PrismaClient, userId: number) {
  return await prisma.user.findUnique({
    where: { id: userId },
  });
}

export async function getPulls(prisma: PrismaClient, userId: number) {
  const rows = await prisma.section.findMany({
    where: { userId },
    orderBy: {
      position: "asc",
    },
    include: {
      pulls: {
        orderBy: {
          updatedAt: "desc",
        },
      },
    },
  });
  const sections = rows.map((row) => row as Section);
  const pulls = rows.map((row) =>
    row.pulls.map((pull) => PullSchema.parse(pull.data)),
  );
  // Use the smallest refreshedAt date from all pulls.
  const refreshedAt =
    rows
      .flatMap((row) => row.pulls)
      .map((pull) => pull.refreshedAt)
      .sort((a, b) => a.getTime() - b.getTime())
      .at(0) ?? null;
  return { sections, pulls, refreshedAt };
}

export async function savePulls(
  prisma: PrismaClient,
  sectionId: number,
  pulls: Pull[],
) {
  prisma.$transaction(
    pulls
      .map<Prisma.PrismaPromise<any>>((pull) => {
        const data = {
          repo: pull.repo,
          number: pull.number,
          createdAt: pull.createdAt,
          updatedAt: pull.updatedAt,
          refreshedAt: new Date(),
          data: pull,
        };
        return prisma.pullData.upsert({
          where: { externalId: pull.id },
          create: { externalId: pull.id, ...data },
          update: data,
        });
      })
      .concat([
        prisma.section.update({
          where: { id: sectionId },
          data: {
            pulls: {
              set: [],
            },
          },
        }),
        prisma.section.update({
          where: { id: sectionId },
          data: {
            pulls: {
              connect: pulls.map((pull) => ({ externalId: pull.id })),
            },
          },
        }),
      ]),
  );
}
