import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { LinkSubscriptionAction } from "./LinkSubscriptionAction.js";

const build = (opts: { rows?: Record<string, any>; mp: any[]; detail?: any }) => {
  const userEdits: any[] = [];
  const saved: any[] = [];
  const action = LinkSubscriptionAction(
    {
      getById: async () => ({ id: 5, email: "app@t.com", mercadopago_email: null }),
      edit: async (data: any) => {
        userEdits.push(data);
      },
    } as any,
    {
      getOne: async ({ mpPreapprovalId }: any) => opts.rows?.[mpPreapprovalId] ?? null,
      save: async (data: any) => {
        saved.push(data);
        return { id: 99, ...data };
      },
    } as any,
    { get: async () => ({ payments: [] }) } as any,
    {
      getSuscriptions: async () => opts.mp,
      getPreapprovalById: async (id: string) =>
        opts.detail ?? { id, status: "authorized", payer_id: 77, date_created: "2026-03-01" },
    } as any
  );
  return { action, userEdits, saved };
};

describe("LinkSubscriptionAction por email de Mercado Pago", () => {
  it("vincula por email, activa PRO y guarda el email de MP", async () => {
    const { action, userEdits, saved } = build({
      mp: [{ id: "mp-9", payer_email: "Otro@mp.com", status: "authorized", date_created: "2026-03-01" }],
    });
    await action.execute({ suscriptionCode: "otro@mp.com", userId: "5", email: "app@t.com" });
    assert.equal(saved[0].mpPreapprovalId, "mp-9");
    assert.equal(userEdits[0].is_pro, true);
    assert.equal(userEdits[0].mercadopago_email, "otro@mp.com");
  });

  it("rechaza si el email no tiene suscripción activa", async () => {
    const { action } = build({ mp: [] });
    await assert.rejects(
      action.execute({ suscriptionCode: "nadie@mp.com", userId: "5" }),
      /No encontramos una suscripción activa/
    );
  });

  it("rechaza si la suscripción pertenece a otro usuario", async () => {
    const { action } = build({
      mp: [{ id: "mp-9", payer_email: "o@mp.com", status: "authorized", date_created: "2026-03-01" }],
      rows: { "mp-9": { userId: 9, status: "ACTIVE", toJSON() { return this; } } },
    });
    await assert.rejects(
      action.execute({ suscriptionCode: "o@mp.com", userId: "5" }),
      /No encontramos una suscripción activa/
    );
  });

  it("sigue aceptando un código de preapproval", async () => {
    const { action, saved } = build({ mp: [] });
    await action.execute({ suscriptionCode: "mp-123", userId: "5" });
    assert.equal(saved[0].mpPreapprovalId, "mp-123");
  });
});
