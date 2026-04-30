import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { inferForumUsernameExists } from "./forumUsernameLookupGateway.js";

describe("inferForumUsernameExists", () => {
  it("reads top-level exists", () => {
    assert.equal(inferForumUsernameExists({ exists: true }), true);
    assert.equal(inferForumUsernameExists({ exists: false }), false);
  });

  it("reads nested result.exists", () => {
    assert.equal(
      inferForumUsernameExists({
        success: true,
        result: { exists: false, available: true },
      }),
      false
    );
  });

  it("interprets available as inverse", () => {
    assert.equal(
      inferForumUsernameExists({
        result: { available: false },
      }),
      true
    );
  });

  it("returns null when unknown shape", () => {
    assert.equal(inferForumUsernameExists({}), null);
    assert.equal(inferForumUsernameExists(null), null);
  });
});
