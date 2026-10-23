import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isTerminalSubscriptionStatus,
  mapMpCreateStatusToModel,
  mapMpDetailStatusToModel,
} from "./subscriptionStatusPolicy.js";

describe("subscriptionStatusPolicy", () => {
  it("mapMpCreateStatusToModel pending -> PENDING", () => {
    assert.equal(mapMpCreateStatusToModel("pending"), "PENDING");
  });

  it("mapMpCreateStatusToModel authorized -> ACTIVE", () => {
    assert.equal(mapMpCreateStatusToModel("authorized"), "ACTIVE");
  });

  it("mapMpDetailStatusToModel charged_back -> PAYMENT_FAILED", () => {
    assert.equal(mapMpDetailStatusToModel("charged_back"), "PAYMENT_FAILED");
  });

  it("isTerminalSubscriptionStatus", () => {
    assert.equal(isTerminalSubscriptionStatus("CANCELLED"), true);
    assert.equal(isTerminalSubscriptionStatus("ACTIVE"), false);
  });
});
