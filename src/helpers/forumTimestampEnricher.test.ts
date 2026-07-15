import assert from "node:assert/strict";
import test from "node:test";
import { mergePosterTime } from "./forumTimestampEnricher.js";

test("mergePosterTime keeps existing poster_time", () => {
  const item = { id_topic: 1, poster_time: 1719950000 };
  const merged = mergePosterTime(item, 1700000000);
  assert.equal(merged.poster_time, 1719950000);
});

test("mergePosterTime uses fallback when poster_time is missing", () => {
  const item = { id_topic: 1 };
  const merged = mergePosterTime(item, 1719950000);
  assert.equal(merged.poster_time, 1719950000);
});

test("mergePosterTime leaves item unchanged without fallback", () => {
  const item = { id_topic: 1 };
  const merged = mergePosterTime(item, null);
  assert.equal(merged.poster_time, undefined);
});
