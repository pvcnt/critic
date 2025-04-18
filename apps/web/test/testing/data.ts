import {
  type Pull,
  type Section,
  type Connection,
  PullState,
  CiState,
} from "../../app/lib/pull";

export function mockPull(props?: Omit<Partial<Pull>, "uid" | "url">): Pull {
  const id = props?.id ?? "PR_1";
  const repo = props?.repo ?? "pvcnt/mergeable";
  const number = props?.number ?? 1;
  return {
    id,
    repo,
    number,
    title: "Pull request",
    state: PullState.Pending,
    ciState: CiState.None,
    createdAt: "2024-08-05T15:57:00Z",
    updatedAt: "2024-08-05T15:57:00Z",
    url: `https://github.com/${repo}/${number}`,
    additions: 0,
    deletions: 0,
    author: { name: "pvcnt", avatarUrl: "", bot: false },
    requestedReviewers: [],
    requestedTeams: [],
    reviews: [],
    sections: [],
    ...props,
  };
}

export function mockSection(props?: Partial<Section>): Section {
  return {
    id: "",
    label: "Section",
    search: "author:@me",
    position: 0,
    ...props,
  };
}

export function mockConnection(props?: Partial<Connection>): Connection {
  return {
    id: "",
    baseUrl: "https://api.github.com",
    auth: "ghp_xxx",
    ...props,
  };
}
