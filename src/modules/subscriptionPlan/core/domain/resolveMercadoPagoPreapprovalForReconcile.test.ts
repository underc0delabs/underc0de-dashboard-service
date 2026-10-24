import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolveMercadoPagoPreapprovalForReconcile } from "./resolveMercadoPagoPreapprovalForReconcile.js";

describe("resolveMercadoPagoPreapprovalForReconcile", () => {
  it("prefers authorized stored preapproval over cancelled newer row", async () => {
    const service = {
      getPreapprovalById: async (id: string) => {
        if (id === "old-cancelled") {
          return { status: "cancelled", payer_email: "user@test.com" };
        }
        if (id === "active-one") {
          return { status: "authorized", payer_email: "user@test.com", payer_id: 99 };
        }
        return null;
      },
      syncSubscriptions: async () => [],
    };

    const resolved = await resolveMercadoPagoPreapprovalForReconcile(
      service as any,
      { email: "user@test.com" },
      [
        { id: 2, mpPreapprovalId: "old-cancelled", createdAt: "2026-02-01" },
        { id: 1, mpPreapprovalId: "active-one", createdAt: "2026-01-01" },
      ]
    );

    assert.equal(resolved?.preapprovalId, "active-one");
    assert.equal(resolved?.matchSource, "stored_authorized");
  });

  it("finds authorized preapproval in MP search when stored ids are cancelled", async () => {
    const service = {
      getPreapprovalById: async (id: string) => {
        if (id === "old-cancelled") {
          return { status: "cancelled", payer_email: "user@test.com" };
        }
        if (id === "mp-active") {
          return { status: "authorized", payer_email: "user@test.com", payer_id: 77 };
        }
        return null;
      },
      syncSubscriptions: async () => [
        { id: "mp-active", status: "authorized" },
      ],
    };

    const resolved = await resolveMercadoPagoPreapprovalForReconcile(
      service as any,
      { email: "user@test.com", mercadopago_email: "mp@test.com" },
      [{ id: 1, mpPreapprovalId: "old-cancelled", createdAt: "2026-01-01" }]
    );

    assert.equal(resolved?.preapprovalId, "mp-active");
    assert.equal(resolved?.matchSource, "mp_search_by_identity");
  });
});
