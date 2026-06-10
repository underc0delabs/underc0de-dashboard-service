import crypto from "crypto";
import { getFileUrl } from "../../../../helpers/file-url.js";

export interface PublicProfile {
  id: number;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  isPro: boolean;
}

type UserLike = {
  id?: number | string;
  username?: string | null;
  name?: string | null;
  lastname?: string | null;
  avatar?: string | null;
  is_pro?: boolean | null;
};

const fullNameWithoutDuplicate = (
  name?: string | null,
  lastname?: string | null,
): string => {
  const n = (name ?? "").trim();
  const l = (lastname ?? "").trim();
  if (!n) return l;
  if (!l) return n;
  if (n === l) return n;
  if (l && n.endsWith(l)) return n;
  return `${n} ${l}`.trim();
};

export const toPublicProfile = (user: UserLike): PublicProfile => ({
  id: Number(user.id),
  username: String(user.username ?? ""),
  displayName: fullNameWithoutDuplicate(user.name, user.lastname),
  avatarUrl: getFileUrl(user.avatar ?? null),
  isPro: Boolean(user.is_pro),
});

export const generateShareCode = (): string =>
  crypto.randomBytes(18).toString("base64url");
