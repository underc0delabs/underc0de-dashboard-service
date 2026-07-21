import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildBingoEventMetrics, emptyBingoEventMetrics } from "./bingoEventMetrics.js";

describe("buildBingoEventMetrics", () => {
  it("calculates completion and progress rates", () => {
    const metrics = buildBingoEventMetrics({
      participantCount: 10,
      completedCount: 4,
      raffleEligibleCount: 4,
      totalCheckins: 25,
      standCount: 5,
      drawCount: 1,
      lastDraw: null,
    });

    assert.equal(metrics.inProgressCount, 6);
    assert.equal(metrics.completionRate, 40);
    assert.equal(metrics.averageCheckinsPerParticipant, 2.5);
    assert.equal(metrics.averageProgressPercent, 50);
  });

  it("returns zeros for empty events", () => {
    const metrics = emptyBingoEventMetrics(3);
    assert.equal(metrics.participantCount, 0);
    assert.equal(metrics.completionRate, 0);
    assert.equal(metrics.averageProgressPercent, 0);
  });
});
