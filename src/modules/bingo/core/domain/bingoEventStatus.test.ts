import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  canActivateBingoEvent,
  isBingoEventClosed,
  normalizeBingoEventStatus,
} from "./bingoEventStatus.js";

describe("bingoEventStatus", () => {
  it("normalizes casing and whitespace", () => {
    assert.equal(normalizeBingoEventStatus(" CLOSED "), "closed");
  });

  it("allows reactivation for closed events", () => {
    assert.equal(canActivateBingoEvent("closed"), true);
    assert.equal(canActivateBingoEvent("CLOSED"), true);
    assert.equal(isBingoEventClosed("closed"), true);
    assert.equal(canActivateBingoEvent("active"), false);
  });
});
