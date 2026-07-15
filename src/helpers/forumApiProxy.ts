import axios from "axios";
import configs from "../configs.js";
import {
  enrichForumListItems,
  enrichForumReplyItems,
} from "./forumTimestampEnricher.js";

type ForumApiPayload = Record<string, unknown> & {
  error?: boolean;
  emsg?: unknown;
};

const forumHeaders = () => {
  const serverKey = process.env.FORUM_API_SERVER_KEY?.trim();
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(serverKey ? { "X-Api-Key": serverKey } : {}),
  };
};

const postForumAction = async (
  action: "list" | "replies",
  body: Record<string, unknown>,
): Promise<ForumApiPayload> => {
  const response = await axios.post(
    `${configs.forum_api_url}?action=${action}`,
    body,
    {
      timeout: 15000,
      validateStatus: () => true,
      headers: forumHeaders(),
    },
  );

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Forum API ${action} failed with status ${response.status}`);
  }

  const payload = response.data;
  if (!payload || typeof payload !== "object") {
    throw new Error(`Forum API ${action} returned an invalid payload`);
  }

  return payload as ForumApiPayload;
};

export const proxyForumList = async (body: Record<string, unknown>) => {
  const payload = await postForumAction("list", body);
  if (payload.error || !Array.isArray(payload.emsg)) {
    return payload;
  }

  return {
    ...payload,
    emsg: await enrichForumListItems(payload.emsg),
  };
};

export const proxyForumReplies = async (body: Record<string, unknown>) => {
  const payload = await postForumAction("replies", body);
  if (payload.error || !Array.isArray(payload.emsg)) {
    return payload;
  }

  return {
    ...payload,
    emsg: await enrichForumReplyItems(payload.emsg),
  };
};
