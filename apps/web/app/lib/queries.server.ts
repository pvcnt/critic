import { PrismaClient } from "@critic/prisma";

export async function getSections(prisma: PrismaClient, userId: number) {
  return await prisma.section.findMany({
    where: { userId },
    orderBy: {
      position: "asc",
    },
  });
}
