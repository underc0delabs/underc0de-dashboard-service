import assert from "node:assert/strict";
import test from "node:test";
import {
  deadlineToInstant,
  isDeadlinePassed,
  parseAdminDateTime,
} from "./raffleDateTime.js";

test("parseAdminDateTime interprets datetime-local as Argentina", () => {
  const date = parseAdminDateTime("2026-07-14T22:16", "participationDeadline");
  assert.equal(date.toISOString(), "2026-07-15T01:16:00.000Z");
});

test("isDeadlinePassed is true exactly at deadline", () => {
  const deadline = parseAdminDateTime("2026-07-14T22:16", "participationDeadline");
  const deadlineMs = deadlineToInstant(deadline);
  assert.equal(isDeadlinePassed(deadline, deadlineMs!), true);
});

test("isDeadlinePassed is false one millisecond before deadline", () => {
  const deadline = parseAdminDateTime("2026-07-14T22:16", "participationDeadline");
  const deadlineMs = deadlineToInstant(deadline);
  assert.equal(isDeadlinePassed(deadline, deadlineMs! - 1), false);
});
