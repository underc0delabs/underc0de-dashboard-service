import {
  fetchMessagePosterTimes,
  fetchTopicPosterTimes,
} from "./forumSmfDb.js";

type ForumListItem = Record<string, unknown> & { id_topic?: unknown };
type ForumReplyItem = Record<string, unknown> & { id_msg?: unknown };

const coercePositiveInt = (raw: unknown): number | null => {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) {
    return null;
  }
  return Math.floor(n);
};

export const mergePosterTime = (
  item: Record<string, unknown>,
  fallbackSeconds: number | null,
): Record<string, unknown> => {
  const existing = coercePositiveInt(item.poster_time ?? item.last_post_time);
  if (existing != null) {
    return {
      ...item,
      poster_time: existing,
    };
  }

  if (fallbackSeconds != null) {
    return {
      ...item,
      poster_time: fallbackSeconds,
    };
  }

  return item;
};

export const enrichForumListItems = async (
  items: ForumListItem[],
): Promise<ForumListItem[]> => {
  if (!Array.isArray(items) || items.length === 0) {
    return items;
  }

  const topicIds = items
    .map((item) => coercePositiveInt(item.id_topic))
    .filter((id): id is number => id != null);

  const timestamps = await fetchTopicPosterTimes(topicIds);

  return items.map((item) => {
    const topicId = coercePositiveInt(item.id_topic);
    const fallback = topicId != null ? (timestamps.get(topicId) ?? null) : null;
    return mergePosterTime(item, fallback);
  });
};

export const enrichForumReplyItems = async (
  items: ForumReplyItem[],
): Promise<ForumReplyItem[]> => {
  if (!Array.isArray(items) || items.length === 0) {
    return items;
  }

  const messageIds = items
    .map((item) => coercePositiveInt(item.id_msg))
    .filter((id): id is number => id != null);

  const timestamps = await fetchMessagePosterTimes(messageIds);

  return items.map((item) => {
    const messageId = coercePositiveInt(item.id_msg);
    const fallback =
      messageId != null ? (timestamps.get(messageId) ?? null) : null;
    return mergePosterTime(item, fallback);
  });
};
