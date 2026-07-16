import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isInternalPreapprovalId,
  isMpManagedPreapprovalId,
} from "./subscriptionPlanHelpers.js";

describe("subscriptionPlanHelpers", () => {
  it("isInternalPreapprovalId owner and admin", () => {
    assert.equal(isInternalPreapprovalId("owner-42"), true);
    assert.equal(isInternalPreapprovalId("admin-99"), true);
    assert.equal(isInternalPreapprovalId("abc123"), false);
  });

  it("isMpManagedPreapprovalId", () => {
    assert.equal(isMpManagedPreapprovalId("abc123"), true);
    assert.equal(isMpManagedPreapprovalId("owner-1"), false);
    assert.equal(isMpManagedPreapprovalId(""), false);
  });
});
