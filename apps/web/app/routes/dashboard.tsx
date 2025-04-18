import type { Route } from "./+types/dashboard";
import { useState } from "react";
import { useSubmit } from "react-router";
import { type SectionData } from "~/components/SectionDialog";
import DashboardSection from "~/components/DashboardSection";
import { redirect } from "react-router";
import Navbar from "~/components/Navbar";
import {
  getPrismaClient,
  getSections,
  getUser,
  type Section,
} from "~/lib/db.server";
import { destroySession, getSession } from "~/lib/session.server";
import {
  deleteSection,
  moveSectionDown,
  moveSectionUp,
  updateSection,
  createSection,
} from "~/lib/mutations";
import type { Pull } from "~/lib/pull";
import { useQueries } from "@tanstack/react-query";

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
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  if (userId === undefined) {
    return redirect("/login");
  }
  const prisma = getPrismaClient();
  const user = await getUser(prisma, userId);
  if (!user) {
    return redirect("/login", {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    });
  }
  const sections = await getSections(prisma, userId);
  return { sections };
}

function matches(pull: Pull, search?: string) {
  if (!search) {
    return true;
  }
  const normalizedTitle = pull.title.toLowerCase();
  const normalizedQuery = search.toLowerCase();
  const tokens = normalizedQuery
    .split(" ")
    .map((tok) => tok.trim())
    .filter((tok) => tok.length > 0);
  return tokens.every((tok) => normalizedTitle.indexOf(tok) > -1);
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { sections } = loaderData;
  const submit = useSubmit();
  const [search, setSearch] = useState("");

  const pulls = useQueries({
    queries: sections.map((section) => ({
      queryKey: ["pulls", section.search],
      queryFn: async () => {
        const params = new URLSearchParams({ q: section.search });
        const resp = await fetch(`/api/search?${params.toString()}`);
        const { pulls } = (await resp.json()) as { pulls: Pull[] };
        return pulls;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchInterval: 15 * 60 * 1000,
      refetchIntervalInBackground: true,
    })),
  });
  const refreshedAt = pulls
    ? Math.min(...pulls.map((v) => v.dataUpdatedAt))
    : null;

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
  const handleRefresh = async () => {
    Promise.all(pulls.map((v) => v.refetch())).catch(console.error);
  };

  return (
    <>
      <Navbar
        refreshedAt={refreshedAt}
        search={search}
        onSearch={setSearch}
        onCreateSection={handleCreate}
        onRefresh={handleRefresh}
        isFetching={pulls.some((v) => v.isFetching)}
      />
      {sections.map((section, idx) => (
        <DashboardSection
          key={idx}
          section={section}
          pulls={pulls[idx].data?.filter((pull) => matches(pull, search)) ?? []}
          isLoading={pulls[idx].isLoading}
          isFirst={idx === 0}
          isLast={idx === sections.length - 1}
          onChange={handleChange}
          onDelete={() => handleDelete(section)}
          onMoveUp={() => handleMoveUp(section)}
          onMoveDown={() => handleMoveDown(section)}
        />
      ))}
    </>
  );
}
