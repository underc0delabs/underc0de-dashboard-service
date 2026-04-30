import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  parsePartnerApiKeyTableFromEnv,
  resolvePartnerIntegrationAuth,
} from "./partnerIntegrationAuth.js";

describe("parsePartnerApiKeyTableFromEnv", () => {
  it("parses valid JSON map", () => {
    const r = parsePartnerApiKeyTableFromEnv('{"l2memories":"secret-a","x":"b"}');
    assert.deepEqual(r, { l2memories: "secret-a", x: "b" });
  });

  it("returns null for invalid", () => {
    assert.equal(parsePartnerApiKeyTableFromEnv(""), null);
    assert.equal(parsePartnerApiKeyTableFromEnv("[]"), null);
  });
});

describe("resolvePartnerIntegrationAuth", () => {
  it("accepts correct client + key in table mode", () => {
    const r = resolvePartnerIntegrationAuth({
      partnerApiKeysJson: { l2memories: "k1" },
      legacySecret: null,
      clientIdHeader: "l2memories",
      incomingKey: "k1",
    });
    assert.strictEqual(r.ok, true);
    if (r.ok) assert.strictEqual(r.clientId, "l2memories");
  });

  it("requires client id when table set", () => {
    const r = resolvePartnerIntegrationAuth({
      partnerApiKeysJson: { l2memories: "k1" },
      legacySecret: null,
      clientIdHeader: undefined,
      incomingKey: "k1",
    });
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.reason, "missing_client_id");
  });

  it("legacy secret without table", () => {
    const r = resolvePartnerIntegrationAuth({
      partnerApiKeysJson: null,
      legacySecret: "solo",
      clientIdHeader: undefined,
      incomingKey: "solo",
    });
    assert.strictEqual(r.ok, true);
    if (r.ok) assert.strictEqual(r.clientId, "legacy");
  });
});
