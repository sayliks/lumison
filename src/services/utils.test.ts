import { describe, expect, it } from "vitest";

import { formatTime, shuffleArray } from "./utils";

describe("local utility services", () => {
  it("formats playback time without network access", () => {
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(65)).toBe("1:05");
    expect(formatTime(Number.NaN)).toBe("0:00");
  });

  it("shuffles without mutating the original array", () => {
    const input = [1, 2, 3, 4];
    const output = shuffleArray(input);

    expect(input).toEqual([1, 2, 3, 4]);
    expect([...output].sort()).toEqual(input);
  });
});
