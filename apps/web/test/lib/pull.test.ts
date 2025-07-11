import { describe, it, expect } from "vitest";
import { mockPull } from "../testing/data";
import { computeSize } from "../../app/lib/pull";

describe("computeSize", () => {
  it("should return the size of a pull request", () => {
    expect(computeSize(mockPull({ additions: 1 }))).toBe("XS");
    expect(computeSize(mockPull({ deletions: 30 }))).toBe("M");
    expect(computeSize(mockPull({ additions: 500, deletions: 500 }))).toBe(
      "XXL",
    );
  });
});
