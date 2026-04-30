/** Extrae usuario foro desde cuerpo JSON típico de api.php action=userData. */

export type ForumJwtUserSlice = {
  forumMemberId: string;
  memberName: string | null;
  email: string | null;
};

export const extractForumUserFromUserDataPayload = (
  data: unknown
): ForumJwtUserSlice | null => {
  if (data === null || typeof data !== "object") return null;
  const raw = data as Record<string, unknown>;
  const payload = (raw.data ?? raw.result ?? raw) as Record<string, unknown>;
  const idRaw =
    payload.id_member ?? payload.member_id ?? payload.idMember ?? raw.id_member;
  if (idRaw === undefined || idRaw === null) return null;
  const forumMemberId = String(idRaw).trim();
  if (!forumMemberId) return null;

  const email = (
    (payload.email_address as string | undefined) ??
    (payload.email as string | undefined) ??
    (raw.email_address as string | undefined) ??
    (raw.email as string | undefined) ??
    ""
  )
    .trim()
    .toLowerCase();

  const mn =
    (payload.member_name as string | undefined) ??
    (payload.memberName as string | undefined);
  const memberNameNorm = mn?.trim?.() ? String(mn).trim() : null;

  return {
    forumMemberId,
    memberName: memberNameNorm,
    email: email || null,
  };
};
