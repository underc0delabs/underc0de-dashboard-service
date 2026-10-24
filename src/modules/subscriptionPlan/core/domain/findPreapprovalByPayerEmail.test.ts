import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { findPreapprovalByPayerEmail } from "./findPreapprovalByPayerEmail.js";

const sub = (id: string, email: string, status: string, date = "2026-03-01") =>
  ({ id, payer_email: email, status, date_created: date }) as any;

describe("findPreapprovalByPayerEmail", () => {
  it("encuentra la suscripción authorized por email (sin distinguir mayúsculas)", async () => {
    const r = await findPreapprovalByPayerEmail(
      [sub("a", "Pepe@Test.com", "authorized")],
      " pepe@test.com ",
      "5",
      async () => null
    );
    assert.deepEqual(r, { kind: "found", preapprovalId: "a" });
  });

  it("elige la más reciente entre varias authorized", async () => {
    const r = await findPreapprovalByPayerEmail(
      [
        sub("old", "p@t.com", "authorized", "2026-01-01"),
        sub("new", "p@t.com", "authorized", "2026-04-01"),
      ],
      "p@t.com",
      "5",
      async () => null
    );
    assert.deepEqual(r, { kind: "found", preapprovalId: "new" });
  });

  it("permite una ya vinculada al mismo usuario", async () => {
    const r = await findPreapprovalByPayerEmail(
      [sub("a", "p@t.com", "authorized")],
      "p@t.com",
      "5",
      async () => 5
    );
    assert.equal(r.kind, "found");
  });

  it("no permite reclamar una vinculada a otro usuario", async () => {
    const r = await findPreapprovalByPayerEmail(
      [sub("a", "p@t.com", "authorized")],
      "p@t.com",
      "5",
      async () => 9
    );
    assert.deepEqual(r, { kind: "not_found" });
  });

  it("salta la ajena y usa otra libre del mismo email", async () => {
    const r = await findPreapprovalByPayerEmail(
      [
        sub("ajena", "p@t.com", "authorized", "2026-04-01"),
        sub("libre", "p@t.com", "authorized", "2026-03-01"),
      ],
      "p@t.com",
      "5",
      async (id) => (id === "ajena" ? 9 : null)
    );
    assert.deepEqual(r, { kind: "found", preapprovalId: "libre" });
  });

  it("not_active si solo hay canceladas", async () => {
    const r = await findPreapprovalByPayerEmail(
      [sub("a", "p@t.com", "cancelled")],
      "p@t.com",
      "5",
      async () => null
    );
    assert.deepEqual(r, { kind: "not_active" });
  });

  it("not_found si no hay ese email o está vacío", async () => {
    assert.deepEqual(
      await findPreapprovalByPayerEmail([sub("a", "x@t.com", "authorized")], "p@t.com", "5", async () => null),
      { kind: "not_found" }
    );
    assert.deepEqual(
      await findPreapprovalByPayerEmail([], "", "5", async () => null),
      { kind: "not_found" }
    );
  });
});
