import axios from "axios";
import configs from "../../../../configs.js";
import type { IUserRepository } from "../../../users/core/repository/IMongoUserRepository.js";

import {
  fetchForumUsernameExists,
  type ForumLookupResult,
} from "../../infrastructure/gateways/forumUsernameLookupGateway.js";
import { normalizeUserLookupWhitespace } from "../../../../helpers/userLookupNormalize.js";
import { extractForumUserFromUserDataPayload } from "../../../../helpers/forumUserDataPayload.js";
import L2PartnerForumLink from "../../infrastructure/models/L2PartnerForumLinkModel.js";

export type LookupForumUsernameResult = {
  queriedUsername: string;
  existsAsUnderc0deAppUser: boolean;
  forumMemberExists: boolean | null;
  forumLookup: ForumLookupResult["lookup"];
  forumLookupTransportOk: boolean;
};

export const createLookupForumUsernameForL2Action = (
  userRepository: IUserRepository
) => ({
  async execute(memberNameRaw: string): Promise<LookupForumUsernameResult> {
    const queriedUsername = normalizeUserLookupWhitespace(memberNameRaw);
    if (!queriedUsername) {
      throw new Error("Parámetro memberName requerido");
    }

    const appHit = await userRepository.getOneByUsernameIgnoreCase(
      queriedUsername
    );
    const forum = await fetchForumUsernameExists(queriedUsername);

    return {
      queriedUsername,
      existsAsUnderc0deAppUser: Boolean(appHit),
      forumMemberExists: forum.exists,
      forumLookup: forum.lookup,
      forumLookupTransportOk: forum.ok,
    };
  },
});

export type FinalizeL2ForumLinkInput = {
  l2UserExternalId: string;
  forumJwt: string;
};

export const finalizeL2ForumLink = async (
  input: FinalizeL2ForumLinkInput
): Promise<Record<string, unknown>> => {
  const l2UserExternalId = input.l2UserExternalId?.trim();
  const forumJwt = input.forumJwt?.trim();

  if (!l2UserExternalId) throw new Error("l2AccountId requerido");
  if (!forumJwt) throw new Error("forumJwt requerido");

  const res = await axios.get(configs.forum_api_url, {
    params: { action: "userData" },
    headers: {
      Authorization: `Bearer ${forumJwt}`,
      Accept: "application/json",
    },
    timeout: 12000,
    validateStatus: () => true,
  });

  if (res.status === 429) {
    const err = new Error("Servicio temporalmente saturado") as Error & {
      statusCode?: number;
    };
    err.statusCode = 429;
    throw err;
  }

  if (res.status < 200 || res.status >= 300) {
    const err = new Error("Token del foro inválido o sesión expirada") as Error & {
      statusCode?: number;
    };
    err.statusCode = 401;
    throw err;
  }

  const parsed = extractForumUserFromUserDataPayload(res.data);
  if (!parsed) {
    throw new Error("Respuesta userData incompleta");
  }

  const byForum = await L2PartnerForumLink.findOne({
    where: { forumMemberId: parsed.forumMemberId },
  });
  const forumLinkedL2 = byForum?.get?.("l2UserExternalId");
  if (forumLinkedL2 && String(forumLinkedL2) !== l2UserExternalId) {
    const err = new Error(
      "Este usuario del foro ya está vinculado a otra cuenta L2"
    ) as Error & { statusCode?: number };
    err.statusCode = 409;
    throw err;
  }

  const byL2 = await L2PartnerForumLink.findOne({
    where: { l2UserExternalId },
  });

  const l2ForumId = byL2?.get?.("forumMemberId");
  if (
    l2ForumId &&
    String(l2ForumId) !== parsed.forumMemberId
  ) {
    const err = new Error(
      "Esta cuenta L2 ya está vinculada a otro usuario del foro"
    ) as Error & { statusCode?: number };
    err.statusCode = 409;
    throw err;
  }

  const emailSnippet =
    parsed.email && parsed.email.includes("@")
      ? parsed.email.split("@")[1]?.slice(0, 48) ?? null
      : null;

  if (byL2 && String(byL2.get("forumMemberId")) === parsed.forumMemberId) {
    console.info("[L2Integration] finalize idempotent OK", {
      l2ExternalIdLen: l2UserExternalId.length,
    });
    return (byL2 as { toJSON: () => Record<string, unknown> }).toJSON();
  }

  const created = await L2PartnerForumLink.create({
    l2UserExternalId,
    forumMemberId: parsed.forumMemberId,
    forumUsernameNormalized: parsed.memberName,
    forumEmailSnippet: emailSnippet,
    linkStatus: "linked",
  });
  console.info("[L2Integration] finalize created", {
    l2ExternalIdLen: l2UserExternalId.length,
  });
  return (created as { toJSON: () => Record<string, unknown> }).toJSON();
};
