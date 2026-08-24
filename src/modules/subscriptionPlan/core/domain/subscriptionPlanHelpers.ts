/** Planes otorgados manualmente o internos; no se reconcilian contra MercadoPago. */
export const isInternalPreapprovalId = (
  mpPreapprovalId: string | null | undefined
): boolean => {
  const id = String(mpPreapprovalId ?? "");
  return id.startsWith("owner-") || id.startsWith("admin-");
};

export const isApplePreapprovalId = (
  mpPreapprovalId: string | null | undefined
): boolean => String(mpPreapprovalId ?? "").trim().startsWith("apple-");

export const isMpManagedPreapprovalId = (
  mpPreapprovalId: string | null | undefined
): boolean => {
  const id = String(mpPreapprovalId ?? "").trim();
  return (
    id.length > 0 &&
    !isInternalPreapprovalId(id) &&
    !isApplePreapprovalId(id)
  );
};

export const isMercadoPagoProvider = (
  provider: string | null | undefined
): boolean => String(provider ?? "mercadopago").toLowerCase() === "mercadopago";

/** Próximo cobro según detalle de preapproval de Mercado Pago. */
export const calculateNextPaymentDateFromMpDetail = (
  mpSubscription: any
): Date | null => {
  if (mpSubscription?.next_payment_date) {
    return new Date(mpSubscription.next_payment_date);
  }
  if (!mpSubscription?.auto_recurring?.start_date) {
    return null;
  }

  const start = new Date(mpSubscription.auto_recurring.start_date);
  const freq = mpSubscription.auto_recurring.frequency || 1;
  const type = mpSubscription.auto_recurring.frequency_type || "months";

  const next = new Date(start);
  if (type === "months") {
    next.setMonth(next.getMonth() + freq);
  }
  if (type === "days") {
    next.setDate(next.getDate() + freq);
  }

  return next;
};

/** Elige la fila MP más relevante para sincronizar (misma lógica que reconcile admin). */
export const pickMercadoPagoPlanForSync = (plans: any[]): any | null => {
  const candidates = plans.filter(
    (p) => p?.mpPreapprovalId && isMpManagedPreapprovalId(p.mpPreapprovalId)
  );
  if (!candidates.length) {
    return null;
  }

  const byRecency = (a: any, b: any) => {
    const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (tb !== ta) {
      return tb - ta;
    }
    return Number(b?.id ?? 0) - Number(a?.id ?? 0);
  };

  const sorted = [...candidates].sort(byRecency);
  const newest = sorted[0];
  if (newest?.status === "PENDING") {
    return newest;
  }
  return sorted.find((p) => p.status === "ACTIVE") ?? newest;
};
