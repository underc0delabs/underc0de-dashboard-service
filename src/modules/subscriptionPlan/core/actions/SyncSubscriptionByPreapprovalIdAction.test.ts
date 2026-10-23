import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SyncSubscriptionByPreapprovalIdAction } from "./SyncSubscriptionByPreapprovalIdAction.js";

const build = (dbStatus: string, mpStatus: string) => {
  const plan: any = { id: 10, userId: 5, status: dbStatus, mpPreapprovalId: "mp-1" };
  const user: any = { id: 5, is_pro: false, subscriptionPlans: [plan] };
  const edits: any[] = [];
  const userEdits: any[] = [];
  const action = SyncSubscriptionByPreapprovalIdAction(
    {
      getById: async () => user,
      edit: async (data: any) => {
        userEdits.push(data);
        return [1];
      },
    } as any,
    {
      getOne: async () => plan,
      get: async () => ({ subscriptionPlans: [] }),
      edit: async (data: any) => {
        edits.push(data);
      },
    } as any,
    {
      getPreapprovalById: async () => ({ id: "mp-1", status: mpStatus }),
    } as any
  );
  return { action, edits, userEdits };
};

describe("SyncSubscriptionByPreapprovalIdAction", () => {
  it("reactiva una fila CANCELLED cuando MP la informa authorized", async () => {
    const { action, edits, userEdits } = build("CANCELLED", "authorized");
    const res = await action.execute("mp-1");
    assert.equal(res.success, true);
    assert.equal(res.subscription_status, "ACTIVE");
    assert.equal(res.user_is_pro, true);
    assert.equal(edits.at(-1).status, "ACTIVE");
    assert.equal(userEdits.at(-1).is_pro, true);
  });

  it("reactiva una fila PAYMENT_FAILED cuando MP la informa authorized", async () => {
    const { action } = build("PAYMENT_FAILED", "authorized");
    const res = await action.execute("mp-1");
    assert.equal(res.subscription_status, "ACTIVE");
  });

  it("cancela una fila ACTIVE cuando MP la informa cancelled", async () => {
    const { action, userEdits } = build("ACTIVE", "cancelled");
    const res = await action.execute("mp-1");
    assert.equal(res.subscription_status, "CANCELLED");
    assert.equal(userEdits.at(-1).is_pro, false);
  });
});
