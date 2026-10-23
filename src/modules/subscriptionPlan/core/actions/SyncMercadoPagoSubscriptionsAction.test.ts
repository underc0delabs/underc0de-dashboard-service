import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SyncMercadoPagoSubscriptionsAction } from "./SyncMercadoPagoSubscriptionsAction.js";

const build = (detailStatus: string | "throw") => {
  const plan: any = {
    id: 1,
    userId: 5,
    status: "ACTIVE",
    provider: "mercadopago",
    mpPreapprovalId: "mp-1",
  };
  const user: any = { id: 5, is_pro: true, subscriptionPlans: [plan] };
  const planEdits: any[] = [];
  const userEdits: any[] = [];
  const action = SyncMercadoPagoSubscriptionsAction(
    {
      // La búsqueda de MP vino incompleta: no incluye mp-1.
      syncSubscriptions: async () => [],
      getPreapprovalById: async () => {
        if (detailStatus === "throw") throw new Error("MP caído");
        return { id: "mp-1", status: detailStatus };
      },
      syncPayments: async () => [],
    } as any,
    {
      get: async (q: any) => ({
        subscriptionPlans: q?.page_number ? [] : [plan],
      }),
      edit: async (data: any) => {
        planEdits.push(data);
      },
    } as any,
    {} as any,
    {
      get: async () => ({ users: [user] }),
      edit: async (data: any) => {
        userEdits.push(data);
        return [1];
      },
    } as any
  );
  return { action, planEdits, userEdits };
};

describe("SyncMercadoPagoSubscriptionsAction - plan ausente de la búsqueda", () => {
  it("no cancela ni revoca si el detalle en MP sigue authorized", async () => {
    const { action, planEdits, userEdits } = build("authorized");
    const res = await action.execute();
    assert.equal(res.stalePlansCancelled, 0);
    assert.equal(res.usersRevoked, 0);
    assert.equal(planEdits.length, 0);
    assert.equal(userEdits.length, 0);
  });

  it("no cancela si no se puede verificar en MP", async () => {
    const { action, planEdits } = build("throw");
    const res = await action.execute();
    assert.equal(res.stalePlansCancelled, 0);
    assert.equal(planEdits.length, 0);
  });

  it("cancela y revoca si MP confirma que ya no está authorized", async () => {
    const { action, planEdits, userEdits } = build("cancelled");
    const res = await action.execute();
    assert.equal(res.stalePlansCancelled, 1);
    assert.equal(res.usersRevoked, 1);
    assert.equal(planEdits[0].status, "CANCELLED");
    assert.equal(userEdits.at(-1).is_pro, false);
  });
});
