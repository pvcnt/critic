import { PrismaClient } from "@critic/prisma";
import { encryptSymmetric } from "./crypto.server";
import { env } from "./env.server";

const defaultSections = [
  {
    position: 0,
    label: "Incoming reviews",
    search:
      "is:open -author:@me review-requested:@me ; is:open -author:@me involves:@me",
  },
  {
    position: 1,
    label: "Outgoing reviews",
    search: "is:open author:@me draft:false",
  },
  {
    position: 2,
    label: "Draft reviews",
    search: "is:open author:@me draft:true",
  },
];

export async function moveSectionUp(
  prisma: PrismaClient,
  userId: number,
  sectionId: number,
) {
  const section = await prisma.section.findUnique({
    where: { userId, id: sectionId },
  });
  if (!section) {
    return;
  }
  const previousSection = await prisma.section.findFirst({
    where: { userId, position: section.position - 1 },
  });
  if (!previousSection) {
    return;
  }
  await prisma.$transaction([
    prisma.section.updateMany({
      where: { userId, id: section.id, position: section.position },
      data: { position: section.position - 1 },
    }),
    prisma.section.updateMany({
      where: {
        userId,
        id: previousSection.id,
        position: previousSection.position,
      },
      data: { position: section.position },
    }),
  ]);
}

export async function moveSectionDown(
  prisma: PrismaClient,
  userId: number,
  sectionId: number,
) {
  const section = await prisma.section.findUnique({
    where: { userId, id: sectionId },
  });
  if (!section) {
    return;
  }
  const nextSection = await prisma.section.findFirst({
    where: { userId, position: section.position + 1 },
  });
  if (!nextSection) {
    return;
  }
  await prisma.$transaction([
    prisma.section.updateMany({
      where: { userId, id: section.id, position: section.position },
      data: { position: section.position + 1 },
    }),
    prisma.section.updateMany({
      where: { userId, id: nextSection.id, position: nextSection.position },
      data: { position: section.position },
    }),
  ]);
}

export async function deleteSection(
  prisma: PrismaClient,
  userId: number,
  sectionId: number,
) {
  await prisma.section.delete({
    where: { userId, id: sectionId },
  });
}

export async function resetSections(prisma: PrismaClient, userId: number) {
  prisma.$transaction([
    prisma.section.deleteMany({ where: { userId } }),
    prisma.section.createMany({
      data: defaultSections.map((section) => ({ userId, ...section })),
    }),
  ]);
}

export async function updateSection(
  prisma: PrismaClient,
  userId: number,
  sectionId: number,
  data: { search: string; label: string },
) {
  await prisma.section.update({
    where: { userId, id: sectionId },
    data,
  });
}

export async function createSection(
  prisma: PrismaClient,
  userId: number,
  data: { search: string; label: string; position: number },
) {
  await prisma.section.create({
    data: { userId, ...data },
  });
}

export async function upsertUser(
  prisma: PrismaClient,
  externalId: string,
  data: {
    login: string;
    name: string | null;
    avatarUrl: string | null;
    accessToken: string;
  },
) {
  const { ciphertext, iv } = await encryptSymmetric(
    data.accessToken,
    env.CRYPTO_KEY || "",
  );
  const secureData = { ...data, accessToken: ciphertext, iv };
  return await prisma.user.upsert({
    where: { externalId },
    create: {
      ...secureData,
      externalId,
      sections: {
        create: defaultSections,
      },
    },
    update: secureData,
  });
}
