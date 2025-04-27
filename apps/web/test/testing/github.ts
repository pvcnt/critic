import { type GitHubClient } from "../../app/lib/github/client";
import { type Pull, type User } from "../../app/lib/pull";

export class FakeGitHubClient implements GitHubClient {
  private pullsBySearch: Record<string, Pull[]> = {};

  getUser(): Promise<User> {
    return Promise.resolve({ id: "u1", login: "test", name: "test", avatarUrl: "", bot: false });
  }

  searchPulls(search: string, limit: number): Promise<Pull[]> {
    return Promise.resolve(this.pullsBySearch[search] || []);
  }

  setPullsBySearch(search: string, pulls: Pull[]) {
    this.pullsBySearch[search] = pulls;
  }

  clear(): void {
    this.pullsBySearch = {};
  }
}
