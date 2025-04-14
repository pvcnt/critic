import { type GitHubClient } from "../../app/lib/github/client";
import { type PullProps, type User } from "../../app/lib/types";

export class FakeGitHubClient implements GitHubClient {
  private pullsBySearch: Record<string, PullProps[]> = {};

  getUser(): Promise<User> {
    return Promise.resolve({ name: "test", avatarUrl: "", bot: false });
  }

  searchPulls(search: string): Promise<PullProps[]> {
    return Promise.resolve(this.pullsBySearch[search] || []);
  }

  setPullsBySearch(search: string, pulls: PullProps[]) {
    this.pullsBySearch[search] = pulls;
  }

  clear(): void {
    this.pullsBySearch = {};
  }
}
