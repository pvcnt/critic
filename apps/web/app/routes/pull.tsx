import type { Route } from "./+types/pull";
import gitDiffParser from "gitdiff-parser";
import classes from "./pull.module.scss";
import { destroySession, getSession } from "~/lib/session.server";
import { redirect } from "react-router";
import { getAccessToken } from "~/lib/crypto.server";
import { getGitHubClient } from "~/lib/github/client";
import { getPrismaClient, getUser } from "~/lib/db.server";
import { H1 } from "@blueprintjs/core";
import { DiffViewer } from "~/components/DiffViewer";
import { env } from "~/lib/env.server";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Critic" }];
}

export async function loader({ request, params }: Route.LoaderArgs) {
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

  const { owner, name, number } = params;

  const accessToken = await getAccessToken(user, env.CRYPTO_KEY);
  const github = getGitHubClient(accessToken);
  const [pull, rawDiff] = await Promise.all([
    await github.getPull(`${owner}/${name}`, parseInt(number)),
    await github.getDiff(`${owner}/${name}`, parseInt(number)),
  ]);
  const diff = rawDiff ? gitDiffParser.parse(rawDiff) : null;
  return { pull, diff };
}

export default function Pull({ loaderData }: Route.ComponentProps) {
  const { pull, diff } = loaderData;
  if (!pull || !diff) {
    return <div>Pull request not found</div>;
  }
  return (
    <div className={classes.container}>
      <H1>{pull.title}</H1>
      <div>{pull.description}</div>
      <DiffViewer diff={diff} />
    </div>
  );
}
