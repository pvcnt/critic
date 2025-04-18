import { getGitHubClient } from "~/lib/github/client";
import type { Route } from "./+types/api.search";
import { getAccessToken } from "~/lib/crypto.server";
import { data } from "react-router";
import { getPrismaClient, getUser } from "~/lib/db.server";
import { getSession } from "~/lib/session.server";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  if (userId === undefined) {
    return data({ error: "unauthenticated" }, { status: 401 });
  }
  const prisma = getPrismaClient();
  const user = await getUser(prisma, userId);
  if (!user) {
    return data({ error: "unauthenticated" }, { status: 401 });
  }
  const accessToken = await getAccessToken(user);
  const github = getGitHubClient(accessToken);
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  if (!q) {
    return data({ error: "missing 'q' parameter" }, { status: 400 });
  }
  const pulls = await github.searchPulls(q);
  return { pulls };
}
