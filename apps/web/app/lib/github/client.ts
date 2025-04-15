import { Octokit } from "octokit";
import { throttling } from "@octokit/plugin-throttling";
import {
  PullState,
  type Pull,
  type Team,
  type User,
  CiState,
  type Review,
} from "~/lib/pull";
import { prepareQuery } from "./search";
import { env } from "~/lib/env.server";

const MAX_PULLS_TO_FETCH = 50;

const MyOctokit = Octokit.plugin(throttling);

export interface GitHubClient {
  getUser(): Promise<User>;
  searchPulls(search: string): Promise<Pull[]>;
}

type GHPull = {
  id: string;
  number: number;
  title: string;
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
  reviewRequests: {
    totalCount: number;
    nodes: GHReviewRequest[];
  };
  latestOpinionatedReviews: {
    totalCount: number;
    nodes: GHReview[];
  };
  comments: {
    totalCount: number;
  };
};

type GHReviewRequest = {
  requestedReviewer:
    | ({ __typename: "Bot" | "Mannequin" | "User" } & GHUser)
    | ({ __typename: "Team" } & GHTeam);
};

type GHReview = {
  id: string;
  author: GHUser | null;
  state:
    | "PENDING"
    | "COMMENTED"
    | "APPROVED"
    | "CHANGES_REQUESTED"
    | "DISMISSED";
  createdAt: string;
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

type GHTeam = {
  id: string;
  name: string;
  combinedSlug: string;
};

export function getGitHubClient(auth: string): GitHubClient {
  return new HttpGitHubClient({ auth, baseUrl: env.GITHUB_API_URL });
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

  async searchPulls(search: string): Promise<Pull[]> {
    const query = `query dashboard($search: String!) {
      search(query: $search, type: ISSUE, first: ${MAX_PULLS_TO_FETCH}) {
        issueCount
        edges {
          node {
            ... on PullRequest {
              id
              number
              title
              author {
                login
                avatarUrl                  
              }
              statusCheckRollup {
                state
              }
              reviewRequests(first: 100) {
                nodes {
                  requestedReviewer {
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
                    ... on Team {
                      id
                      name
                      combinedSlug
                    }
                  }
                }
              }
              latestOpinionatedReviews(first: 100, writersOnly: true) {
                nodes {
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
                  state
                  createdAt
                }
              }
              comments {
                totalCount
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
              totalCommentsCount
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
    });
    return data.search.edges
      .map((edge) => edge.node)
      .map((pull) => ({
        id: pull.id,
        repo: pull.repository.nameWithOwner,
        number: pull.number,
        title: pull.title,
        state: pull.isDraft
          ? PullState.Draft
          : pull.merged
            ? PullState.Merged
            : pull.closed
              ? PullState.Closed
              : pull.reviewDecision == "APPROVED"
                ? PullState.Approved
                : PullState.Pending,
        ciState:
          pull.statusCheckRollup?.state == "ERROR"
            ? CiState.Error
            : pull.statusCheckRollup?.state == "FAILURE"
              ? CiState.Failure
              : pull.statusCheckRollup?.state == "SUCCESS"
                ? CiState.Success
                : // Do not differentiate between "Pending" and "Expected".
                  pull.statusCheckRollup?.state == "PENDING"
                  ? CiState.Pending
                  : pull.statusCheckRollup?.state == "EXPECTED"
                    ? CiState.Pending
                    : CiState.None,
        createdAt: new Date(pull.createdAt),
        updatedAt: new Date(pull.updatedAt),
        url: pull.url,
        additions: pull.additions,
        deletions: pull.deletions,
        comments: pull.comments.totalCount,
        author: this.makeUser(pull.author),
        requestedReviewers: pull.reviewRequests.nodes
          .map((n) => n.requestedReviewer)
          .filter((r) => r.__typename != "Team")
          .map((r) => this.makeUser(r as GHUser)),
        requestedTeams: pull.reviewRequests.nodes
          .map((n) => n.requestedReviewer)
          .filter((r) => r.__typename == "Team")
          .map((r) => this.makeTeam(r as GHTeam)),
        reviews: pull.latestOpinionatedReviews.nodes.map((n) =>
          this.makeReview(n),
        ),
      }));
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

  private makeTeam(team: GHTeam): Team {
    return { id: team.id, slug: team.combinedSlug, name: team.name };
  }

  private makeReview(review: GHReview): Review {
    return {
      author: review.author !== null ? this.makeUser(review.author) : undefined,
      createdAt: new Date(review.createdAt),
      lgtm: review.state === "APPROVED",
    };
  }
}
