import { nextMilestone, bestDayIndex } from "@/lib/report";

describe("report helpers", () => {
  it("nextMilestone picks the next threshold above the streak", () => {
    expect(nextMilestone(0)).toBe(3);
    expect(nextMilestone(3)).toBe(7);
    expect(nextMilestone(29)).toBe(30);
    expect(nextMilestone(100)).toBeNull();
  });

  it("bestDayIndex returns the latest day with the most minutes", () => {
    expect(bestDayIndex([0, 0, 0])).toBe(-1);
    expect(bestDayIndex([2, 5, 1])).toBe(1);
    expect(bestDayIndex([5, 2, 5])).toBe(2);
  });
});
