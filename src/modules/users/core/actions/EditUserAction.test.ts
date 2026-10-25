import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { EditUserAction } from "./EditUserAction.js";
import { resolveIsProAfterMpSync } from "../domain/userVipPolicy.js";

type Plan = { id: number; userId: number; status: string; mpPreapprovalId: string; [k: string]: any };

const build = (initialPlans: Plan[]) => {
  const plans: Plan[] = initialPlans.map((p) => ({ ...p }));
  let nextId = 100;
  const userEdits: any[] = [];
  const plansRepo: any = {
    get: async (q: any) => ({
      subscriptionPlans: plans.filter(
        (p) =>
          (q.userId == null || String(p.userId) === String(q.userId)) &&
          (q.status == null || p.status === q.status)
      ),
    }),
    getOne: async (q: any) =>
      plans.find((p) => p.mpPreapprovalId === q.mpPreapprovalId) ?? null,
    edit: async (data: any, id: string) => {
      const p = plans.find((x) => String(x.id) === String(id))!;
      Object.assign(p, data);
    },
    save: async (data: any) => {
      const row = { id: nextId++, ...data };
      plans.push(row);
      return row;
    },
  };
  const usersRepo: any = {
    edit: async (data: any) => {
      userEdits.push(data);
    },
    getById: async () => ({ id: 5, is_pro: userEdits.at(-1)?.is_pro, subscriptionPlans: plans }),
  };
  const action = EditUserAction(usersRepo, { hash: (v: string) => v } as any, plansRepo);
  const run = (sub: string) => action.execute({ subscription: sub } as any, "5", { isAdminEdit: true });
  return { action, run, plans, userEdits };
};

describe("EditUserAction - activar/desactivar desde el panel", () => {
  it("activar crea una concesión admin-<id> y NO reutiliza la fila vieja de Mercado Pago", async () => {
    const { run, plans, userEdits } = build([
      { id: 1, userId: 5, status: "CANCELLED", mpPreapprovalId: "mp-old" },
    ]);
    await run("ACTIVE");
    const grant = plans.find((p) => p.mpPreapprovalId === "admin-5")!;
    assert.equal(grant.status, "ACTIVE");
    assert.equal(plans.find((p) => p.id === 1)!.status, "CANCELLED");
    assert.equal(userEdits[0].is_pro, true);
  });

  it("la concesión creada sobrevive a un sync de MP que dice cancelled", async () => {
    const { run, plans } = build([
      { id: 1, userId: 5, status: "CANCELLED", mpPreapprovalId: "mp-old" },
    ]);
    await run("ACTIVE");
    // Un sync solo opera sobre la fila de MP (su id real); la concesión es otra fila.
    const mpRow = plans.find((p) => p.mpPreapprovalId === "mp-old")!;
    mpRow.status = "CANCELLED";
    assert.equal(resolveIsProAfterMpSync(false, plans), true);
  });

  it("activar de nuevo reutiliza la concesión existente sin duplicarla", async () => {
    const { run, plans } = build([
      { id: 7, userId: 5, status: "CANCELLED", mpPreapprovalId: "admin-5" },
    ]);
    await run("ACTIVE");
    assert.equal(plans.filter((p) => p.mpPreapprovalId === "admin-5").length, 1);
    assert.equal(plans.find((p) => p.id === 7)!.status, "ACTIVE");
  });

  it("al activar se cancelan otros planes ACTIVE y queda solo la concesión", async () => {
    const { run, plans } = build([
      { id: 1, userId: 5, status: "ACTIVE", mpPreapprovalId: "mp-live" },
    ]);
    await run("ACTIVE");
    const active = plans.filter((p) => p.status === "ACTIVE");
    assert.deepEqual(active.map((p) => p.mpPreapprovalId), ["admin-5"]);
  });

  it("no toca los planes de otro usuario", async () => {
    const { run, plans } = build([
      { id: 1, userId: 9, status: "ACTIVE", mpPreapprovalId: "mp-ajeno" },
    ]);
    await run("ACTIVE");
    assert.equal(plans.find((p) => p.id === 1)!.status, "ACTIVE");
  });

  it("desactivar cancela todos los ACTIVE, incluida la concesión interna", async () => {
    const { run, plans, userEdits } = build([
      { id: 1, userId: 5, status: "ACTIVE", mpPreapprovalId: "admin-5" },
      { id: 2, userId: 5, status: "ACTIVE", mpPreapprovalId: "mp-live" },
      { id: 3, userId: 5, status: "PENDING", mpPreapprovalId: "mp-pend" },
    ]);
    await run("CANCELLED");
    assert.deepEqual(plans.map((p) => p.status), ["CANCELLED", "CANCELLED", "PENDING"]);
    assert.equal(userEdits[0].is_pro, false);
  });

  it("desactivar vence la fecha de cobro para que no quede 'cancelada con acceso'", async () => {
    const future = new Date("2099-12-31T00:00:00.000Z");
    const { run, plans } = build([
      { id: 1, userId: 5, status: "ACTIVE", mpPreapprovalId: "admin-5", nextPaymentDate: future },
      { id: 2, userId: 5, status: "CANCELLED", mpPreapprovalId: "mp-old", nextPaymentDate: future },
      { id: 3, userId: 5, status: "CANCELLED", mpPreapprovalId: "mp-older", nextPaymentDate: new Date("2020-01-01") },
    ]);
    await run("CANCELLED");
    const now = Date.now();
    assert.ok(new Date(plans[0].nextPaymentDate).getTime() < now);
    assert.ok(new Date(plans[1].nextPaymentDate).getTime() < now);
    assert.equal(new Date(plans[2].nextPaymentDate).getTime(), new Date("2020-01-01").getTime());
  });

  it("una edición que no es de admin ignora el estado de suscripción", async () => {
    const { action, plans, userEdits } = build([]);
    await action.execute({ name: "Pepe", subscription: "ACTIVE" } as any, "5", {});
    assert.equal(plans.length, 0);
    assert.equal(userEdits[0].is_pro, undefined);
  });
});
