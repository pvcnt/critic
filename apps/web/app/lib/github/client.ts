import { Octokit } from "octokit";
import { throttling } from "@octokit/plugin-throttling";
import { type Pull, type User, type Team } from "~/lib/pull";
import { prepareQuery } from "./search";

const MyOctokit = Octokit.plugin(throttling);

export interface GitHubClient {
  getUser(): Promise<User>;
  getTeams(): Promise<Team[]>;
  searchPulls(search: string, limit: number): Promise<Pull[]>;
  getPull(repo: string, number: number): Promise<Pull | null>;
  getDiff(repo: string, number: number): Promise<string | null>;
}

type GHPull = {
  id: string;
  number: number;
  title: string;
  body: string;
  repository: {
    nameWithOwner: string;
  };
  author: GHUser;
  createdAt: string;
  updatedAt: string;
  url: string;
  additions: number;
  deletions: number;
  isDraft: boolean;
  merged: boolean;
  closed: boolean;
  reviewDecision: "CHANGES_REQUESTED" | "APPROVED" | "REVIEW_REQUIRED" | null;
  statusCheckRollup: {
    state: "EXPECTED" | "ERROR" | "FAILURE" | "PENDING" | "SUCCESS";
  } | null;
};

type GHUser = {
  __typename:
    | "Bot"
    | "EnterpriseUserAccount"
    | "Mannequin"
    | "Organization"
    | "User";
  id: string;
  login: string;
  name?: string;
  avatarUrl?: string;
};

export function getGitHubClient(auth: string): GitHubClient {
  return new HttpGitHubClient({ auth });
}

export class HttpGitHubClient implements GitHubClient {
  private readonly octokit: Octokit;

  constructor({ auth, baseUrl }: { auth: string; baseUrl?: string }) {
    this.octokit = new MyOctokit({
      auth,
      baseUrl,
      throttle: {
        // For now, allow retries in all situations.
        onRateLimit: (retryAfter, options, octokit, retryCount) => {
          octokit.log.warn(
            `Request quota exhausted for request ${options.method} ${options.url}, retrying after ${retryAfter} seconds`,
          );
          return true;
        },
        onSecondaryRateLimit: (retryAfter, options, octokit) => {
          octokit.log.warn(
            `Secondary rate limit detected for request ${options.method} ${options.url}, retrying after ${retryAfter} seconds`,
          );
          return true;
        },
      },
    });
  }

  async getUser(): Promise<User> {
    const resp = await this.octokit.rest.users.getAuthenticated();
    return {
      id: resp.data.node_id,
      login: resp.data.login,
      name: resp.data.name,
      avatarUrl: resp.data.avatar_url,
      bot: false,
    };
  }

  async getTeams(): Promise<Team[]> {
    const resp = await this.octokit.paginate("GET /user/teams", {
      per_page: 100,
    });
    return resp.map((obj) => ({
      id: obj.node_id,
      name: obj.name,
      slug: `${obj.organization.login}/${obj.slug}`,
    }));
  }

  async searchPulls(search: string, limit: number): Promise<Pull[]> {
    const query = `query dashboard($search: String!, $limit: Int!) {
      search(query: $search, type: ISSUE, first: $limit) {
        issueCount
        edges {
          node {
            ... on PullRequest {
              id
              number
              title
              body
              author {
                __typename
                ... on Bot {
                  id
                  login
                  avatarUrl
                }
                ... on Mannequin {
                  id
                  login
                  avatarUrl
                }
                ... on User {
                  id
                  login
                  name
                  avatarUrl
                }
              }
              statusCheckRollup {
                state
              }
              repository {
                nameWithOwner
              }
              createdAt
              updatedAt
              state
              url
              isDraft
              closed
              merged
              reviewDecision
              additions
              deletions
            }
          }
        }
      }
      rateLimit {
        cost
      }
    }`;
    type Data = {
      search: {
        issueCount: number;
        edges: { node: GHPull }[];
      };
      rateLimit: {
        cost: number;
      };
    };
    const q = prepareQuery(search);
    const data = await this.octokit.graphql<Data>(query, {
      search: q.toString(),
      limit,
    });
    return data.search.edges
      .map((edge) => edge.node)
      .map((pull) => this.makePull(pull));
  }

  async getPull(repo: string, number: number): Promise<Pull | null> {
    const query = `query pull($owner: String!, $name: String!, $number: Int!) {
      repository(owner: $owner, name: $name) {
        pullRequest(number: $number) {
          id
          number
          title
          body
          author {
            __typename
            ... on Bot {
              id
              login
              avatarUrl
            }
            ... on Mannequin {
              id
              login
              avatarUrl
            }
            ... on User {
              id
              login
              name
              avatarUrl
            }
          }
          statusCheckRollup {
            state
          }
          repository {
            nameWithOwner
          }
          createdAt
          updatedAt
          state
          url
          isDraft
          closed
          merged
          reviewDecision
          additions
          deletions
        }
      }
      rateLimit {
        cost
      }
    }`;
    type Data = {
      repository: {
        pullRequest: GHPull | null;
      };
      rateLimit: {
        cost: number;
      };
    };
    const [owner, name] = repo.split("/");
    const data = await this.octokit.graphql<Data>(query, {
      owner,
      name,
      number,
    });
    if (data.repository.pullRequest === null) {
      return null;
    }
    return this.makePull(data.repository.pullRequest);
  }

  async getDiff(repo: string, number: number): Promise<string | null> {
    const [owner, name] = repo.split("/");
    const resp = await this.octokit.rest.pulls.get({
      owner,
      repo: name,
      pull_number: number,
      mediaType: {
        format: "diff",
      },
    });
    if (resp.status != 200) {
      return null;
    }
    return resp.data as unknown as string;
  }

  private makePull(pull: GHPull): Pull {
    return {
      id: pull.id,
      repo: pull.repository.nameWithOwner,
      number: pull.number,
      title: pull.title,
      description: pull.body,
      state: pull.isDraft
        ? "draft"
        : pull.merged
          ? "merged"
          : pull.closed
            ? "closed"
            : pull.reviewDecision == "APPROVED"
              ? "approved"
              : "pending",
      ciState:
        pull.statusCheckRollup?.state == "ERROR"
          ? "error"
          : pull.statusCheckRollup?.state == "FAILURE"
            ? "failure"
            : pull.statusCheckRollup?.state == "SUCCESS"
              ? "success"
              : // Do not differentiate between "Pending" and "Expected".
                pull.statusCheckRollup?.state == "PENDING"
                ? "pending"
                : pull.statusCheckRollup?.state == "EXPECTED"
                  ? "pending"
                  : pull.statusCheckRollup?.state == "EXPECTED"
                    ? "pending"
                    : "none",
      createdAt: pull.createdAt,
      updatedAt: pull.updatedAt,
      url: pull.url,
      additions: pull.additions,
      deletions: pull.deletions,
      author: this.makeUser(pull.author),
    };
  }

  private makeUser(user: GHUser): User {
    return {
      id: user.id,
      login: user.login,
      name: user.name ?? null,
      avatarUrl: user.avatarUrl ?? null,
      bot: user.__typename === "Bot",
    };
  }
}
