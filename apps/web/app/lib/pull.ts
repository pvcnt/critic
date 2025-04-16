import { reverse, zip } from "remeda";
import z from "zod";

const UserSchema = z.object({
  id: z.string(),
  login: z.string(),
  name: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  bot: z.boolean(),
});
export type User = z.infer<typeof UserSchema>;

const TeamSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
});
export type Team = z.infer<typeof TeamSchema>;

const ReviewSchema = z.object({
  author: UserSchema.optional(),
  createdAt: z.coerce.date(),
  lgtm: z.boolean(),
});
export type Review = z.infer<typeof ReviewSchema>;

export const PullSchema = z.object({
  id: z.string(),
  repo: z.string(),
  number: z.number(),
  title: z.string(),
  state: z.enum(["draft", "pending", "approved", "merged", "closed"]),
  ciState: z.enum(["none", "pending", "error", "failure", "success"]),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  url: z.string(),
  additions: z.number(),
  deletions: z.number(),
  author: UserSchema,
  requestedReviewers: z.array(UserSchema),
  requestedTeams: z.array(TeamSchema),
  reviews: z.array(ReviewSchema),
});
export type Pull = z.infer<typeof PullSchema>;

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
