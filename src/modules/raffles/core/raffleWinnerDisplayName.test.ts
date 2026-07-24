import assert from "node:assert/strict";
import test from "node:test";
import { formatWinnerDisplayName } from "./raffleWinnerDisplayName.js";

test("formatWinnerDisplayName uses name, lastname and username", () => {
  assert.equal(
    formatWinnerDisplayName({
      name: "Juan",
      lastname: "Pérez",
      username: "juanp",
    }),
    "Juan Pérez (juanp)",
  );
});

test("formatWinnerDisplayName omits empty lastname", () => {
  assert.equal(
    formatWinnerDisplayName({
      name: "Juan",
      lastname: "",
      username: "juanp",
    }),
    "Juan (juanp)",
  );
});

test("formatWinnerDisplayName falls back to username only", () => {
  assert.equal(
    formatWinnerDisplayName({
      name: "",
      lastname: null,
      username: "juanp",
    }),
    "juanp",
  );
});

test("formatWinnerDisplayName falls back to Participante", () => {
  assert.equal(formatWinnerDisplayName({}), "Participante");
});
