import { reverse, zip } from "remeda";

export type User = {
  id: string;
  login: string;
  name: string | null;
  avatarUrl: string | null;
  bot: boolean;
};

export type Team = {
  id: string;
  slug: string;
  name: string;
};

export enum PullState {
  Draft,
  Pending,
  Approved,
  Merged,
  Closed,
}

export enum CiState {
  None,
  Pending,
  Error,
  Failure,
  Success,
}

export type Review = {
  author?: User;
  createdAt: Date;
  lgtm: boolean;
};

export type Pull = {
  id: string;
  repo: string;
  number: number;
  title: string;
  state: PullState;
  ciState: CiState;
  createdAt: Date;
  updatedAt: Date;
  url: string;
  additions: number;
  deletions: number;
  author: User;
  requestedReviewers: User[];
  requestedTeams: Team[];
  reviews: Review[];
};

// Defaults come from Prow:
// https://github.com/kubernetes/test-infra/blob/master/prow/plugins/size/size.go
const thresholds = [10, 30, 100, 500, 1000];
const labels = ["XS", "S", "M", "L", "XL", "XXL"];

const sizes = reverse(
  zip(labels, [0].concat(thresholds)).map((v) => ({
    label: v[0],
    changes: v[1],
  })),
);

export function computeSize(pull: Pull): string {
  const changes = pull.additions + pull.deletions;
  const size =
    sizes.find((s) => changes >= s.changes) || sizes[sizes.length - 1];
  return size.label;
}
