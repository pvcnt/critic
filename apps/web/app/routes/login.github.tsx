import type { Route } from "./+types/login.github";
import { redirect } from "react-router";
import { v4 as uuidv4 } from "uuid";
import { getPrismaClient } from "~/lib/db.server";
import { getGitHubClient, HttpGitHubClient } from "~/lib/github/client";
import { upsertUser } from "~/lib/mutations";
import { commitSession, getSession } from "~/lib/session.server";
import { env } from "~/lib/env.server";
import { z } from "zod";

const AccessTokenSchema = z.object({
  access_token: z.string().optional(),
  error: z.string().optional(),
  error_description: z.string().optional(),
});

async function getAccessToken(code: string) {
  const body = new URLSearchParams();
  body.set("client_id", env.GITHUB_CLIENT_ID);
  body.set("client_secret", env.GITHUB_CLIENT_SECRET);
  body.set("code", code);
  // TODO: body.set('redirect_uri', "");
  const resp = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body,
  });
  return AccessTokenSchema.parse(await resp.json());
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  if (session.has("userId")) {
    return redirect("/dashboard");
  }

  const url = new URL(request.url);
  if (url.searchParams.has("code")) {
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    if (!code || !state || state !== session.get("authState")) {
      return redirect("/login/github");
    }
    const resp = await getAccessToken(code);
    if (!resp.access_token) {
      session.flash("error", resp.error_description || "Unknown error");
      return redirect("/login/github", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    const client = getGitHubClient(resp.access_token);
    const ghUser = await client.getUser();

    const prisma = getPrismaClient();
    const user = await upsertUser(prisma, `github:${ghUser.id}`, {
      login: ghUser.login,
      name: ghUser.name,
      avatarUrl: ghUser.avatarUrl,
      accessToken: resp.access_token,
    });

    session.set("userId", user.id);
    session.set("login", user.login);

    return redirect("/dashboard", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  const state = uuidv4();
  session.set("authState", state);

  const params = new URLSearchParams({
    client_id: `${env.GITHUB_CLIENT_ID}`,
    redirect_uri: `${url.origin}/login/github`,
    scope: "repo,read:org,read:user",
    state,
  });
  return redirect(
    "https://github.com/login/oauth/authorize?" + params.toString(),
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    },
  );
}
