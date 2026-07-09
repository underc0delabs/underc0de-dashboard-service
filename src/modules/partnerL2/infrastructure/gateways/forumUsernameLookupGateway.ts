import axios from "axios";
import configs from "../../../../configs.js";

/**
 * Intenta interpretar JSON de api.php para saber si el nombre está tomado.
 * El foro debe exponer una acción coherente (ver FORUM_API_USERNAME_LOOKUP_ACTION).
 */
export const inferForumUsernameExists = (data: unknown): boolean | null => {
  if (data === null || typeof data !== "object") return null;
  const raw = data as Record<string, unknown>;
  const inner = (raw.data ?? raw.result ?? raw) as Record<string, unknown>;

  if (typeof raw.exists === "boolean") return raw.exists;
  if (typeof inner.exists === "boolean") return inner.exists;
  if (typeof inner.member_exists === "boolean") return inner.member_exists;
  if (typeof inner.username_taken === "boolean") return inner.username_taken;
  if (typeof inner.available === "boolean") return !inner.available;
  if (typeof raw.success === "boolean" && typeof inner.found === "boolean")
    return inner.found;
  return null;
};

export type ForumLookupResult = {
  ok: boolean;
  exists: boolean | null;
  lookup: "ok" | "not_configured" | "http_error" | "network_error" | "ambiguous";
};

export const fetchForumUsernameExists = async (
  memberName: string
): Promise<ForumLookupResult> => {
  const action = configs.forum_api_username_lookup_action;
  if (!action) {
    return { ok: true, exists: null, lookup: "not_configured" };
  }

  const serverKey = process.env.FORUM_API_SERVER_KEY?.trim();

  try {
    const res = await axios.get(configs.forum_api_url, {
      params: { action, member_name: memberName },
      timeout: 10000,
      validateStatus: () => true,
      headers: {
        Accept: "application/json",
        ...(serverKey ? { "X-Api-Key": serverKey } : {}),
      },
    });

    if (res.status === 429) {
      return { ok: false, exists: null, lookup: "http_error" };
    }
    if (res.status < 200 || res.status >= 300) {
      return { ok: false, exists: null, lookup: "http_error" };
    }

    const exists = inferForumUsernameExists(res.data);
    return {
      ok: true,
      exists,
      lookup: exists === null ? "ambiguous" : "ok",
    };
  } catch (err) {
    return { ok: false, exists: null, lookup: "network_error" };
  }
};
