import type { Route } from "./+types/dashboard";
import { useState } from "react";
import { useSubmit } from "react-router";
import { type SectionData } from "~/components/SectionDialog";
import DashboardSection from "~/components/DashboardSection";
import { redirect } from "react-router";
import Navbar from "~/components/Navbar";
import { getPrismaClient, type Section } from "~/lib/db.server";
import { getGitHubClient } from "~/lib/github/client";
import { destroySession, getSession } from "~/lib/session.server";
import {
  deleteSection,
  moveSectionDown,
  moveSectionUp,
  updateSection,
  createSection,
} from "~/lib/mutations";
import { decryptSymmetric } from "~/lib/crypto.server";
import { env } from "~/lib/env.server";
import { getSections } from "~/lib/queries.server";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Critic - Dashboard" }];
}

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  if (userId === undefined) {
    return;
  }

  const formData = await request.formData();
  const getString = (key: string) => {
    const value = formData.get(key);
    return value === null ? null : value.toString();
  };

  const prisma = getPrismaClient();
  const action = formData.get("action");
  if (action === "up") {
    const sectionId = getString("sectionId");
    if (sectionId !== null) {
      await moveSectionUp(prisma, userId, parseInt(sectionId));
    }
  } else if (action === "down") {
    const sectionId = getString("sectionId");
    if (sectionId !== null) {
      await moveSectionDown(prisma, userId, parseInt(sectionId));
    }
  } else if (action === "delete") {
    const sectionId = getString("sectionId");
    if (sectionId !== null) {
      await deleteSection(prisma, userId, parseInt(sectionId));
    }
  } else if (action === "update") {
    const sectionId = getString("sectionId");
    const search = getString("search");
    const label = getString("label");
    if (sectionId !== null && search !== null && label !== null) {
      await updateSection(prisma, userId, parseInt(sectionId), {
        search,
        label,
      });
    }
  } else if (action === "create") {
    const search = getString("search");
    const label = getString("label");
    const position = getString("position");
    if (search !== null && label !== null && position !== null) {
      await createSection(prisma, userId, {
        search,
        label,
        position: parseInt(position),
      });
    }
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  // TODO: cache pulls (too slow).
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  if (userId === undefined) {
    return redirect("/login");
  }
  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    return redirect("/login", {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    });
  }
  const sections = await getSections(prisma, userId);
  const accessToken = await decryptSymmetric(
    user.accessToken,
    user.iv,
    env.CRYPTO_KEY,
  );
  const github = getGitHubClient(accessToken);
  const pulls = sections.map((section) => github.searchPulls(section.search));
  // TODO: refreshedAt
  return { sections, pulls, refreshedAt: new Date() };
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { sections, pulls, refreshedAt } = loaderData;
  const submit = useSubmit();
  const [search, setSearch] = useState("");

  const handleCreate = async (value: SectionData) => {
    await submit(
      {
        action: "create",
        label: value.label,
        search: value.search,
        position: sections.length,
      },
      { method: "post" },
    );
  };
  const handleChange = async (value: Section) => {
    await submit(
      {
        action: "update",
        sectionId: value.id,
        label: value.label,
        search: value.search,
      },
      { method: "post" },
    );
  };
  const handleDelete = async (value: Section) => {
    await submit({ action: "delete", sectionId: value.id }, { method: "post" });
  };
  const handleMoveUp = async (value: Section) => {
    await submit({ action: "up", sectionId: value.id }, { method: "post" });
  };
  const handleMoveDown = async (value: Section) => {
    await submit({ action: "down", sectionId: value.id }, { method: "post" });
  };

  return (
    <>
      <Navbar
        refreshedAt={refreshedAt}
        search={search}
        onSearch={setSearch}
        onCreateSection={handleCreate}
      />
      {sections.map((section, idx) => {
        return (
          <DashboardSection
            key={idx}
            section={section}
            search={search}
            pulls={pulls[idx]}
            isFirst={idx === 0}
            isLast={idx === sections.length - 1}
            onChange={handleChange}
            onDelete={() => handleDelete(section)}
            onMoveUp={() => handleMoveUp(section)}
            onMoveDown={() => handleMoveDown(section)}
          />
        );
      })}
    </>
  );
}
