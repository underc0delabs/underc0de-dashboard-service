import {
  isInternalPreapprovalId,
  isMpManagedPreapprovalId,
} from "../../../subscriptionPlan/core/domain/subscriptionPlanHelpers.js";

const toPlanRow = (sub: any) =>
  sub && typeof sub.toJSON === "function" ? sub.toJSON() : sub;

/** PRO otorgado desde el panel (admin-*) o collector (owner-*), sin MercadoPago. */
export const userHasActiveInternalGrant = (
  plans: any[] | undefined
): boolean => {
  if (!plans?.length) return false;
  return plans
    .map(toPlanRow)
    .some(
      (p) =>
        p?.status === "ACTIVE" &&
        isInternalPreapprovalId(p.mpPreapprovalId)
    );
};

export const resolveUserVip = (params: {
  is_pro: boolean | number | null | undefined;
  activeSubscription: any | null;
  cancelledSubscription: any | null;
  isUpToDate: boolean | null;
  subscriptionPlans?: any[];
}): boolean => {
  if (userHasActiveInternalGrant(params.subscriptionPlans)) {
    return true;
  }

  const userIsPro = Boolean(params.is_pro);
  const active = params.activeSubscription;
  const cancelled = params.cancelledSubscription;

  const paidActiveSubscription =
    !!active &&
    active.status === "ACTIVE" &&
    (active.provider === "apple" ||
      isMpManagedPreapprovalId(active.mpPreapprovalId));

  const activeProVip =
    !!active &&
    (userIsPro || params.isUpToDate !== false || paidActiveSubscription);

  const proFromCancelled = !!cancelled && params.isUpToDate === true;

  return (
    activeProVip ||
    proFromCancelled ||
    (userIsPro && !active && !cancelled)
  );
};

/** No pisar is_pro=false de MP si el usuario tiene grant interno activo. */
export const resolveIsProAfterMpSync = (
  mpWouldBePro: boolean,
  plans: any[] | undefined
): boolean => mpWouldBePro || userHasActiveInternalGrant(plans);

/** Fecha lejana para suscripciones vitalicias / admin (sin cobro MP). */
export const lifetimeNextPaymentDate = (): Date =>
  new Date("2099-12-31T00:00:00.000Z");

const planRecency = (p: any): number =>
  p?.createdAt ? new Date(p.createdAt).getTime() : 0;

/**
 * Plan PENDING más reciente que debe mostrarse cuando no hay ACTIVE y es más nuevo que el último
 * CANCELLED. Sin esto, un checkout pagado pero aún no sincronizado se ve como "cancelada" y la app
 * no dispara el refresh (solo lo hace ante PENDING).
 */
export const pickPendingToDisplay = (
  plans: any[] | undefined,
  activeSubscription: any | null,
  cancelledSubscription: any | null
): any | null => {
  if (activeSubscription || !plans?.length) return null;
  const pendings = plans.map(toPlanRow).filter((p) => p?.status === "PENDING");
  if (!pendings.length) return null;
  const latest = pendings.reduce((best, p) => {
    const bt = planRecency(best);
    const pt = planRecency(p);
    if (pt > bt) return p;
    if (pt === bt && Number(p?.id) > Number(best?.id)) return p;
    return best;
  });
  if (!cancelledSubscription) return latest;
  const lt = planRecency(latest);
  const ct = planRecency(cancelledSubscription);
  return lt > ct || (lt === ct && Number(latest.id) > Number(cancelledSubscription.id))
    ? latest
    : null;
};

/** Vista `subscription` para un PENDING a mostrar (solo si el usuario no es VIP). */
export const buildPendingSubscriptionView = (
  plans: any[] | undefined,
  activeSubscription: any | null,
  cancelledSubscription: any | null,
  vip: boolean
) => {
  if (vip) return null;
  const pending = pickPendingToDisplay(
    plans,
    activeSubscription,
    cancelledSubscription
  );
  if (!pending) return null;
  return {
    id: pending.id,
    status: "PENDING",
    rawStatus: "PENDING",
    provider: pending.provider ?? "mercadopago",
    startedAt: pending.startedAt,
    nextPaymentDate: pending.nextPaymentDate ?? null,
    isUpToDate: null,
    lastPayment: null,
  };
};
