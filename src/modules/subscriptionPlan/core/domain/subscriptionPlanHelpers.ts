/** Planes otorgados manualmente o internos; no se reconcilian contra MercadoPago. */
export const isInternalPreapprovalId = (
  mpPreapprovalId: string | null | undefined
): boolean => {
  const id = String(mpPreapprovalId ?? "");
  return id.startsWith("owner-") || id.startsWith("admin-");
};

export const isMpManagedPreapprovalId = (
  mpPreapprovalId: string | null | undefined
): boolean => {
  const id = String(mpPreapprovalId ?? "").trim();
  return id.length > 0 && !isInternalPreapprovalId(id);
};
