import { type GitHubClient } from "~/lib/github/client";
import { type Team, type Pull, type User } from "~/lib/pull";

export class FakeGitHubClient implements GitHubClient {
  private pullsBySearch: Record<string, Pull[]> = {};

  getUser(): Promise<User> {
    return Promise.resolve({
      id: "u1",
      login: "octocat",
      name: "Octocat",
      avatarUrl: "",
      bot: false,
    });
  }

  getTeams(): Promise<Team[]> {
    return Promise.resolve([
      {
        id: "t1",
        slug: "critic",
        name: "Critic",
      },
    ]);
  }

  searchPulls(search: string, limit: number): Promise<Pull[]> {
    return Promise.resolve((this.pullsBySearch[search] || []).slice(0, limit));
  }

  getPull(repo: string, number: number): Promise<Pull | null> {
    return Promise.resolve(null);
  }

  getDiff(repo: string, number: number): Promise<string | null> {
    return Promise.resolve(null);
  }

  setPullsBySearch(search: string, pulls: Pull[]) {
    this.pullsBySearch[search] = pulls;
  }

  clear(): void {
    this.pullsBySearch = {};
  }
}
