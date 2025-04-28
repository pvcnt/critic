import { test, expect } from "vitest";
import { HttpGitHubClient } from "../../../app/lib/github/client";
import { useRecording } from "./polly";

useRecording();

const auth = "ghp_token";

test("should return user", async () => {
  const client = new HttpGitHubClient({ auth });

  const user = await client.getUser();

  expect(user).toEqual({
    id: "MDQ6VXNlcjk0NDUwNg==",
    login: "pvcnt",
    name: "Vincent Primault",
    avatarUrl: "https://avatars.githubusercontent.com/u/944506?v=4",
    bot: false,
  });
});

test("should search pulls", async () => {
  const client = new HttpGitHubClient({ auth });

  const pulls = await client.searchPulls(
    "repo:netflix/dispatch Database Connection Decorators Signal Processing Improvements in:title",
    5,
  );

  expect(pulls).toEqual([
    {
      id: "PR_kwDODkeKwM6M3P7g",
      repo: "Netflix/dispatch",
      number: 5790,
      title:
        "Database Connection, Decorators, and Signal Processing Improvements",
      state: "merged",
      ciState: "success",
      createdAt: "2025-02-27T22:17:29Z",
      updatedAt: "2025-02-28T01:05:46Z",
      url: "https://github.com/Netflix/dispatch/pull/5790",
      additions: 168,
      deletions: 87,
      author: {
        id: "MDQ6VXNlcjM5NTczMTQ2",
        login: "mvilanova",
        name: "Marc Vilanova",
        avatarUrl:
          "https://avatars.githubusercontent.com/u/39573146?u=f3825b8f4bad2607ee35142ede481d3282f0ea8b&v=4",
        bot: false,
      },
    },
  ]);
});
