import { type Pull } from "../../app/lib/pull";

export function mockPull(props?: Omit<Partial<Pull>, "uid" | "url">): Pull {
  const id = props?.id ?? "PR_1";
  const repo = props?.repo ?? "pvcnt/mergeable";
  const number = props?.number ?? 1;
  return {
    id,
    repo,
    number,
    title: "Pull request",
    description: "",
    state: "pending",
    ciState: "none",
    createdAt: "2024-08-05T15:57:00Z",
    updatedAt: "2024-08-05T15:57:00Z",
    url: `https://github.com/${repo}/${number}`,
    additions: 0,
    deletions: 0,
    author: {
      id: "u1",
      login: "test",
      name: "Test",
      avatarUrl: "",
      bot: false,
    },
    ...props,
  };
}
