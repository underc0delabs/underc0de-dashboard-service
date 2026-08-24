import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  resolveIsProAfterMpSync,
  resolveUserVip,
  userHasActiveInternalGrant,
} from "./userVipPolicy.js";

describe("userHasActiveInternalGrant", () => {
  it("returns true for active admin-* plan", () => {
    assert.equal(
      userHasActiveInternalGrant([
        { status: "ACTIVE", mpPreapprovalId: "admin-42" },
      ]),
      true
    );
  });

  it("returns false for cancelled admin-* plan", () => {
    assert.equal(
      userHasActiveInternalGrant([
        { status: "CANCELLED", mpPreapprovalId: "admin-42" },
      ]),
      false
    );
  });
});

describe("resolveUserVip", () => {
  it("grants vip for active internal grant even when is_pro is false and dates expired", () => {
    assert.equal(
      resolveUserVip({
        is_pro: false,
        activeSubscription: {
          status: "ACTIVE",
          mpPreapprovalId: "admin-7",
          nextPaymentDate: "2020-01-01",
        },
        cancelledSubscription: null,
        isUpToDate: false,
        subscriptionPlans: [
          { status: "ACTIVE", mpPreapprovalId: "admin-7" },
        ],
      }),
      true
    );
  });

  it("revokes vip when internal grant is cancelled", () => {
    assert.equal(
      resolveUserVip({
        is_pro: false,
        activeSubscription: null,
        cancelledSubscription: {
          status: "CANCELLED",
          mpPreapprovalId: "admin-7",
        },
        isUpToDate: false,
        subscriptionPlans: [
          { status: "CANCELLED", mpPreapprovalId: "admin-7" },
        ],
      }),
      false
    );
  });

  it("grants vip for active Mercado Pago plan even when is_pro false and dates stale", () => {
    assert.equal(
      resolveUserVip({
        is_pro: false,
        activeSubscription: {
          status: "ACTIVE",
          mpPreapprovalId: "mp-preapproval-123",
          provider: "mercadopago",
          nextPaymentDate: "2020-01-01",
        },
        cancelledSubscription: null,
        isUpToDate: false,
        subscriptionPlans: [
          {
            status: "ACTIVE",
            mpPreapprovalId: "mp-preapproval-123",
            provider: "mercadopago",
          },
        ],
      }),
      true
    );
  });

  it("grants vip for active Apple plan even when is_pro false and dates stale", () => {
    assert.equal(
      resolveUserVip({
        is_pro: false,
        activeSubscription: {
          status: "ACTIVE",
          mpPreapprovalId: "apple-abc",
          provider: "apple",
        },
        cancelledSubscription: null,
        isUpToDate: false,
      }),
      true
    );
  });
});

describe("resolveIsProAfterMpSync", () => {
  it("keeps is_pro true when MP says inactive but internal grant is active", () => {
    assert.equal(
      resolveIsProAfterMpSync(false, [
        { status: "ACTIVE", mpPreapprovalId: "admin-99" },
      ]),
      true
    );
  });

  it("sets is_pro false when MP inactive and no internal grant", () => {
    assert.equal(
      resolveIsProAfterMpSync(false, [
        { status: "CANCELLED", mpPreapprovalId: "12345" },
      ]),
      false
    );
  });
});
