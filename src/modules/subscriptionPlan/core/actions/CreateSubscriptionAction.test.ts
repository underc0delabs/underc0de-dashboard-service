import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CreateSubscriptionAction } from "./CreateSubscriptionAction.js";

const build = (pendingMpStatus: string) => {
  const pending: any = { id: 7, userId: 5, status: "PENDING", mpPreapprovalId: "mp-old" };
  const edits: any[] = [];
  const saved: any[] = [];
  const userEdits: any[] = [];
  let created = 0;
  const action = CreateSubscriptionAction(
    {
      getPreapprovalById: async () => ({ id: "mp-old", status: pendingMpStatus }),
      createPreapproval: async () => {
        created++;
        return { id: "mp-new", init_point: "https://mp/checkout", status: "pending" };
      },
    } as any,
    {
      get: async () => ({ subscriptionPlans: [pending] }),
      edit: async (data: any, id: string) => {
        edits.push({ ...data, id });
      },
      save: async (data: any) => {
        saved.push(data);
      },
    } as any,
    {
      getById: async () => ({ id: 5, email: "u@test.com" }),
      edit: async (data: any) => {
        userEdits.push(data);
      },
    } as any,
    { getByKey: async () => ({ value: "3000" }) } as any
  );
  return { action, edits, saved, userEdits, getCreated: () => created };
};

describe("CreateSubscriptionAction - checkouts pendientes previos", () => {
  it("no cancela ni duplica un checkout previo que MP ya tiene authorized", async () => {
    const { action, edits, saved, userEdits, getCreated } = build("authorized");
    const res = await action.execute({ userId: "5" });
    assert.equal(res.already_active, true);
    assert.equal(res.preapproval_id, "mp-old");
    assert.equal(res.init_point, null);
    assert.deepEqual(edits.map((e) => e.status), ["ACTIVE"]);
    assert.equal(userEdits.at(-1).is_pro, true);
    assert.equal(getCreated(), 0);
    assert.equal(saved.length, 0);
  });

  it("cancela el checkout previo si sigue pendiente y crea uno nuevo", async () => {
    const { action, edits, saved, getCreated } = build("pending");
    const res = await action.execute({ userId: "5" });
    assert.equal(res.preapproval_id, "mp-new");
    assert.deepEqual(edits.map((e) => e.status), ["CANCELLED"]);
    assert.equal(getCreated(), 1);
    assert.equal(saved.length, 1);
  });
});
