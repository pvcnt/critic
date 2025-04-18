import { test, expect } from "vitest";
import { HttpGitHubClient } from "../../../app/lib/github/client";
import { mockConnection } from "../../testing/data";
import { useRecording } from "./polly";
import { CiState, PullState } from "../../../app/lib/pull";

useRecording();

test("should return user", async () => {
  const connection = mockConnection({ auth: "ghp_token" });
  const client = new HttpGitHubClient(connection);

  const user = await client.getUser();

  expect(user).toEqual({
    name: "pvcnt",
    avatarUrl: "https://avatars.githubusercontent.com/u/944506?v=4",
    bot: false,
  });
});

test("should search pulls", async () => {
  const connection = mockConnection({ auth: "ghp_token" });
  const client = new HttpGitHubClient(connection);

  const pulls = await client.searchPulls(
    "repo:netflix/dispatch Database Connection Decorators Signal Processing Improvements in:title",
  );

  expect(pulls).toEqual([
    {
      id: "PR_kwDODkeKwM6M3P7g",
      repo: "Netflix/dispatch",
      number: 5790,
      title:
        "Database Connection, Decorators, and Signal Processing Improvements",
      state: PullState.Merged,
      ciState: CiState.Success,
      comments: 1,
      createdAt: "2025-02-27T22:17:29Z",
      updatedAt: "2025-02-28T01:05:46Z",
      url: "https://github.com/Netflix/dispatch/pull/5790",
      additions: 168,
      deletions: 87,
      author: {
        name: "mvilanova",
        avatarUrl:
          "https://avatars.githubusercontent.com/u/39573146?u=f3825b8f4bad2607ee35142ede481d3282f0ea8b&v=4",
        bot: false,
      },
      requestedReviewers: [],
      requestedTeams: [],
      reviews: [
        {
          author: {
            name: "wssheldon",
            avatarUrl:
              "https://avatars.githubusercontent.com/u/114631109?u=9e7df6d7db714de8332e9c9f21d72580f065bfed&v=4",
            bot: false,
          },
          createdAt: new Date("2025-02-27T22:30:41.000Z"),
          lgtm: true,
        },
      ],
    },
  ]);
});
